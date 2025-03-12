<template>
  <div class="contact-service">
    <SubPageNavBar title="联系客服" backLink="/profile" />
    
    <div class="content-wrapper">
      <!-- 客服在线状态 -->
      <div class="status-card">
        <div class="status-container">
          <div class="status-icon">
            <i class="fas fa-headset"></i>
          </div>
          <div class="status-info">
            <h2>在线客服</h2>
            <p><span class="online-dot"></span> 客服在线 · 工作时间 9:00-22:00</p>
          </div>
        </div>
        <button class="chat-now-btn" @click="startChat">
          <i class="fas fa-comments"></i>
          立即咨询
        </button>
      </div>

      <!-- 常见问题类型 -->
      <div class="card issue-card">
        <h3 class="card-title">反馈问题类型</h3>
        <div class="issue-types">
          <div 
            v-for="(type, index) in issueTypes" 
            :key="index"
            class="issue-type"
            :class="{ active: selectedIssueType === index }"
            @click="selectedIssueType = index"
          >
            <div class="issue-icon">
              <i :class="type.icon"></i>
            </div>
            <span>{{ type.name }}</span>
          </div>
        </div>
      </div>

      <!-- 问题描述表单 -->
      <div class="card form-card">
        <div class="form-group">
          <label>问题描述</label>
          <textarea 
            v-model="issueDescription" 
            placeholder="请详细描述您遇到的问题..." 
            rows="4"
          ></textarea>
          <p class="text-count">{{ issueDescription.length }}/200</p>
        </div>

        <div class="form-group">
          <label>上传截图 (选填)</label>
          <div class="upload-area">
            <div 
              v-for="(image, index) in uploadedImages" 
              :key="index" 
              class="image-preview"
            >
              <div class="preview-wrapper">
                <img :src="image" alt="预览图" />
                <button class="delete-btn" @click="removeImage(index)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div 
              v-if="uploadedImages.length < 3" 
              class="upload-btn"
              @click="triggerUpload"
            >
              <i class="fas fa-plus"></i>
              <span>添加图片</span>
              <input 
                type="file" 
                ref="fileInput" 
                accept="image/*" 
                @change="handleImageUpload" 
                style="display: none"
              />
            </div>
          </div>
          <p class="upload-tip">最多可上传3张图片，每张不超过5MB</p>
        </div>

        <div class="form-group">
          <label>联系方式</label>
          <div class="contact-options">
            <div class="contact-option">
              <input 
                type="radio" 
                id="contact-phone" 
                name="contact-method" 
                value="phone"
                v-model="contactMethod"
              />
              <label for="contact-phone">电话</label>
            </div>
            <div class="contact-option">
              <input 
                type="radio" 
                id="contact-email" 
                name="contact-method" 
                value="email"
                v-model="contactMethod"
              />
              <label for="contact-email">邮箱</label>
            </div>
            <div class="contact-option">
              <input 
                type="radio" 
                id="contact-wechat" 
                name="contact-method" 
                value="wechat"
                v-model="contactMethod"
              />
              <label for="contact-wechat">微信</label>
            </div>
          </div>
          <input 
            type="text" 
            v-model="contactInfo"
            :placeholder="contactPlaceholder"
            class="contact-input"
          />
        </div>

        <button class="submit-btn" @click="submitFeedback">
          提交反馈
        </button>
      </div>

      <!-- 其他联系方式 -->
      <div class="card contact-card">
        <h3 class="card-title">其他联系方式</h3>
        <div class="other-contacts">
          <div class="contact-item">
            <i class="fas fa-phone-alt"></i>
            <div class="contact-details">
              <span class="contact-label">客服电话</span>
              <span class="contact-value">400-123-4567</span>
            </div>
          </div>
          <div class="contact-item">
            <i class="fas fa-envelope"></i>
            <div class="contact-details">
              <span class="contact-label">客服邮箱</span>
              <span class="contact-value">support@styleai.com</span>
            </div>
          </div>
          <div class="contact-item">
            <i class="fab fa-weixin"></i>
            <div class="contact-details">
              <span class="contact-label">官方微信</span>
              <span class="contact-value">StyleAI-Service</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 帮助中心链接 -->
      <div class="help-link">
        <router-link to="/help-center">
          <i class="fas fa-question-circle"></i>
          查看帮助中心，寻找问题解答
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

// 问题类型
const issueTypes = [
  { name: '功能问题', icon: 'fas fa-exclamation-circle' },
  { name: '账户问题', icon: 'fas fa-user-shield' },
  { name: '支付问题', icon: 'fas fa-credit-card' },
  { name: '穿搭建议', icon: 'fas fa-tshirt' },
  { name: '其他问题', icon: 'fas fa-question-circle' }
]

// 表单数据
const selectedIssueType = ref(0)
const issueDescription = ref('')
const uploadedImages = ref([])
const contactMethod = ref('phone')
const contactInfo = ref('')

// 联系方式提示文本
const contactPlaceholder = computed(() => {
  switch (contactMethod.value) {
    case 'phone': return '请输入您的手机号码'
    case 'email': return '请输入您的邮箱地址'
    case 'wechat': return '请输入您的微信号'
    default: return '请输入您的联系方式'
  }
})

