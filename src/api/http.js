import axios from 'axios'
import { getItem, setItem, removeItem } from '@/utils/storage'

const http = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

http.interceptors.request.use((config) => {
  const token = getItem('jwt', null)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body && body.code !== undefined && body.code !== 0) {
      const err = new Error(body.message || '请求失败')
      err.code = body.code
      err.data = body.data
      return Promise.reject(err)
    }
    return body
  },
  (error) => {
    if (error.response) {
      const body = error.response.data
      const msg = body?.message || `请求失败 (${error.response.status})`
      const err = new Error(msg)
      err.code = body?.code || error.response.status
      err.status = error.response.status
      if (error.response.status === 401) {
        removeItem('jwt')
      }
      return Promise.reject(err)
    }
    return Promise.reject(new Error('网络异常，请检查后端服务'))
  }
)

export function getToken() {
  return getItem('jwt', null)
}

export function setToken(token) {
  setItem('jwt', token)
}

export function clearToken() {
  removeItem('jwt')
}

export default http