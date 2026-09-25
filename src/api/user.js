import http from './http'

export function getMe() {
  return http.get('/users/me')
}

export function updateMe(data) {
  return http.patch('/users/me', data)
}

export function changePassword({ oldPassword, newPassword }) {
  return http.put('/users/me/password', { oldPassword, newPassword })
}

export function getMyConfessions(params = {}) {
  return http.get('/users/me/confessions', { params })
}