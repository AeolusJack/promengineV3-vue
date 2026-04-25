// src/api/client.ts
import axios from 'axios'

const client = axios.create({
  baseURL: '/api/v1',          // 必须存在，所有请求都会加上此前缀
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId') || 'default-user'
  config.headers['X-User-Id'] = userId
  return config
})

export default client