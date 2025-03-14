<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- 顶部导航栏 -->
    <nav class="bg-white h-12 flex items-center px-4 border-b">
      <h1 class="text-lg font-medium text-center flex-1">登录</h1>
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
          <label class="block text-sm font-medium text-gray-700">用户名/手机号</label>
          <input 
            type="text" 
            v-model="username" 
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            placeholder="请输入用户名或手机号"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">密码</label>
          <input 
            type="password" 
            v-model="password"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
            placeholder="请输入密码"
          >
        </div>
        <div class="flex justify-between text-sm">
          <router-link to="/phone-login" class="text-blue-500">手机号登录</router-link>
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
import { login } from '@/api' // 导入登录API
import { useUserStore } from '@/stores/user' // 导入用户状态存储

const router = useRouter()
const userStore = useUserStore()
const username = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    // 表单验证
    if (!username.value || !password.value) {
      showToast('请输入用户名和密码')
      return
    }
    
    // TODO: 后续接入真实API，目前使用模拟数据
    // const res = await login({
    //   username: username.value,
    //   password: password.value
    // })
    
    // 模拟登录成功的响应数据
    const mockResponse = {
      userInfo: {
        userId: 'user_' + Date.now(),
        username: username.value,
        password: '********', // 密码不会返回
        phone: username.value.length === 11 ? username.value : '13800138000',
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
    
    // 存储用户信息到Pinia
    userStore.setUserInfo(mockResponse.userInfo, false)
    userStore.setUserProfile(mockResponse.userProfile)
    
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