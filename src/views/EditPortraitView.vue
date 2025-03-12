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
          <label class="form-label">尺码</label>
          <div class="input-group">
            <select v-model="portraitData.size" class="form-select">
              <option value="XS">XS码</option>
              <option value="S">S码</option>
              <option value="M">M码</option>
              <option value="L">L码</option>
              <option value="XL">XL码</option>
              <option value="XXL">XXL码</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 风格偏好 -->
      <div class="form-section">
        <h3 class="section-title">风格偏好</h3>
        <div class="tags-editor">
          <div class="selected-tags">
            <div 
              v-for="(tag, index) in portraitData.stylePreferences" 
              :key="'selected-style-'+index" 
              class="selected-tag"
            >
              {{ tag }}
              <button @click="removeTag('style', index)" class="remove-tag-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="add-tag-container">
            <input 
              type="text" 
              v-model="newTags.style" 
              class="tag-input" 
              placeholder="添加风格偏好" 
              @keyup.enter="addTag('style')"
            >
            <button @click="addTag('style')" class="add-tag-btn">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="suggested-tags">
            <span 
              v-for="(tag, index) in suggestedTags.style" 
              :key="'suggested-style-'+index" 
              class="suggested-tag"
              @click="addSuggestedTag('style', tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- 场景偏好 -->
      <div class="form-section">
        <h3 class="section-title">场景偏好</h3>
        <div class="tags-editor">
          <div class="selected-tags">
            <div 
              v-for="(tag, index) in portraitData.scenePreferences" 
              :key="'selected-scene-'+index" 
              class="selected-tag"
            >
              {{ tag }}
              <button @click="removeTag('scene', index)" class="remove-tag-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="add-tag-container">
            <input 
              type="text" 
              v-model="newTags.scene" 
              class="tag-input" 
              placeholder="添加场景偏好" 
              @keyup.enter="addTag('scene')"
            >
            <button @click="addTag('scene')" class="add-tag-btn">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="suggested-tags">
            <span 
              v-for="(tag, index) in suggestedTags.scene" 
              :key="'suggested-scene-'+index" 
              class="suggested-tag"
              @click="addSuggestedTag('scene', tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- 颜色偏好 -->
      <div class="form-section">
        <h3 class="section-title">颜色偏好</h3>
        <div class="tags-editor">
          <div class="selected-tags">
            <div 
              v-for="(tag, index) in portraitData.colorPreferences" 
              :key="'selected-color-'+index" 
              class="selected-tag"
            >
              {{ tag }}
              <button @click="removeTag('color', index)" class="remove-tag-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div class="add-tag-container">
            <input 
              type="text" 
              v-model="newTags.color" 
              class="tag-input" 
              placeholder="添加颜色偏好" 
              @keyup.enter="addTag('color')"
            >
            <button @click="addTag('color')" class="add-tag-btn">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="suggested-tags">
            <span 
              v-for="(tag, index) in suggestedTags.color" 
              :key="'suggested-color-'+index" 
              class="suggested-tag"
              @click="addSuggestedTag('color', tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- 肤色 -->
      <div class="form-section">
        <h3 class="section-title">肤色</h3>
        <div class="radio-group">
          <label 
            v-for="(option, index) in skinToneOptions" 
            :key="'skin-'+index" 
            class="radio-option"
          >
            <input 
              type="radio" 
              :value="option" 
              v-model="portraitData.skinTone" 
              class="radio-input"
            >
            <span class="radio-label">{{ option }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import userPortraitService from '@/services/userPortraitService'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

const router = useRouter()
const loading = ref(true)
const saving = ref(false)

// 用户画像数据
const portraitData = ref({
  height: 0,
  weight: 0,
  size: '',
  stylePreferences: [],
  scenePreferences: [],
  colorPreferences: [],
  skinTone: ''
})

// 获取用户画像数据
onMounted(async () => {
  try {
    loading.value = true
    const data = await userPortraitService.getUserPortrait()
    portraitData.value = { ...data }
  } catch (error) {
    console.error('获取用户画像失败:', error)
  } finally {
    loading.value = false
  }
})

// 新标签输入
const newTags = ref({
  style: '',
  scene: '',
  color: ''
})

// 建议标签
const suggestedTags = ref({
  style: ['甜美可爱', '学院风', '复古', '街头', '运动休闲', '波西米亚'],
  scene: ['party', '居家', '运动', '旅行', '音乐节', '电影院'],
  color: ['蓝色', '粉色', '红色', '绿色', '紫色', '灰色', '咖啡色']
})

// 肤色选项
const skinToneOptions = ref([
  '自然白皙', '象牙白', '中性色', '橄榄色', '小麦色', '深棕色'
])

// 添加标签
const addTag = (type) => {
  if (newTags.value[type] && newTags.value[type].trim()) {
    // 确保没有重复标签
    const newTag = newTags.value[type].trim()
    if (!portraitData.value[`${type}Preferences`].includes(newTag)) {
      portraitData.value[`${type}Preferences`].push(newTag)
    }
    newTags.value[type] = ''
  }
}

// 添加建议标签
const addSuggestedTag = (type, tag) => {
  if (!portraitData.value[`${type}Preferences`].includes(tag)) {
    portraitData.value[`${type}Preferences`].push(tag)
  }
}

// 删除标签
const removeTag = (type, index) => {
  portraitData.value[`${type}Preferences`].splice(index, 1)
}

// 保存用户画像
const savePortrait = async () => {
  try {
    saving.value = true
    await userPortraitService.saveUserPortrait(portraitData.value)
    // 显示成功提示
    alert('用户画像保存成功')
    // 保存成功后返回用户画像页面
    router.push('/user-portrait')
  } catch (error) {
    console.error('保存用户画像失败:', error)
    alert('保存失败，请重试')
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

.form-input, .form-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
  color: #333333;
  background-color: #FFFFFF;
}

.form-input:focus, .form-select:focus {
  border-color: #4096FF;
  outline: none;
}

/* 标签编辑器 */
.tags-editor {
  margin-bottom: 16px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  background: rgba(64, 150, 255, 0.1);
  color: #4096FF;
  border-radius: 9999px;
  font-size: 14px;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: #4096FF;
  margin-left: 6px;
  cursor: pointer;
  font-size: 12px;
}

.add-tag-container {
  display: flex;
  margin-bottom: 12px;
}

.tag-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px 0 0 8px;
  font-size: 14px;
}

.add-tag-btn {
  padding: 0 12px;
  background-color: #4096FF;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
}

.suggested-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggested-tag {
  display: inline-block;
  padding: 6px 10px;
  background: #F3F4F6;
  color: #666666;
  border-radius: 9999px;
  font-size: 14px;
  cursor: pointer;
}

.suggested-tag:hover {
  background: #E5E7EB;
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