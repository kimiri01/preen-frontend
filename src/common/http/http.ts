import {request} from './client'
import type { HttpRequestOptions } from './types'

type Options = Omit<HttpRequestOptions, 'method' | 'body'>


export const http = {
  get: <T>(path: string, options?: Options) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Options) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Options) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: Options) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Options) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}