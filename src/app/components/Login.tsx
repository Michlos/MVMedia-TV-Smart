import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Tv, MonitorPlay } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useTVNavigation } from "../hook/useTvNavigation";
import { API_URLS } from "./api/ApiUrl";
import headerImg from "/src/img/header.png";

export function Login() {
  useTVNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  //focusbuild 1: focar o username quando login inválido
  const userNameRef = useRef<HTMLInputElement>(null);
  const focusUserName = () => {

    const inputElement = document.getElementById("username") as HTMLInputElement;
    inputElement.focus();
    inputElement.select();
    
    
    
    
  };


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password)  return;

    setIsLoading(true);
    setError("");
    

    try {
      const response = await fetch(API_URLS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        
    
        focusUserName();
        
        throw new Error("Usuário ou senha inválidos");
        

      }

      const data = await response.json();
      
      // Salva o token para uso posterior (ex: chamadas da API de mídia)
      if (data.token) {
        localStorage.setItem("mvmedia_token", data.token);
      }
      
      // Salva dados do usuário
      localStorage.setItem("mvmedia_user", JSON.stringify({
        username: data.username || username,
        isAdmin: data.isAdmin
      }));

      navigate("/player", { state: { username: data.username || username } });
    } catch (err: any) {
      
      console.error("Erro no login:", err);
      focusUserName();
      setError(err.message || "Erro ao conectar com o servidor.");
      
    } finally {
      setIsLoading(false);
    
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden text-slate-100 font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20">
        <ImageWithFallback 
          src={headerImg}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/30" />
      </div>

      <div className="z-10 w-full max-w-md p-10 bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-600 p-4 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <MonitorPlay size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">MVMedia</h1>
          <p className="text-slate-400 mt-2 text-center text-lg">Plataforma de Mídia Indoor</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-xl text-red-200 text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="username">Usuário</label>
            <input 
              ref={userNameRef}
              id="username"
              name="username"
              type="text" 
              placeholder="Digite seu usuário"
              className="w-full px-5 py-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="password">Senha</label>
            <input 
              id="password"
              name="password"
              type="password" 
              placeholder="Digite sua senha"
              className="w-full px-5 py-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 mt-4 text-white font-bold rounded-xl text-xl shadow-lg transition-all transform flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-400 focus:scale-[1.02]
              ${isLoading ? 'bg-blue-800 opacity-70 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25 active:scale-95'}`}
          >
            {isLoading ? (
              <>Carregando... <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></>
            ) : (
              <>Acessar Sistema <Tv size={24} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
