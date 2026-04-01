const BASE_URL = "https://mvmedia-api-production.up.railway.app";
// const BASE_URL = "http://localhost:5069";

export const API_URLS = {
    LOGIN: `${BASE_URL}/api/User/Login`,
    LIST_FILES: `${BASE_URL}/api/MediaFile/ListActiveMediaFiles`,
    PLAY_FILE: `${BASE_URL}/api/MediaFile/GetToPlay/`, //ACRESENDTAR O ID DO ARQUIVO
    GET_TUMB: `${BASE_URL}/Videos/` //ACRESCENTAR O FILENAME TUMB DO ARQUIVO DE VIDEO

}