<template>
  <div class="edit-portrait">
    <!-- 使用通用子页面导航栏组件 -->
    <SubPageNavBar title="编辑用户画像" back-link="/user-portrait">
      <template #right-action>
        <button class="save-btn" @click="savePortrait" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </template>
    </SubPageNavBar>

    <!-- 加载中提示 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>

    <!-- 编辑表单 -->
    <div v-else class="form-container">
      <!-- 基本信息 -->
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>
        <div class="form-group">
          <label class="form-label">性别</label>
          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" v-model="portraitData.gender" value="male" class="radio-input">
              <span class="radio-label">男</span>
            </label>
            <label class="radio-option">
              <input type="radio" v-model="portraitData.gender" value="female" class="radio-input">
              <span class="radio-label">女</span>
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">年龄</label>
          <div class="input-group">
            <input 
              type="number" 
              v-model="portraitData.age" 
              class="form-input" 
              placeholder="请输入年龄"
              min="1"
              max="100"
            >
          </div>
        </div>
      </div>
      
      <!-- 身材数据 -->
      <div class="form-section">
        <h3 class="section-title">身材数据</h3>
        <div class="form-group">
          <label class="form-label">身高 (cm)</label>
          <div class="input-group">
            <input 
              type="number" 
              v-model="portraitData.height" 
              class="form-input" 
              placeholder="请输入身高"
              min="120"
              max="220"
            >
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">体重 (kg)</label>
          <div class="input-group">
            <input 
              type="number" 
              v-model="portraitData.weight" 
              class="form-input" 
              placeholder="请输入体重"
              min="30"
              max="150"
            >
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">体型</label>
          <div class="input-group">
            <input 
              type="text" 
              v-model="portraitData.bodyType" 
              class="form-input" 
              placeholder="请输入体型描述"
            >
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">体形</label>
          <div class="input-group">
            <input 
              type="text" 
              v-model="portraitData.bodyShape" 
              class="form-input" 
              placeholder="请输入体形描述"
            >
          </div>
        </div>
      </div>
      
      <!-- 风格偏好 -->
      <div class="form-section">
        <h3 class="section-title">风格偏好</h3>
        <div class="form-group">
          <label class="form-label">风格</label>
          <div class="input-group">
            <input 
              type="text" 
              v-model="portraitData.stylePreference" 
              class="form-input" 
              placeholder="请输入风格偏好"
            >
          </div>
        </div>
      </div>

      <!-- 外观特征 -->
      <div class="form-section">
        <h3 class="section-title">外观特征</h3>
        <div class="form-group">
          <label class="form-label">肤色</label>
          <div class="input-group">
            <input 
              type="text" 
              v-model="portraitData.skinTone" 
              class="form-input" 
              placeholder="请输入肤色"
            >
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">发色</label>
          <div class="input-group">
            <input 
              type="text" 
              v-model="portraitData.hairColor" 
              class="form-input" 
              placeholder="请输入发色"
            >
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">发长</label>
          <div class="input-group">
            <input 
              type="text" 
              v-model="portraitData.hairLength" 
              class="form-input" 
              placeholder="请输入发长"
            >
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">发型</label>
          <div class="input-group">
            <input 
              type="text" 
              v-model="portraitData.hairStyle" 
              class="form-input" 
              placeholder="请输入发型"
            >
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">眼睛颜色</label>
          <div class="input-group">
            <input 
              type="text" 
              v-model="portraitData.eyeColor" 
              class="form-input" 
              placeholder="请输入眼睛颜色"
            >
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">脸型</label>
          <div class="input-group">
            <input 
              type="text" 
              v-model="portraitData.faceShape" 
              class="form-input" 
              placeholder="请输入脸型"
            >
          </div>
        </div>
      </div>
      
      <!-- 其他特征 -->
      <div class="form-section">
        <h3 class="section-title">其他特征</h3>
        <div class="form-group">
          <label class="form-label">纹身描述</label>
          <div class="input-group">
            <input 
              type="text" 
              v-model="portraitData.tattooDescription" 
              class="form-input" 
              placeholder="请输入纹身描述"
            >
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">穿孔描述</label>
          <div class="input-group">
            <input 
              type="text" 
              v-model="portraitData.piercingDescription" 
              class="form-input" 
              placeholder="请输入穿孔描述"
            >
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">其他特征</label>
          <div class="input-group">
            <textarea 
              v-model="portraitData.otherFeatures" 
              class="form-textarea" 
              placeholder="请输入其他特征"
              rows="3"
            ></textarea>
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
import { saveUserPortrait } from '@/api/userPortrait'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const saving = ref(false)

// 严格按照后端数据结构定义用户画像数据
const portraitData = ref({
  profileId: '',
  userId: '',
  gender: '',
  age: 0,
  height: 0,
  weight: 0,
  bodyShape: '',
  stylePreference: '',
  skinTone: '',
  hairColor: '',
  hairLength: '',
  hairStyle: '',
  eyeColor: '',
  faceShape: '',
  bodyType: '',
  tattooDescription: '',
  piercingDescription: '',
  otherFeatures: ''
})

