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

      <!-- 性别 -->
      <div class="form-item" @click="focusInput('gender')">
        <div class="form-item-content">
          <span class="item-label">性别</span>
          <div class="item-value">
            <select v-model="profileData.gender" class="select-input" ref="genderInput">
              <option value="female">女</option>
              <option value="male">男</option>
              <option value="secret">保密</option>
            </select>
            <i class="fas fa-chevron-right arrow"></i>
          </div>
        </div>
      </div>

      <!-- 生日 -->
      <div class="form-item" @click="focusInput('birthday')">
        <div class="form-item-content">
          <span class="item-label">生日</span>
          <div class="item-value">
            <input 
              type="date" 
              v-model="profileData.birthday" 
              class="date-input"
              ref="birthdayInput"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

const router = useRouter()
const fileInput = ref(null)
const avatarPreview = ref('')
const nicknameInput = ref(null)
const genderInput = ref(null)
const birthdayInput = ref(null)

// 个人资料数据
const profileData = ref({
  avatar: '',
  nickname: '时尚达人',
  gender: 'female',
  birthday: '2000-01-01',
  phone: '13888888888'
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
  // 例如弹出一个模态框验证身份后再修改手机号
  alert('修改手机号需要验证身份，此功能正在开发中...')
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 创建临时URL用于预览
    avatarPreview.value = URL.createObjectURL(file)
    
    // 这里可以添加文件上传到服务器的逻辑
    // 例如使用FormData和fetch/axios进行上传
    // const formData = new FormData()
    // formData.append('avatar', file)
    // 上传代码...
  }
}

// 格式化手机号显示 (隐藏中间4位)
const formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 保存个人资料
const saveProfile = () => {
  // 这里应该添加保存逻辑，如API请求等
  console.log('保存个人资料:', profileData.value)
  
  // 保存成功后返回个人页面
  router.push('/profile')
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