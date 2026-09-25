import http from './http'

export function getStats() {
  return http.get('/admin/stats')
}

export function getAdminUsers(params = {}) {
  return http.get('/admin/users', { params })
}

export function createAdminUser(data) {
  return http.post('/admin/users', data)
}

export function updateAdminUser(userId, data) {
  return http.patch(`/admin/users/${userId}`, data)
}

export function deleteAdminUser(userId) {
  return http.delete(`/admin/users/${userId}`)
}

export function getAdminConfessions(params = {}) {
  return http.get('/admin/confessions', { params })
}

export function setConfessionStatus(confessionId, status) {
  return http.patch(`/admin/confessions/${confessionId}/status`, { status })
}

export function deleteAdminConfession(confessionId) {
  return http.delete(`/admin/confessions/${confessionId}`)
}

export function batchDeleteConfessions(ids) {
  return http.post('/admin/confessions/batch-delete', { ids })
}

export function getAdminComments(params = {}) {
  return http.get('/admin/comments', { params })
}

export function deleteAdminComment(commentId) {
  return http.delete(`/admin/comments/${commentId}`)
}

export function batchDeleteComments(ids) {
  return http.post('/admin/comments/batch-delete', { ids })
}

export function getAdminSettings() {
  return http.get('/admin/settings')
}

export function updateAdminSettings(data) {
  return http.put('/admin/settings', data)
}