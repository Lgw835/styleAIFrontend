import axios from 'axios'
import router from '@/router'
import { Notify } from 'vant'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    
    // 如果有token则添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
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
    const res = response.data
    
    // 如果接口返回的状态码不是200，说明接口有问题
    if (response.status !== 200) {
      Notify({
        type: 'danger', 
        message: res.message || '服务器响应错误' 
      })
      
      // 判断是否是401未授权，如果是则跳转到登录页
      if (response.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.message || '服务器响应错误'))
    } else {
      return res
    }
  },
  error => {
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
        default:
          message = `请求错误: ${error.response.status}`
      }
    } else if (error.request) {
      // 请求发出但没有收到响应
      message = '服务器未响应'
    }
    
    Notify({
      type: 'danger', 
      message 
    })
    
    return Promise.reject(error)
  }
)

export default service 