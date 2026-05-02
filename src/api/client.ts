// src/api/client.ts
import axios from 'axios'
import { message } from 'ant-design-vue'

const client = axios.create({
  baseURL: '/api/v1',          // 必须存在，所有请求都会加上此前缀
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.response.use(
  (response) => {
    const body = response.data
    // 如果后端包装格式为 { success, data, error }
    if (body && body.success === false) {
      message.error(body.error || '请求失败')
      return Promise.reject(new Error(body.error || '请求失败'))
    }
    return response
  },
  (error) => {
    message.error(error.response?.data?.error || error.message || '网络错误')
    return Promise.reject(error)
  }
)

client.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId') || 'default-user'
  config.headers['X-User-Id'] = userId
  return config
})

export default client