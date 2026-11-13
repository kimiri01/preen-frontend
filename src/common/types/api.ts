export interface HttpRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}
