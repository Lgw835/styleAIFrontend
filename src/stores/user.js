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
    console.log('设置用户信息:', info)
    userInfo.value = info
    isLoggedIn.value = !!info // 确保根据info是否存在设置登录状态
    isNewUser.value = isNew
    
    // 使用sessionStorage存储登录状态
    if (needSaveStorage) {
      sessionStorage.setItem('isLoggedIn', 'true')
      console.log('已将登录状态保存到sessionStorage')
    }
  }

  // 登录方法 - 可以添加这个辅助方法确保登录状态正确设置
  function login(info) {
    setUserInfo(info, false, true)
    console.log('用户登录状态:', isLoggedIn.value)
    return isLoggedIn.value
  }

  // 设置用户画像 - 确保转为字符串存储
  function setUserProfile(profileData) {
    if (profileData) {
      // 如果是对象，转为字符串
      if (typeof profileData === 'object') {
        try {
          userProfile.value = JSON.stringify(profileData);
          console.log('用户画像对象已转为字符串');
        } catch (e) {
          console.error('用户画像JSON序列化失败:', e);
          // 转换失败时，尝试简单处理
          userProfile.value = String(profileData);
        }
      } else if (typeof profileData === 'string') {
        // 已经是字符串，直接使用
        userProfile.value = profileData;
      } else {
        // 其他类型，转为字符串
        userProfile.value = String(profileData);
      }
    } else {
      userProfile.value = null;
    }
    
    // 保存到会话存储
    if (userProfile.value) {
      sessionStorage.setItem('userProfile', userProfile.value); // 直接存储字符串
    } else {
      sessionStorage.removeItem('userProfile');
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

  // 从 sessionStorage 恢复数据时确保正确读取登录状态
  function restoreFromSession() {
    try {
      const isLoggedInFromSession = sessionStorage.getItem('isLoggedIn') === 'true'
      console.log('从session恢复登录状态:', isLoggedInFromSession)
      
      const savedData = sessionStorage.getItem('userData')
      if (savedData) {
        const data = JSON.parse(savedData)
        userInfo.value = data.userInfo || null
        userProfile.value = data.userProfile || null
        // 优先使用sessionStorage中的isLoggedIn，其次根据userInfo判断
        isLoggedIn.value = isLoggedInFromSession || !!data.userInfo
        isNewUser.value = data.isNewUser || false
        console.log('恢复后的登录状态:', isLoggedIn.value)
      } else if (isLoggedInFromSession) {
        // 如果只有isLoggedIn但没有userData，仍然设置登录状态
        isLoggedIn.value = true
      }
    } catch (error) {
      console.error('恢复用户数据失败:', error)
      // 出错时检查是否有登录状态标记
      isLoggedIn.value = sessionStorage.getItem('isLoggedIn') === 'true'
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