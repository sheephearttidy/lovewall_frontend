import http from './http'

export function getConfessions(params = {}) {
  return http.get('/confessions', { params })
}

export function getConfession(id) {
  return http.get(`/confessions/${id}`)
}

export function postConfession(data) {
  return http.post('/confessions', data)
}

export function deleteConfession(id) {
  return http.delete(`/confessions/${id}`)
}

export function likeConfession(id) {
  return http.put(`/confessions/${id}/like`)
}

export function unlikeConfession(id) {
  return http.delete(`/confessions/${id}/like`)
}

export function addComment(confessionId, data) {
  return http.post(`/confessions/${confessionId}/comments`, data)
}

export function uploadImages(images) {
  return http.post('/upload/images', { images })
}