// 组件挂载时，从Pinia获取用户画像数据
onMounted(() => {
  try {
    // 确保设置用户ID
    if (userStore.userInfo?.userId) {
      portraitData.value.userId = userStore.userInfo.userId
    }
    
    // 从用户存储中获取画像数据
    if (userStore.userProfile) {
      let profileData = userStore.userProfile
      
      // 处理字符串形式的用户画像
      if (typeof profileData === 'string') {
        try {
          profileData = JSON.parse(profileData)
        } catch (e) {
          console.error('解析用户画像失败:', e)
        }
      }
      
      console.log('从Pinia获取到的用户画像:', profileData)
      
      // 填充所有字段
      portraitData.value = {
        ...portraitData.value, // 保留默认值结构
        profileId: profileData.profileId || '',
        userId: profileData.userId || userStore.userInfo?.userId || '',
        gender: profileData.gender || '',
        age: profileData.age || 0,
        height: profileData.height || 0,
        weight: profileData.weight || 0,
        bodyShape: profileData.bodyShape || '',
        stylePreference: profileData.stylePreference || '',
        skinTone: profileData.skinTone || '',
        hairColor: profileData.hairColor || '',
        hairLength: profileData.hairLength || '',
        hairStyle: profileData.hairStyle || '',
        eyeColor: profileData.eyeColor || '',
        faceShape: profileData.faceShape || '',
        bodyType: profileData.bodyType || '',
        tattooDescription: profileData.tattooDescription || '',
        piercingDescription: profileData.piercingDescription || '', 
        otherFeatures: profileData.otherFeatures || ''
      }
    }
  } catch (error) {
    console.error('加载用户画像失败:', error)
  } finally {
    loading.value = false
  }
})

// 保存用户画像
const savePortrait = async () => {
  saving.value = true
  
  try {
    // 确保必填字段已填写
    if (!portraitData.value.userId) {
      showToast('用户ID不能为空')
      saving.value = false
      return
    }
    
    // 准备API请求数据
    const requestData = {
      profileId: portraitData.value.profileId || '',
      userId: portraitData.value.userId,
      gender: portraitData.value.gender || '',
      age: portraitData.value.age ? Number(portraitData.value.age) : 0,
      height: portraitData.value.height ? Number(portraitData.value.height) : 0,
      weight: portraitData.value.weight ? Number(portraitData.value.weight) : 0,
      bodyShape: portraitData.value.bodyShape || '',
      stylePreference: portraitData.value.stylePreference || '',
      skinTone: portraitData.value.skinTone || '',
      hairColor: portraitData.value.hairColor || '',
      hairLength: portraitData.value.hairLength || '',
      hairStyle: portraitData.value.hairStyle || '',
      eyeColor: portraitData.value.eyeColor || '',
      faceShape: portraitData.value.faceShape || '',
      bodyType: portraitData.value.bodyType || '',
      tattooDescription: portraitData.value.tattooDescription || '',
      piercingDescription: portraitData.value.piercingDescription || '',
      otherFeatures: portraitData.value.otherFeatures || ''
    }
    
    // 调用后端API保存用户画像
    const result = await saveUserPortrait(requestData)
    
    // 打印调试信息，查看实际响应
    console.log('保存用户画像API响应:', result)
    
    // 使用更宽松的条件检查API响应
    // 后端可能直接返回true，或者是字符串"true"，或者是{data: true}格式
    if (result === true || 
        result.data === true || 
        result === 'true' || 
        result.data === 'true' ||
        String(result) === 'true' ||
        String(result.data) === 'true') {
      
      // 更新Pinia中的用户画像数据
      userStore.setUserProfile(requestData)
      
      showToast('用户画像保存成功')
      // 保存成功后返回用户画像页面
      router.push('/user-portrait')
    } else {
      console.log('API响应不符合预期:', result)
      throw new Error('保存失败')
    }
  } catch (error) {
    console.error('保存用户画像失败:', error)
    showToast('保存失败，请重试')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.edit-portrait {
  min-height: 100vh;
  background-color: #F7F7F7;
}

/* 保存按钮 */
.save-btn {
  color: #4096FF;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.save-btn:disabled {
  color: #9CA3AF;
  cursor: not-allowed;
}

/* 表单区域 */
.form-container {
  padding-top: 56px; /* 顶部导航栏高度 */
  padding-bottom: 24px;
}

.form-section {
  background-color: #FFFFFF;
  padding: 16px 24px;
  margin-bottom: 12px;
}

.section-title {
  color: #333333;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666666;
  margin-bottom: 8px;
}

.input-group {
  position: relative;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
  color: #333333;
  background-color: #FFFFFF;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #4096FF;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.1);
}

/* 单选按钮组 */
.radio-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.radio-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-input {
  margin-right: 8px;
}

.radio-label {
  font-size: 14px;
  color: #333333;
}

/* 加载指示器 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #F7F7F7;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(64, 150, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4096FF;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 16px;
  color: #666666;
  font-size: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 