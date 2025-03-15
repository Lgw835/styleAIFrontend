import { getSmsCode } from '@/api/user'

// 简单测试函数
export async function testUserApi() {
  try {
    console.log('测试短信验证码API...')
    const response = await getSmsCode({ phone: '13800138000' })
    console.log('API测试成功:', response)
    return true
  } catch (error) {
    console.error('API测试失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    return false
  }
} 