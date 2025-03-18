<template>
  <div v-if="show" class="profile-overlay">
    <div class="profile-panel">
      <div class="panel-header">
        <h2>填写个人信息(选填)</h2>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="panel-body">
        <!-- 添加标签页切换 -->
        <van-tabs v-model:active="activeTab" animated swipeable>
          <van-tab title="基本信息">
            <form @submit.prevent="saveProfile">
              <!-- 性别选择 -->
              <div class="form-group">
                <label>性别</label>
                <div class="gender-options">
                  <button 
                    type="button"
                    @click="profileData.gender = 'male'"
                    :class="{'selected': profileData.gender === 'male'}"
                  >男性</button>
                  <button 
                    type="button"
                    @click="profileData.gender = 'female'"
                    :class="{'selected': profileData.gender === 'female'}"
                  >女性</button>
                </div>
              </div>
              
              <!-- 年龄 -->
              <div class="form-group">
                <label>年龄</label>
                <input 
                  type="number" 
                  v-model="profileData.age" 
                  min="1" 
                  max="120"
                  placeholder="请输入年龄"
                />
              </div>
              
              <!-- 身高 -->
              <div class="form-group">
                <label>身高 (cm)</label>
                <input 
                  type="number" 
                  v-model="profileData.height" 
                  min="50" 
                  max="250"
                  placeholder="请输入身高"
                />
              </div>
              
              <!-- 体重 -->
              <div class="form-group">
                <label>体重 (kg)</label>
                <input 
                  type="number" 
                  v-model="profileData.weight" 
                  min="20" 
                  max="300"
                  placeholder="请输入体重"
                />
              </div>
              
              <!-- 体型 -->
              <div class="form-group">
                <label>体型</label>
                <input 
                  type="text" 
                  v-model="profileData.bodyShape" 
                  placeholder="请描述您的体型"
                />
              </div>
            </form>
          </van-tab>
          
          <van-tab title="外貌特征">
            <form>
              <!-- 肤色 -->
              <div class="form-group">
                <label>肤色</label>
                <input 
                  type="text" 
                  v-model="profileData.skinTone" 
                  placeholder="请描述您的肤色"
                />
              </div>
              
              <!-- 发色 -->
              <div class="form-group">
                <label>发色</label>
                <input 
                  type="text" 
                  v-model="profileData.hairColor" 
                  placeholder="请描述您的发色"
                />
              </div>
              
              <!-- 发长 -->
              <div class="form-group">
                <label>发长</label>
                <input 
                  type="text" 
                  v-model="profileData.hairLength" 
                  placeholder="请描述您的发长"
                />
              </div>
              
              <!-- 发型 -->
              <div class="form-group">
                <label>发型</label>
                <input 
                  type="text" 
                  v-model="profileData.hairStyle" 
                  placeholder="请描述您的发型"
                />
              </div>
              
              <!-- 眼睛颜色 -->
              <div class="form-group">
                <label>眼睛颜色</label>
                <input 
                  type="text" 
                  v-model="profileData.eyeColor" 
                  placeholder="请描述您的眼睛颜色"
                />
              </div>
              
              <!-- 脸型 -->
              <div class="form-group">
                <label>脸型</label>
                <input 
                  type="text" 
                  v-model="profileData.faceShape" 
                  placeholder="请描述您的脸型"
                />
              </div>
            </form>
          </van-tab>
          
          <van-tab title="穿搭偏好">
            <form>
              <!-- 风格偏好 -->
              <div class="form-group">
                <label>穿搭风格偏好</label>
                <input 
                  type="text" 
                  v-model="profileData.stylePreference" 
                  placeholder="请描述您喜欢的穿搭风格"
                />
              </div>
              
              <!-- 纹身描述 -->
              <div class="form-group">
                <label>纹身描述</label>
                <textarea 
                  v-model="profileData.tattooDescription" 
                  placeholder="如有纹身，请描述位置和样式"
                  rows="3"
                ></textarea>
              </div>
              
              <!-- 穿孔描述 -->
              <div class="form-group">
                <label>穿孔描述</label>
                <textarea 
                  v-model="profileData.piercingDescription" 
                  placeholder="如有穿孔，请描述位置和类型"
                  rows="3"
                ></textarea>
              </div>
              
              <!-- 其他特征 -->
              <div class="form-group">
                <label>其他特征或偏好</label>
                <textarea 
                  v-model="profileData.otherFeatures" 
                  placeholder="其他相关的外观特征或搭配偏好"
                  rows="3"
                ></textarea>
              </div>
            </form>
          </van-tab>
        </van-tabs>
        
        <!-- 按钮区域 -->
        <div class="button-group">
          <button @click="saveProfile" class="submit-btn" :disabled="loading">
            <van-loading v-if="loading" size="18px" color="white" />
            <span v-else>保存信息</span>
          </button>
          <button type="button" @click="skipProfile" class="skip-btn" :disabled="loading">
            <span v-if="skipLoading">处理中...</span>
            <span v-else>暂不填写</span>
          </button>
        </div>
        <p class="text-sm text-gray-500 mt-2 text-center">您可以随时在"个人中心"修改信息</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { updateProfile } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'save', 'skip'])

