<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- 顶部导航栏 -->
    <nav class="bg-white h-12 flex items-center px-4 border-b">
      <router-link to="/login" class="text-gray-600">
        <i class="fas fa-arrow-left"></i>
      </router-link>
      <h1 class="text-lg font-medium text-center flex-1">注册账号</h1>
    </nav>

    <!-- 主要内容区 -->
    <div class="flex-1 p-6">
      <!-- 注册表单 -->
      <form class="space-y-4" @submit.prevent="handleRegister">
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

        <div>
          <label class="block text-sm font-medium text-gray-700">用户名</label>
          <input 
            type="text" 
            v-model="username"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            placeholder="请设置用户名"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">密码</label>
          <input 
            type="password" 
            v-model="password"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            placeholder="请设置密码"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">确认密码</label>
          <input 
            type="password" 
            v-model="confirmPassword"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            placeholder="请再次输入密码"
          >
        </div>

        <div class="flex items-center">
          <input 
            type="checkbox" 
            id="agreement" 
            v-model="agreeTerms"
            class="h-4 w-4 text-blue-500 border-gray-300 rounded"
          >
          <label for="agreement" class="ml-2 text-sm text-gray-600">
            我已阅读并同意
            <a href="#" class="text-blue-500">用户协议</a>
            和
            <a href="#" class="text-blue-500">隐私政策</a>
          </label>
        </div>

        <button 
          type="submit" 
          class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          注册
        </button>
      </form>

      <!-- 登录入口 -->
      <div class="mt-6 text-center">
        <span class="text-gray-600">已有账号？</span>
        <router-link to="/login" class="text-blue-500 font-medium">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getSmsCode, register } from '@/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const phone = ref('')
const verificationCode = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeTerms = ref(false)
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
    // TODO: 后续接入真实API，目前使用模拟数据
    // const res = await getSmsCode({ phone: phone.value })
    
    // 模拟验证码
    const mockCode = Math.floor(1000 + Math.random() * 9000).toString()
    const mockSmsId = 'sms_' + Date.now()
    
    // 存储验证码
    userStore.saveVerificationCode(phone.value, mockCode, mockSmsId)
    smsId.value = mockSmsId
    
    showToast(`验证码已发送: ${mockCode}`) // 实际应用中不应显示验证码
    
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

const handleRegister = async () => {
  // console.log('handleRegister')
  // 验证表单
  if (!phone.value || !/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }
  
  if (!verificationCode.value) {
    showToast('请输入验证码')
    return
  }
  
  // 前端验证验证码
  if (!userStore.validateSmsCode(phone.value, verificationCode.value)) {
    showToast('验证码错误')
    return
  }
  
  if (!username.value) {
    showToast('请设置用户名')
    return
  }
  
  if (!password.value) {
    showToast('请设置密码')
    return
  }
  
  if (password.value !== confirmPassword.value) {
    showToast('两次输入的密码不一致')
    return
  }
  
  if (!agreeTerms.value) {
    showToast('请阅读并同意用户协议和隐私政策')
    return
  }
  
  try {
    // TODO: 后续接入真实API，目前使用模拟数据
    // const res = await register({
    //   phone: phone.value,
    //   smsCode: verificationCode.value,
    //   smsId: smsId.value,
    //   username: username.value,
    //   password: password.value
    // })
    
    // 模拟注册成功响应
    const mockResponse = {
      userInfo: {
        userId: 'user_' + Date.now(),
        username: username.value,
        password: '********', // 密码不会返回
        phone: phone.value,
        imagePath: '',
        ifAutoRecommend: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      userProfile: {
        profileId: 'prof_' + Date.now(),
        userId: 'user_' + Date.now(),
        gender: '',
        age: 0,
        height: 0,
        weight: 0,
        bodyShape: '',
        stylePreference: '',
        skinTone: '',
        hairColor: '',
        hairLength: '',
        hairStyle: '',
        eyeColor: '',
        faceShape: '',
        bodyType: '',
        tattooDescription: '',
        piercingDescription: '',
        otherFeatures: ''
      }
    }
    
    // 保存用户信息到Pinia
    userStore.setUserInfo(mockResponse.userInfo, true)
    userStore.setUserProfile(mockResponse.userProfile)
    
    // 注册成功提示
    showToast('注册成功')
    
    // 跳转到首页
    router.push('/')
  } catch (error) {
    console.error('注册失败:', error)
    showToast('注册失败: ' + (error.message || '未知错误'))
  }
}
</script> 