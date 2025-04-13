import axios from "axios"

export const axiosInstance = axios.create({
    // baseURL: 'https://t2orimport.meta.env.xjhjd3.execute-api.us-east-1.amazonaws.com', // Aquí pondrías tu endpoint real
    baseURL: "https://quickbite-apigateway.onrender.com", // Aquí pondrías tu endpoint real
});
  