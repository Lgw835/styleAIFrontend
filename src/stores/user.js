import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref(null)
  // 用户画像
  const userProfile = ref(null)
  // 登录状态 - 确保初始值设为 false
  const isLoggedIn = ref(false)
  // 新用户标志 - 用于区分注册和登录
  const isNewUser = ref(false)
  // 手机验证码 (仅用于模拟阶段)
  const verificationCodes = ref({})

  // 设置用户信息
  function setUserInfo(info, isNew = false, needSaveStorage = true) {
    userInfo.value = info
    isLoggedIn.value = true // 明确设置登录状态
    isNewUser.value = isNew
    
    // 使用sessionStorage存储登录状态
    if (needSaveStorage) {
      sessionStorage.setItem('isLoggedIn', 'true')
    }
  }

  // 设置用户画像
  function setUserProfile(profile) {
    // 确保profile是一个对象
    if (profile && typeof profile === 'object') {
      // 如果当前已有用户画像，合并而不是替换
      if (userProfile.value) {
        userProfile.value = { ...userProfile.value, ...profile };
      } else {
        userProfile.value = { ...profile };
      }
      
      // 数据发生变化时会触发watch，自动保存到sessionStorage
      console.log('用户画像已更新:', userProfile.value);
    } else {
      console.error('尝试设置无效的用户画像数据:', profile);
    }
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
    try {
      const savedData = sessionStorage.getItem('userData')
      if (savedData) {
        const data = JSON.parse(savedData)
        userInfo.value = data.userInfo || null
        userProfile.value = data.userProfile || null
        isLoggedIn.value = !!data.userInfo // 根据 userInfo 是否存在设置登录状态
        isNewUser.value = data.isNewUser || false
        verificationCodes.value = data.verificationCodes || {}
      }
    } catch (error) {
      console.error('恢复用户数据失败:', error)
      // 出错时设置默认状态
      userInfo.value = null
      userProfile.value = null
      isLoggedIn.value = false
    }
  }

  // 保存数据到 sessionStorage
  function saveToSession() {
    try {
      const data = {
        userInfo: userInfo.value,
        userProfile: userProfile.value,
        isLoggedIn: isLoggedIn.value,
        isNewUser: isNewUser.value,
        verificationCodes: verificationCodes.value
      };
      sessionStorage.setItem('userData', JSON.stringify(data));
      console.log('用户数据已成功保存到session');
    } catch (error) {
      console.error('保存用户数据到session失败:', error);
    }
  }

  // 监听数据变化并保存
  watch(
    [userInfo, userProfile, isLoggedIn, isNewUser, verificationCodes],
    () => {
      console.log('用户数据已变更，正在保存到session...');
      saveToSession();
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

  // 在computed或getters部分添加
  const hasUserProfile = computed(() => {
    // 只检查 userProfile 是否存在，不再检查具体字段
    // 这样与 HomeView.vue 的检测逻辑一致
    return !!userProfile.value
  })

  // 清除用户登录状态函数
  function clearUserInfo() {
    userInfo.value = null
    userProfile.value = null
    isLoggedIn.value = false
    
    // 清除sessionStorage
    sessionStorage.removeItem('isLoggedIn')
    sessionStorage.removeItem('newLogin')
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
    logout,
    restoreFromSession,
    saveToSession,
    hasUserProfile,
    clearUserInfo
  }
}) 