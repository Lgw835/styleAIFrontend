<template>
  <div class="edit-profile">
    <!-- 使用通用子页面导航栏组件 -->
    <SubPageNavBar title="编辑基本信息" back-link="/profile">
      <template #right-action>
        <button class="save-btn" @click="saveProfile">保存</button>
      </template>
    </SubPageNavBar>

    <!-- 表单区域 -->
    <div class="form-container">
      <!-- 头像 -->
      <div class="form-item">
        <div class="form-item-content">
          <span class="item-label">头像</span>
          <div class="item-value">
            <div class="avatar-container" @click="triggerFileInput">
              <img :src="avatarPreview || profileData.avatar || 'https://i.pravatar.cc/80?img=5'" class="avatar-img" alt="用户头像">
              <input 
                type="file" 
                ref="fileInput" 
                accept="image/*" 
                style="display: none"
                @change="handleFileChange" 
              />
            </div>
            <i class="fas fa-chevron-right arrow"></i>
          </div>
        </div>
      </div>

      <!-- 昵称 -->
      <div class="form-item" @click="focusInput('nickname')">
        <div class="form-item-content">
          <span class="item-label">昵称</span>
          <div class="item-value">
            <input 
              type="text" 
              v-model="profileData.nickname" 
              class="text-input" 
              placeholder="请输入昵称"
              ref="nicknameInput"
            >
            <i class="fas fa-chevron-right arrow"></i>
          </div>
        </div>
      </div>


      <!-- 手机号 -->
      <div class="form-item" @click="handlePhoneEdit">
        <div class="form-item-content">
          <span class="item-label">手机号</span>
          <div class="item-value">
            <span class="phone-text">{{ formatPhone(profileData.phone) }}</span>
            <i class="fas fa-chevron-right arrow"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SubPageNavBar from '@/components/SubPageNavBar.vue'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'
import request from '@/utils/request'
import { updateProfile, uploadFile } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()
const fileInput = ref(null)
const avatarPreview = ref('')
const nicknameInput = ref(null)
const genderInput = ref(null)
const birthdayInput = ref(null)
const selectedFile = ref(null)

// 个人资料数据
const profileData = ref({
  avatar: '',
  nickname: '时尚达人',
  phone: '13888888888' // 保留显示但不可编辑
})

// 在组件挂载时加载用户信息
onMounted(() => {
  if (userStore.userInfo) {
    profileData.value = {
      avatar: userStore.userInfo.imagePath || '',
      nickname: userStore.userInfo.username || '时尚达人',
      phone: userStore.userInfo.phone || '13888888888'
    }
  }
})

// 聚焦指定输入框
const focusInput = (inputName) => {
  if (inputName === 'nickname') {
    nicknameInput.value.focus()
  } else if (inputName === 'gender') {
    genderInput.value.focus()
  } else if (inputName === 'birthday') {
    birthdayInput.value.focus()
  }
}

// 处理手机号编辑
const handlePhoneEdit = () => {
  // 这里可以实现验证手机号的逻辑
  showToast('修改手机号需要验证身份，此功能正在开发中...')
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理文件选择 - 只做本地预览
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 创建本地预览，但不上传
    avatarPreview.value = URL.createObjectURL(file)
    // 保存文件对象供后续上传使用
    selectedFile.value = file
  }
}

// 格式化手机号显示 (隐藏中间4位)
const formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 保存个人资料函数
const saveProfile = async () => {
  if (!profileData.value.nickname) {
    showToast('请输入昵称')
    return
  }
  
  try {
    let imageUrl = profileData.value.avatar
    
    // 如果选择了新图片，先上传
    if (selectedFile.value) {
      showToast('正在上传头像...')
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('userId', userStore.userInfo.userId)
      
      console.log('开始上传文件...')
      const response = await uploadFile(formData)
      console.log('文件上传响应:', response)
      
      // 文件上传接口直接返回 {fileUrl, fileType} 结构
      if (response && response.fileUrl) {
        imageUrl = response.fileUrl
        console.log('获取到服务器返回的图片URL:', imageUrl)
      } else {
        console.error('无法获取上传的图片URL:', response)
        showToast('头像上传失败')
        return
      }
    }
    
    // 释放本地预览URL
    if (avatarPreview.value && avatarPreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview.value)
      avatarPreview.value = ''
    }
    
    // 准备用户信息更新参数
    const updatedUserInfo = {
      userId: userStore.userInfo.userId,
      username: profileData.value.nickname,
      imagePath: imageUrl
    }
    
    console.log('发送用户信息更新请求:', updatedUserInfo)
    const updateResponse = await updateProfile(updatedUserInfo)
    console.log('用户信息更新响应:', updateResponse)
    
    // 更新用户信息接口返回 boolean
    if (updateResponse === true || updateResponse.data === true) {
      // 更新本地存储
      userStore.setUserInfo(updatedUserInfo)
      showToast('保存成功')
      router.push('/profile')
    } else {
      showToast('保存失败')
    }
  } catch (error) {
    console.error('保存过程中发生错误:', error)
    showToast('保存失败')
  }
}
</script>

<style scoped>
.edit-profile {
  min-height: 100vh;
  background-color: #F5F5F5;
}

/* 保存按钮样式 */
.save-btn {
  color: #3B82F6;
  font-weight: 500;
  font-size: 16px;
  background: transparent;
  border: none;
  cursor: pointer;
}

/* 表单区域样式 */
.form-container {
  padding-top: 56px; /* 顶部导航栏高度 */
  background-color: #FFFFFF;
}

.form-item {
  padding: 16px;
  border-bottom: 1px solid #F3F4F6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.form-item:hover {
  background-color: #F9FAFB;
}

.form-item:active {
  background-color: #F3F4F6;
}

.form-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-label {
  color: #4B5563;
  font-size: 16px;
}

.item-value {
  display: flex;
  align-items: center;
}

.avatar-container {
  position: relative;
  cursor: pointer;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #E5E7EB;
  transition: opacity 0.2s;
}

.avatar-container:hover .avatar-img {
  opacity: 0.8;
}

.text-input, .select-input, .date-input {
  text-align: right;
  color: #374151;
  outline: none;
  border: none;
  background: transparent;
  font-size: 16px;
}

.select-input {
  appearance: none;
  padding-right: 24px;
}

.phone-text {
  color: #9CA3AF;
  font-size: 16px;
}

.arrow {
  color: #D1D5DB;
  font-size: 12px;
  margin-left: 8px;
}
</style> 