import axios from "axios"
import { getDataCookies } from "../service/CookiesService";
import { DataCookies } from "../../domain/models/cookies/DataCookies";

export const axiosInstance = axios.create({
    // baseURL: "https://quickbite-apigateway.onrender.com", // Aquí pondrías tu endpoint real
    baseURL: "http://localhost:3000", // Aquí pondrías tu endpoint real
});
  

axiosInstance.interceptors.request.use(
    async (config) => {
        // Llamamos a una función asíncrona antes de continuar

        const token = getDataCookies(DataCookies.ACCESSTOKEN);

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