// 图片上传相关
const fileInput = ref(null)
const triggerUpload = () => {
  fileInput.value.click()
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 检查文件大小（5MB限制）
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB')
    return
  }
  
  // 创建URL预览
  const imageUrl = URL.createObjectURL(file)
  uploadedImages.value.push(imageUrl)
  
  // 重置文件输入
  event.target.value = ''
}

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
}

// 客服咨询
const startChat = () => {
  alert('正在连接客服，请稍候...')
  // 实际应用中这里会跳转到客服聊天界面
}

// 提交反馈
const submitFeedback = () => {
  // 表单验证
  if (issueDescription.value.trim() === '') {
    alert('请填写问题描述')
    return
  }
  
  if (contactInfo.value.trim() === '') {
    alert('请填写联系方式')
    return
  }
  
  // 模拟提交
  alert('您的反馈已提交，我们会尽快处理！')
  
  // 重置表单
  issueDescription.value = ''
  uploadedImages.value = []
  contactInfo.value = ''
  selectedIssueType.value = 0
}
</script>

<style scoped>
.contact-service {
  background-color: #F7F7F7;
  min-height: 100vh;
}

.content-wrapper {
  padding-top: 56px; /* 与顶部导航栏高度相同 */
  padding-bottom: 30px;
  max-width: 640px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
}

/* 客服状态卡片 */
.status-card {
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
  margin-bottom: 16px;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.status-container {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.status-icon {
  width: 48px;
  height: 48px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.status-icon i {
  font-size: 24px;
}

.status-info h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.status-info p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
  display: flex;
  align-items: center;
}

.online-dot {
  width: 8px;
  height: 8px;
  background-color: #10B981;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
}

.chat-now-btn {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.chat-now-btn i {
  margin-right: 8px;
}

.chat-now-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.chat-now-btn:active {
  transform: scale(0.98);
}

/* 问题类型 */
.card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  color: #111827;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
}

.issue-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.issue-type {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #F3F4F6;
}

.issue-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.issue-icon i {
  font-size: 18px;
  color: #6B7280;
}

.issue-type span {
  font-size: 13px;
  color: #4B5563;
  text-align: center;
}

.issue-type.active {
  background-color: #F9F5FF;
  border-color: #D8B4FE;
}

.issue-type.active .issue-icon {
  background-color: #F0ABFC;
}

.issue-type.active .issue-icon i {
  color: #9333EA;
}

.issue-type.active span {
  color: #9333EA;
  font-weight: 500;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 15px;
  color: #374151;
  font-weight: 500;
  margin-bottom: 8px;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  resize: none;
  font-size: 14px;
  color: #374151;
  background-color: #F9FAFB;
}

textarea:focus {
  outline: none;
  border-color: #D8B4FE;
  box-shadow: 0 0 0 2px rgba(216, 180, 254, 0.2);
}

.text-count {
  text-align: right;
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
}

/* 图片上传 */
.upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.image-preview {
  width: 80px;
  height: 80px;
  position: relative;
}

.preview-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background-color: rgba(239, 68, 68, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  border: none;
  cursor: pointer;
}

.upload-btn {
  width: 80px;
  height: 80px;
  border: 1px dashed #D1D5DB;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #F9FAFB;
}

.upload-btn i {
  font-size: 20px;
  color: #9CA3AF;
  margin-bottom: 4px;
}

.upload-btn span {
  font-size: 12px;
  color: #6B7280;
}

.upload-tip {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 8px;
}

/* 联系方式选择 */
.contact-options {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
}

.contact-option {
  display: flex;
  align-items: center;
}

.contact-option input[type="radio"] {
  margin-right: 6px;
  accent-color: #9333EA;
}

.contact-option label {
  font-size: 14px;
  color: #4B5563;
  font-weight: normal;
  margin-bottom: 0;
}

.contact-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  background-color: #F9FAFB;
}

.contact-input:focus {
  outline: none;
  border-color: #D8B4FE;
  box-shadow: 0 0 0 2px rgba(216, 180, 254, 0.2);
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(236, 72, 153, 0.3);
}

.submit-btn:hover {
  box-shadow: 0 4px 6px rgba(236, 72, 153, 0.4);
}

.submit-btn:active {
  transform: scale(0.98);
}

/* 其他联系方式 */
.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #F3F4F6;
}

.contact-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.contact-item i {
  width: 36px;
  height: 36px;
  background-color: #F3F4F6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  margin-right: 12px;
}

.contact-details {
  display: flex;
  flex-direction: column;
}

.contact-label {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 2px;
}

.contact-value {
  font-size: 15px;
  color: #111827;
  font-weight: 500;
}

/* 帮助中心链接 */
.help-link {
  text-align: center;
  margin-top: 16px;
}

.help-link a {
  display: inline-flex;
  align-items: center;
  color: #9333EA;
  font-size: 14px;
  text-decoration: none;
}

.help-link i {
  margin-right: 6px;
}
</style> 