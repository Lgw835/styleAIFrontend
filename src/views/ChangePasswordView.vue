<template>
  <div class="change-password-page">
    <!-- 使用SubPageNavBar作为顶部导航 -->
    <SubPageNavBar 
      title="修改密码" 
      backLink="/profile"
    />

    <!-- 表单区域 -->
    <div class="content-wrapper">
      <div class="form-container">
        <!-- 手机号 -->
        <div class="form-group">
          <label class="form-label">手机号</label>
          <input 
            type="text" 
            v-model="phoneNumber" 
            class="form-input readonly-input" 
            readonly
          >
        </div>

        <!-- 验证码 -->
        <div class="form-group">
          <label class="form-label">验证码</label>
          <div class="verification-code-container">
            <input 
              type="text" 
              v-model="verificationCode" 
              placeholder="请输入验证码" 
              class="form-input flex-1"
            >
            <button 
              class="verification-code-btn"
              :disabled="countDown > 0"
              @click="getVerificationCode"
            >
              {{ countDown > 0 ? `${countDown}秒后重新获取` : '获取验证码' }}
            </button>
          </div>
        </div>

        <!-- 新密码 -->
        <div class="form-group">
          <label class="form-label">新密码</label>
          <div class="password-input-container">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="newPassword" 
              placeholder="请输入新密码" 
              class="form-input"
            >
            <button 
              class="toggle-password-btn"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <p class="password-hint">密码长度8-20位，必须包含字母和数字</p>
        </div>

        <!-- 确认新密码 -->
        <div class="form-group">
          <label class="form-label">确认新密码</label>
          <div class="password-input-container">
            <input 
              :type="showConfirmPassword ? 'text' : 'password'" 
              v-model="confirmPassword" 
              placeholder="请再次输入新密码" 
              class="form-input"
            >
            <button 
              class="toggle-password-btn"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <!-- 提交按钮 -->
        <button 
          class="submit-btn"
          @click="submitForm"
          :disabled="!isFormValid"
        >
          确认修改
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'
import { getSmsCode, updatePassword } from '@/api/user'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

const router = useRouter()
const userStore = useUserStore()

// 格式化手机号显示 (隐藏中间4位)
const formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 表单数据
const phoneNumber = computed(() => {
  return formatPhone(userStore.userInfo?.phone || '')
})
const verificationCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const countDown = ref(0)
const smsId = ref('')

// 验证码倒计时
const getVerificationCode = async () => {
  if (countDown.value > 0) return
  
  const phone = userStore.userInfo?.phone
  if (!phone) {
    showToast('无法获取手机号')
    return
  }
  
  try {
    const res = await getSmsCode({ phone })
    smsId.value = res.code
    
    showToast('验证码已发送')
    
    countDown.value = 60
    const timer = setInterval(() => {
      countDown.value--
      if (countDown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('获取验证码失败:', error)
    showToast('获取验证码失败，请稍后再试')
  }
}

// 在前端验证验证码
const verifyCode = () => {
  if (!smsId.value || !verificationCode.value) {
    return false
  }
  
  return smsId.value === verificationCode.value
}

// 表单验证
const isPasswordValid = computed(() => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/
  return passwordRegex.test(newPassword.value)
})

const isFormValid = computed(() => {
  return verificationCode.value.length > 0 && 
         isPasswordValid.value && 
         newPassword.value === confirmPassword.value
})

// 提交表单
const submitForm = async () => {
  if (!isFormValid.value) return
  
  const phone = userStore.userInfo?.phone
  const userId = userStore.userInfo?.userId
  if (!phone || !userId) {
    showToast('无法获取用户信息')
    return
  }
  
  // 在提交前先验证验证码
  if (!verifyCode()) {
    showToast('验证码错误,请重新输入')
    return
  }
  
  try {
    const res = await updatePassword({
      phone,
      code: verificationCode.value,
      userId,
      newPassword: newPassword.value
    })
    
    if (res === true) {
      showToast('密码修改成功')
      router.push('/profile')
    } else {
      showToast('密码修改失败')
    }
  } catch (error) {
    console.error('密码修改失败:', error)
    showToast('密码修改失败: ' + (error.message || '未知错误'))
  }
}
</script>

<style scoped>
.change-password-page {
  min-height: 100vh;
  background-color: #F7F7F7;
}

.content-wrapper {
  padding: 80px 16px 20px; /* 增加顶部内边距，从56px增加到80px */
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.form-container {
  background: white;
  border-radius: 12px;
  padding: 20px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  outline: none;
  font-size: 15px;
  color: #333;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #4096FF;
}

.form-input::placeholder {
  color: #999;
}

.readonly-input {
  background-color: #F5F5F5;
  color: #999;
}

.verification-code-container {
  display: flex;
  gap: 12px;
}

.verification-code-btn {
  padding: 0 16px;
  height: 48px;
  background-color: #4096FF;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  white-space: nowrap;
  transition: background-color 0.3s;
}

.verification-code-btn:disabled {
  background-color: #B0D6FF;
}

.password-input-container {
  position: relative;
}

.toggle-password-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
}

.password-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #4096FF;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.submit-btn:disabled {
  background-color: #B0D6FF;
  cursor: not-allowed;
}
</style> 