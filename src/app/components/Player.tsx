// @ts-ignore
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { Play, Maximize, MonitorPlay, Tv, AlertCircle, LogOut, User } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useTVNavigation } from "../hook/useTvNavigation";
import {API_URLS } from "./api/ApiUrl";
import headerImg from "/src/img/header.png";

const VIDEOS = [
  {
    id: "1",
    title: "Nature Landscape",
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://images.unsplash.com/photo-1617634667039-8e4cb277ab46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzc0MjgyMjg5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "2",
    title: "City Timelapse",
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://images.unsplash.com/photo-1545726869-abf2c118e284?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwdGltZWxhcHNlfGVufDF8fHx8MTc3NDMyMjkwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "3",
    title: "Ocean Waves",
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1514747975201-4715db583da9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHdhdmVzfGVufDF8fHx8MTc3NDMyMjkwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: "4",
    title: "Abstract Motion",
    src: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1648898256587-979d64b818ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG1vdGlvbnxlbnwxfHx8fDE3NzQzMjI5MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  }
];

export function Player() {
  useTVNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || "Administrador";

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    // Tentativa de ativar o Fullscreen nativo da TV (ou do navegador) automaticamente.
    // A interação do usuário na tela de login (clique ou botão Ok) nos dá a permissão necessária para chamar isso.
    const attemptNativeFullscreen = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("Não foi possível ativar o fullscreen nativo automaticamente:", err);
      }
    };
    
    attemptNativeFullscreen();

    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("mvmedia_token");
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(API_URLS.LIST_FILES, {
          method: "GET",
          headers
        });

        if (!response.ok) {
          throw new Error("Falha ao carregar lista de vídeos.");
        }

        const data = await response.json();
        
        // Mapear dados da API para o formato esperado.
        // Como o formato real não foi fornecido no prompt, assumimos que 'data' é um array,
        // e que cada item pode ter id, title, e thumbnail.
        // Caso a API não retorne dados suficientes, criamos valores defaults ou reusamos o id.
        if (Array.isArray(data) && data.length > 0) {
          const mappedVideos = data.map(item => ({
            id: item.id || Math.random().toString(),
            title: item.title || item.name || `Vídeo ${item.id}`,
            // O source passa a ser o endpoint GetToPlay com o id
            src: `${API_URLS.PLAY_FILE}${item.id}`,
            thumbnail: `${API_URLS.GET_TUMB}${item.thumbFileName}`,
          }));
          setVideos(mappedVideos);
        } else {
          throw new Error("Lista de vídeos está vazia.");
        }
      } catch (err: any) {
        console.error("Erro ao buscar vídeos:", err);
        // Fallback: usar mock em ambiente de dev/preview se a chamada real falhar (CORS, offline, etc.)
        console.warn("Usando mock data para vídeos...");
        setApiError("Não foi possível conectar na API. Exibindo arquivos de demonstração.");
        setVideos(VIDEOS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const currentVideo = videos[currentVideoIndex];

  const handleLogout = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    navigate("/");
  };

  useEffect(() => {
    // Reset error state when video changes
    setVideoError(false);
    
    // When the current video index changes, we want to play it.
    if (videoRef.current) {
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.warn("Autoplay was prevented:", error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentVideoIndex]);

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
    // Simulate fullscreen mode through CSS to avoid iframe permissions policy errors
    setIsFullscreen(true);
  };

  const toggleFullscreen = async () => {
    setIsFullscreen(!isFullscreen);
    try {
      if (!isFullscreen) {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } 
      else {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen nativo não pôde ser ativado/desativado:", err);
    }
  };

  const handleEnded = () => {
    if (videos.length <= 1) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(console.error);
      }
    } else {
      // Play next video in the playlist
      const nextIndex = (currentVideoIndex + 1) % videos.length;
      setCurrentVideoIndex(nextIndex);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleUserActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !videoError) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying, videoError]);

  // useEffect(() => {
  //   // Show controls initially or when pausing/error changes
  //   handleUserActivity();
  // }, [handleUserActivity, currentVideoIndex]);

  useEffect(() => {
    const handleGlobalInteraction = () => handleUserActivity();
    window.addEventListener('mousemove', handleGlobalInteraction);
    window.addEventListener('keydown', handleGlobalInteraction);
    return () => {
      window.removeEventListener('mousemove', handleGlobalInteraction);
      window.removeEventListener('keydown', handleGlobalInteraction);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [handleUserActivity]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      {/* Header Area */}
      <header className="relative h-48 md:h-64 flex-shrink-0 overflow-hidden shadow-2xl z-10">
        <ImageWithFallback 
          src={headerImg}
          alt="MVMedia Header Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
        
        <div className="relative h-full px-8 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-blue-600/90 p-5 rounded-2xl shadow-lg shadow-blue-500/20 backdrop-blur-sm">
              <MonitorPlay size={48} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg">
                MVMedia
              </h1>
              <p className="text-xl md:text-2xl text-blue-200 mt-2 font-medium drop-shadow-md flex items-center gap-2">
                <Tv size={24} /> Sistema de Mídia Indoor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-700/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 p-2 rounded-full">
                <User size={20} className="text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Usuário</span>
                <span className="text-white font-bold max-w-[150px] truncate">{username}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-700 mx-2"></div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-colors font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-6 md:p-8 max-w-screen-2xl mx-auto w-full gap-8">
        {apiError && (
           <div className="bg-yellow-500/20 border border-yellow-500/50 p-4 rounded-xl text-yellow-200 flex items-center gap-3">
             <AlertCircle size={24} />
             {apiError}
           </div>
        )}

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 min-h-[500px]">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl">Carregando mídias...</p>
          </div>
        ) : !currentVideo ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 min-h-[500px]">
             <AlertCircle size={48} className="text-red-500" />
             <p className="text-xl">Nenhuma mídia encontrada.</p>
          </div>
        ) : (
          <>
            {/* Main Player Section */}
            <section className={`flex flex-col bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''}`}>
              <div className={`relative w-full bg-black group ${isFullscreen ? 'h-full' : 'aspect-video'}`} onClick={handleUserActivity}>
            {videoError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
                <AlertCircle size={64} className="text-red-500" />
                <p className="text-xl">Erro ao carregar o vídeo.</p>
                <button 
                  onClick={() => handleEnded()}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500"
                >
                  Pular para o próximo
                </button>
              </div>
            ) : (
              <video 
                ref={videoRef}
                src={currentVideo.src}
                thumbnail = {currentVideo.thumbnail}
                className="w-full h-full object-contain"
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setVideoError(true)}
                controls={false} // Custom controls below or click to play/pause
                autoPlay
                loop={videos.length <= 1}
                muted // Muted to allow autoplay in most browsers by default, but can be unmuted
              />
            )}
            
            {/* Custom Overlay Controls that appear on interaction, hover or when paused */}
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isPlaying && !videoError && !showControls ? 'opacity-0' : 'opacity-100'}`}>
              <button 
                onClick={handlePlayPause}
                className="p-6 bg-blue-600/90 hover:bg-blue-500 text-white rounded-full shadow-2xl transform transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:scale-110"
                disabled={videoError}
              >
                <Play size={48} className={isPlaying ? "hidden" : "block ml-2"} />
                {isPlaying && (
                  <div className="w-12 h-12 flex items-center justify-center">
                    <div className="w-4 h-8 border-l-4 border-r-4 border-white mr-1"></div>
                  </div>
                )}
              </button>
            </div>

            {/* Absolute Fullscreen button */}
            <button 
              onClick={toggleFullscreen}
              className={`absolute bottom-6 right-6 p-4 bg-slate-900/80 hover:bg-blue-600 focus:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-400 text-white rounded-xl backdrop-blur-md transition-all shadow-lg ${(!showControls && isFullscreen) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              title="Alternar Tela Cheia"
            >
              <Maximize size={28} />
            </button>
            
            {/* Video Info Overlay */}
            <div className={`absolute top-6 left-6 px-4 py-2 bg-slate-900/80 backdrop-blur-md rounded-lg text-white font-medium shadow-lg transition-opacity ${!showControls && isFullscreen ? 'opacity-0' : 'opacity-100'}`}>
              Reproduzindo: {currentVideo.title}
            </div>
          </div>
          
          <div className={`px-8 py-6 bg-slate-900 flex justify-between items-center border-t border-slate-800 ${isFullscreen ? 'hidden' : ''}`}>
            <div>
              <h2 className="text-2xl font-bold text-white">{currentVideo.title}</h2>
              <p className="text-slate-400 mt-1 text-lg">Mídia em reprodução</p>
            </div>
            <button 
              onClick={toggleFullscreen}
              className="flex items-center gap-3 px-6 py-4 bg-slate-800 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium text-lg focus:outline-none focus:ring-4 focus:ring-blue-500"
            >
              <Maximize size={24} /> Modo TV (Tela Cheia)
            </button>
          </div>
        </section>

        {/* Playlist Section */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-2xl font-bold text-white">Fila de Reprodução</h3>
            <span className="text-slate-400 text-lg">{videos.length} mídias disponíveis</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {videos.map((video, index) => {
              const isSelected = index === currentVideoIndex;
              
              return (
                <button
                  key={video.id}
                  onClick={() => handleVideoSelect(index)}
                  className={`group relative text-left rounded-2xl overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300 transform ${
                    isSelected ? 'ring-4 ring-blue-500 scale-[1.02] shadow-xl shadow-blue-900/20' : 'hover:scale-105 hover:shadow-xl shadow-md'
                  }`}
                >
                  <div className="aspect-video relative overflow-hidden">
                    {console.log("URL thubmnail = ", video.thumbnail)}
                    <img 
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className={`absolute inset-0 transition-colors duration-300 ${
                      isSelected ? 'bg-blue-600/20' : 'bg-slate-900/40 group-hover:bg-transparent'
                    }`} />
                    
                    {/* Play Icon Indicator */}
                    <div className={`absolute inset-0 flex items-center justify-center ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    } transition-opacity`}>
                      <div className="p-3 bg-blue-600/90 text-white rounded-full shadow-lg backdrop-blur-sm">
                        <Play size={24} className={isSelected ? "animate-pulse ml-1" : "ml-1"} />
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 ${isSelected ? 'bg-blue-900/50' : 'bg-slate-800'} transition-colors`}>
                    <h4 className="font-semibold text-lg text-white truncate group-hover:text-blue-400 transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-slate-400 text-sm mt-1">
                      {isSelected ? 'Em exibição' : 'Próximo na fila'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  );
}
