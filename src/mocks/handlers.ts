import { http, HttpResponse } from "msw";

const API =
  (globalThis.process?.env?.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

export const handlers = [
  http.get(`${API}/health`, () => HttpResponse.json({ status: "ok", version: "0.1.0" })),
];
