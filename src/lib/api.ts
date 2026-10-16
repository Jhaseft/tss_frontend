import axios from "axios";
import { getToken } from "./auth";

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  get: <T>(path: string) => client.get<T>(path).then((r) => r.data),
  post: <T>(path: string, body: unknown) =>
    client.post<T>(path, body).then((r) => r.data),
  put: <T>(path: string, body: unknown) =>
    client.put<T>(path, body).then((r) => r.data),
  delete: <T>(path: string) => client.delete<T>(path).then((r) => r.data),
};
