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
import { useOutfitRecordStore } from '@/stores/outfitRecord' // 导入穿搭记录Store

const router = useRouter()
const userStore = useUserStore()
const outfitRecordStore = useOutfitRecordStore()
const username = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    // 表单验证
    if (!username.value || !password.value) {
      showToast('请输入用户名和密码')
      return
    }
    
    // 使用真实API
    const res = await login({
      phone: username.value,
      password: password.value
    })
    
    // 登录成功后
    if (res.userInfo) {
      // 设置用户信息
      userStore.setUserInfo(res.userInfo, true) // 会自动使用sessionStorage
      
      // 如果没有用户画像，设置新登录标记
      if (!res.userProfile) {
        sessionStorage.setItem('newLogin', 'true')
      } else {
        userStore.setUserProfile(res.userProfile)
        
        // 登录成功后，获取穿搭记录
        outfitRecordStore.fetchOutfitRecords(res.userInfo.userId, true).catch(err => {
          console.error('获取穿搭记录失败:', err)
        })
      }
      
      // 显示成功提示
      showToast('登录成功')
      
      // 使用更确定的导航方式
      console.log('准备跳转到首页...')
      
      // 延迟并使用replace而不是push以避免导航历史问题
      setTimeout(() => {
        console.log('执行页面跳转')
        router.replace('/home').then(() => {
          console.log('跳转完成')
        }).catch(err => {
          console.error('跳转失败:', err)
        })
      }, 100)
    }
  } catch (error) {
    console.error('登录失败:', error)
    showToast('登录失败: ' + (error.message || '未知错误'))
  }
}
</script> 