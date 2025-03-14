import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

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

  // 从 sessionStorage 恢复数据
  function restoreFromSession() {
    const savedData = sessionStorage.getItem('userData')
    if (savedData) {
      const data = JSON.parse(savedData)
      userInfo.value = data.userInfo
      userProfile.value = data.userProfile
      isLoggedIn.value = data.isLoggedIn
      isNewUser.value = data.isNewUser
      verificationCodes.value = data.verificationCodes
    }
  }

  // 保存数据到 sessionStorage
  function saveToSession() {
    const data = {
      userInfo: userInfo.value,
      userProfile: userProfile.value,
      isLoggedIn: isLoggedIn.value,
      isNewUser: isNewUser.value,
      verificationCodes: verificationCodes.value
    }
    sessionStorage.setItem('userData', JSON.stringify(data))
  }

  // 监听数据变化并保存
  watch(
    [userInfo, userProfile, isLoggedIn, isNewUser, verificationCodes],
    () => {
      saveToSession()
    },
    { deep: true }
  )

  // 登出
  function logout() {
    userInfo.value = null
    userProfile.value = null
    isLoggedIn.value = false
    isNewUser.value = false
    sessionStorage.removeItem('userData')
  }

  // 初始化时恢复数据
  restoreFromSession()

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
    logout,
    restoreFromSession,
    saveToSession
  }
}) 