import http, { setToken, clearToken } from './http'

export function getCaptcha() {
  return http.get('/auth/captcha')
}

export function sendEmailCode(email) {
  return http.post('/auth/email-code', { email })
}

export function register(data) {
  return http.post('/auth/register', data).then((res) => {
    if (res?.token) setToken(res.token)
    return res
  })
}

export function login({ username, password }) {
  return http.post('/auth/login', { username, password }).then((res) => {
    if (res?.token) setToken(res.token)
    return res
  })
}

export function logout() {
  return http.post('/auth/logout').finally(() => {
    clearToken()
  })
}

export function getSession() {
  return http.get('/auth/session')
}

export function forgotVerify({ username, email }) {
  return http.post('/auth/forgot/verify', { username, email })
}

export function forgotReset({ userId, resetToken, newPassword, emailCode }) {
  return http.post('/auth/forgot/reset', { userId, resetToken, newPassword, emailCode })
}