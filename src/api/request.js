import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在这里可以添加 token 等请求头
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 如果后端返回的状态码不是 success，可以在这里统一处理
    // 注意：这里根据你的实际后端返回结构来判断
    return res
  },
  error => {
    ElMessage.error(error.message || '网络请求失败')
    return Promise.reject(error)
  }
)

export default service
