import http from './http'

export function getPublicSettings() {
  return http.get('/settings')
}