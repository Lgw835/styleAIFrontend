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
import { getSmsCode, loginWithPhone } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { useOutfitRecordStore } from '@/stores/outfitRecord'
import { useScheduleStore } from '@/stores/schedule'

const router = useRouter()
const userStore = useUserStore()
const outfitRecordStore = useOutfitRecordStore()
const scheduleStore = useScheduleStore()
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
    console.log('获取验证码响应:', res)
    
    // 检查响应格式并正确提取验证码
    if (res && res.success) {
      // 直接从响应中获取验证码 (修正路径)
      if (res.code) {
        // 正确保存验证码
        smsId.value = res.code
        console.log('成功保存验证码:', smsId.value)
        showToast('验证码已发送至您的手机')
      } else if (res.data && res.data.code) {
        // 兼容嵌套数据结构
        smsId.value = res.data.code
        console.log('成功保存验证码(嵌套结构):', smsId.value)
        showToast('验证码已发送至您的手机')
      } else {
        // 无法找到验证码
        showToast('验证码已发送至您的手机，请注意查收')
      }
      
      // 无论如何都开始倒计时
      startCountdown()
    } else {
      // 请求成功但业务失败
      showToast(res.message || '获取验证码失败，请稍后再试')
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    showToast('获取验证码失败: ' + (error.message || '请检查网络连接'))
  }
}

// 单独的倒计时函数
const startCountdown = () => {
  countDown.value = 60
  const timer = setInterval(() => {
    countDown.value--
    if (countDown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleLogin = async () => {
  if (!phone.value || !/^1[3-9]\d{9}$/.test(phone.value)) {
    showToast('请输入正确的手机号')
    return
  }
  
  if (!verificationCode.value) {
    showToast('请输入验证码')
    return
  }
  
  // 增强验证码验证逻辑
  console.log('验证码比较:', {
    '系统验证码': smsId.value,
    '用户输入验证码': verificationCode.value
  })
  
  // 验证码验证 - 强制转为字符串再比较
  if (!smsId.value) {
    showToast('请先获取验证码')
    return
  }
  
  // 确保验证码比较正确进行
  if (String(smsId.value) !== String(verificationCode.value)) {
    console.log('验证码不匹配，拦截登录请求')
    showToast('验证码错误，请重新输入')
    return
  }
  
  console.log('验证码验证通过，继续登录流程')
  
  try {
    const response = await loginWithPhone({
      phone: phone.value,
      code: verificationCode.value
    })
    
    console.log('手机验证码登录响应:', response)
    
    // 检查登录是否成功 - 优化判断条件
    // 如果返回了用户信息，就认为登录成功
    if (response.data?.userInfo || 
        (response.userInfo) || 
        (response.code === 0 || response.success)) {
      
      // 提取用户信息 - 支持多种格式
      const userInfo = response.data?.userInfo || response.userInfo || response.data
      const userProfile = response.data?.userProfile || response.userProfile
      
      console.log('提取的用户信息:', userInfo)
      
      // 更新用户信息
      if (userInfo) {
        // 存储用户信息到store
        userStore.setUserInfo(userInfo, true)
        
        // 存储用户画像(如果有)
        if (userProfile) {
          userStore.setUserProfile(userProfile)
        }
        
        // 保存登录状态到sessionStorage
        sessionStorage.setItem('isLoggedIn', 'true')
        
        // 尝试获取穿搭记录
        if (userInfo.userId) {
          outfitRecordStore.fetchOutfitRecords(userInfo.userId, true).catch(err => {
            console.error('获取穿搭记录失败:', err)
          })
        }
        
        // 登录成功后获取今日日程
        await scheduleStore.fetchTodaySchedules(userInfo.userId)
        
        // 如果有日程，设置首次访问标记为 true
        if (scheduleStore.todaySchedules && scheduleStore.todaySchedules.length > 0) {
          sessionStorage.setItem('isFirstVisit', 'true')
        }
        
        showToast('登录成功')
        
        // 获取重定向URL或返回首页
        const redirect = router.currentRoute.value.query.redirect || '/home'
        
        setTimeout(() => {
          router.push(redirect)
        }, 1500)
        
        return // 重要：成功后直接返回，不执行后续错误逻辑
      }
    }
    
    // 如果代码执行到这里，说明无法识别为成功响应
    showToast(response.message || '登录失败，请确认账号和验证码')
    
  } catch (error) {
    console.error('登录请求失败:', error)
    showToast('登录失败: ' + (error.message || '网络错误，请重试'))
  }
}
</script> 