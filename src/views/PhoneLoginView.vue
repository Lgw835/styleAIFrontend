<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- 顶部导航栏 -->
    <nav class="bg-white h-12 flex items-center px-4 border-b">
      <router-link to="/login" class="text-gray-600">
        <i class="fas fa-arrow-left"></i>
      </router-link>
      <h1 class="text-lg font-medium text-center flex-1">手机号登录</h1>
    </nav>

    <!-- 主要内容区 -->
    <div class="flex-1 p-6">
      <!-- Logo -->
      <div class="text-center mb-10">
        <i class="fas fa-tshirt text-6xl text-blue-500"></i>
        <h2 class="text-2xl font-bold mt-4">智慧穿搭助手</h2>
        <p class="text-gray-500 mt-2">你的个人穿搭AI顾问</p>
      </div>

      <!-- 登录表单 -->
      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="block text-sm font-medium text-gray-700">手机号</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              +86
            </span>
            <input 
              type="tel" 
              v-model="phone"
              class="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-none rounded-r-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              placeholder="请输入手机号"
            >
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">验证码</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <input 
              type="text" 
              v-model="verificationCode"
              class="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              placeholder="请输入验证码"
            >
            <button 
              type="button" 
              class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 text-sm font-medium rounded-r-md text-blue-500 bg-gray-50 hover:bg-gray-100"
              @click="getVerificationCode"
            >
              {{ countDown > 0 ? `${countDown}s后重新获取` : '获取验证码' }}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          登录
        </button>
      </form>

      <!-- 注册入口 -->
      <div class="mt-6 text-center">
        <span class="text-gray-600">还没有账号？</span>
        <router-link to="/register" class="text-blue-500 font-medium">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getSmsCode, phoneLogin } from '@/api'
import { useUserStore } from '@/stores/user'
import { useOutfitRecordStore } from '@/stores/outfitRecord'

const router = useRouter()
const userStore = useUserStore()
const outfitRecordStore = useOutfitRecordStore()
const phone = ref('')
const verificationCode = ref('')
const countDown = ref(0)
const smsId = ref('')

const getVerificationCode = async () => {
  if (countDown.value > 0) return
  
  // 验证手机号
  if (!phone.value || !/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }
  
  try {
    // 使用真实API
    const res = await getSmsCode({ phone: phone.value })
    
    // 存储验证码ID
    smsId.value = res.data.code
    
    showToast('验证码已发送至您的手机')
    
    // 开始倒计时
    countDown.value = 60
    const timer = setInterval(() => {
      countDown.value--
      if (countDown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('获取验证码失败:', error)
    showToast('获取验证码失败: ' + (error.message || '未知错误'))
  }
}

const handleLogin = async () => {
  // 验证表单
  if (!phone.value || !/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }
  
  if (!verificationCode.value) {
    showToast('请输入验证码')
    return
  }
  
  try {
    // 使用真实API
    const res = await phoneLogin({
      phone: phone.value,
      code: verificationCode.value
    })
    
    // 保存用户信息到Pinia
    userStore.setUserInfo(res.data.userInfo, false)
    userStore.setUserProfile(res.data.userProfile)
    
    // 登录成功后，获取穿搭记录
    outfitRecordStore.fetchOutfitRecords(res.data.userInfo.userId, true).catch(err => {
      console.error('获取穿搭记录失败:', err)
    })
    
    // 登录成功提示
    showToast('登录成功')
    
    // 跳转到首页
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    showToast('登录失败: ' + (error.message || '未知错误'))
  }
}
</script> 