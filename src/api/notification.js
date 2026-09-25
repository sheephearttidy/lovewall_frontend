import http from './http'

export function getNotifications(params = {}) {
  return http.get('/notifications', { params })
}

export function markAllRead() {
  return http.put('/notifications/read-all')
}

export function markRead(id) {
  return http.put(`/notifications/${id}/read`)
}

export function clearNotifications() {
  return http.delete('/notifications')
}