const userStore = useUserStore()
const loading = ref(false)
const skipLoading = ref(false)
const activeTab = ref(0)

// 获取已有用户信息（如果存在）
const getUserProfile = () => {
  if (!userStore.userProfile) return null;
  
  try {
    if (typeof userStore.userProfile === 'string') {
      return JSON.parse(userStore.userProfile);
    }
    return userStore.userProfile;
  } catch (e) {
    console.error('解析用户画像失败:', e);
    return null;
  }
}

const existingProfile = getUserProfile();

// 初始化表单数据，添加所有字段
const profileData = reactive({
  gender: existingProfile?.gender || '',
  age: existingProfile?.age || '',
  height: existingProfile?.height || '',
  weight: existingProfile?.weight || '',
  bodyShape: existingProfile?.bodyShape || '',
  stylePreference: existingProfile?.stylePreference || '',
  skinTone: existingProfile?.skinTone || '',
  hairColor: existingProfile?.hairColor || '',
  hairLength: existingProfile?.hairLength || '',
  hairStyle: existingProfile?.hairStyle || '',
  eyeColor: existingProfile?.eyeColor || '',
  faceShape: existingProfile?.faceShape || '',
  bodyType: existingProfile?.bodyType || '',
  tattooDescription: existingProfile?.tattooDescription || '',
  piercingDescription: existingProfile?.piercingDescription || '',
  otherFeatures: existingProfile?.otherFeatures || ''
})

// 保存用户画像
const saveProfile = async () => {
  loading.value = true
  
  try {
    // 创建一个有效的数据对象，过滤掉空值
    const profileToSave = {};
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== '' && profileData[key] !== null && profileData[key] !== undefined) {
        profileToSave[key] = profileData[key];
      }
    });
    
    // 添加用户ID
    if (userStore.userInfo && userStore.userInfo.userId) {
      profileToSave.userId = userStore.userInfo.userId;
      
      // 如果已有profileId，也添加上
      if (existingProfile && existingProfile.profileId) {
        profileToSave.profileId = existingProfile.profileId;
      }
    } else {
      throw new Error('未找到用户ID，无法保存个人信息');
    }
    
    // 调用API保存数据
    const success = await updateProfile(profileToSave);
    
    if (success === true) {
      // 更新本地store
      userStore.setUserProfile(profileToSave);
      showToast('个人信息已保存');
      emit('save', profileToSave);
    } else {
      throw new Error('保存失败，请稍后再试');
    }
  } catch (error) {
    console.error('保存用户画像失败:', error);
    showToast('保存失败: ' + (error.message || '请稍后再试'));
  } finally {
    loading.value = false;
  }
}

// 跳过填写用户画像，但仍发送最小请求
const skipProfile = async () => {
  skipLoading.value = true;
  
  try {
    // 创建只包含用户ID的最小请求对象
    const minimalProfileData = {};
    
    // 添加用户ID
    if (userStore.userInfo && userStore.userInfo.userId) {
      minimalProfileData.userId = userStore.userInfo.userId;
      
      // 如果已有profileId，也添加上
      if (existingProfile && existingProfile.profileId) {
        minimalProfileData.profileId = existingProfile.profileId;
      }
    } else {
      throw new Error('未找到用户ID，无法处理请求');
    }
    
    // 调用API发送最小请求
    const success = await updateProfile(minimalProfileData);
    
    if (success === true) {
      // 不更新本地store中的用户画像数据
      console.log('已向服务器发送最小用户画像请求');
      emit('skip');
    } else {
      throw new Error('处理失败，请稍后再试');
    }
  } catch (error) {
    console.error('跳过用户画像失败:', error);
    // 即使失败也允许用户关闭弹窗
    emit('skip');
  } finally {
    skipLoading.value = false;
  }
}
</script>

<style scoped>
.profile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 0 20px;
}

.profile-panel {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.panel-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #999;
}

.panel-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.gender-options {
  display: flex;
  gap: 10px;
}

.gender-options button {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
}

.gender-options button.selected {
  background-color: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.submit-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  min-width: 120px;
}

.submit-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.skip-btn {
  background: none;
  border: none;
  color: #999;
  text-decoration: underline;
  cursor: pointer;
}

.skip-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* 选项卡样式调整 */
:deep(.van-tabs__wrap) {
  margin-bottom: 15px;
}
</style> 