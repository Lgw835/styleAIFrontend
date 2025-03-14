import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref(null)
  // 用户画像
  const userProfile = ref(null)
  // 登录状态
  const isLoggedIn = ref(false)
  // 新用户标志 - 用于区分注册和登录
  const isNewUser = ref(false)
  // 手机验证码 (仅用于模拟阶段)
  const verificationCodes = ref({})

  // 设置用户信息
  function setUserInfo(info, isNew = false) {
    userInfo.value = info
    isLoggedIn.value = !!info
    isNewUser.value = isNew
  }

  // 设置用户画像
  function setUserProfile(profile) {
    userProfile.value = profile
  }

  // 存储验证码 (仅用于模拟阶段)
  function saveVerificationCode(phone, code, smsId) {
    verificationCodes.value[phone] = { code, smsId }
  }

  // 验证手机验证码
  function validateSmsCode(phone, inputCode) {
    const savedData = verificationCodes.value[phone]
    if (!savedData) return false
    return savedData.code === inputCode
  }

  // 登出
  function logout() {
    userInfo.value = null
    userProfile.value = null
    isLoggedIn.value = false
    isNewUser.value = false
  }

  return {
    userInfo,
    userProfile,
    isLoggedIn,
    isNewUser,
    verificationCodes,
    setUserInfo,
    setUserProfile,
    saveVerificationCode,
    validateSmsCode,
    logout
  }
}) 