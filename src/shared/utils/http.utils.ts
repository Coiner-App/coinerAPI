import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

export default class HttpUtils {
    static async getWithFallback<T = any>(
        urls: string[], 
        endpoint: string, 
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        let lastError: any;

        for (const baseUrl of urls) {
            try {
                const response = await axios.get<T>(`${baseUrl}${endpoint}`, config);
                return response;
            } catch (error) {
                console.warn(`Network failed for ${baseUrl}, attempting fallback`);
                lastError = error; 
            }
        }
        throw lastError;
    }
}