import axios from 'axios'
import router from '@/router'
import { Notify } from 'vant'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:7001', // 使用网关地址
  timeout: 30000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在请求头中设置语言偏好
    config.headers['Accept-Language'] = 'zh-CN'
    
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    
    // 如果有token则添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 添加请求日志
    console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.url}`, config.data || config.params || {})
    
    // 打印请求URL
    console.log('发送请求到:', config.url)
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 不再解构到data属性，直接返回响应数据
    return response.data
  },
  error => {
    // 增强错误日志
    if (error.response) {
      console.error(`❌ Response Error [${error.response.status}] from ${error.config?.url}:`, 
                   error.response.data || error.message)
    } else if (error.request) {
      console.error(`❌ No Response Error from ${error.config?.url}:`, 
                   'The request was made but no response was received')
    } else {
      console.error(`❌ Request Setup Error:`, error.message)
    }
    
    // 处理网络错误
    let message = '网络请求错误'
    if (error.response) {
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          localStorage.removeItem('token')
          router.push('/login')
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 503:
          message = '服务暂时不可用，请稍后再试'
          break
        default:
          message = `请求错误: ${error.response.status}`
      }
    } else if (error.request) {
      // 请求发出但没有收到响应
      message = '服务器未响应，请检查网络'
    }
    
    Notify({
      type: 'danger', 
      message 
    })
    
    return Promise.reject(error)
  }
)

export default service 