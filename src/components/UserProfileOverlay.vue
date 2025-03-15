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
          
          <!-- 按钮区域 -->
          <div class="button-group">
            <button type="submit" class="submit-btn">保存信息</button>
            <button type="button" @click="$emit('skip')" class="skip-btn">暂不填写</button>
          </div>
        </form>
        <p class="text-sm text-gray-500 mt-2 text-center">您可以随时修改个人信息</p>
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

// 初始化表单数据
const profileData = reactive({
  gender: userStore.userProfile?.gender || '',
  age: userStore.userProfile?.age || '',
  height: userStore.userProfile?.height || '',
  weight: userStore.userProfile?.weight || '',
})

// 保存用户画像
const saveProfile = async () => {
  // 不做任何必填验证，用户可以随意填写或不填
  loading.value = true
  
  try {
    // 创建一个有效的数据对象，过滤掉空值以避免API错误
    const profileToSave = {};
    Object.keys(profileData).forEach(key => {
      if (profileData[key] !== '' && profileData[key] !== null && profileData[key] !== undefined) {
        profileToSave[key] = profileData[key];
      }
    });
    
    // 添加用户ID
    if (userStore.userInfo && userStore.userInfo.userId) {
      profileToSave.userId = userStore.userInfo.userId;
    } else {
      throw new Error('未找到用户ID，无法保存个人信息');
    }
    
    // 调用API保存数据 - API返回布尔值
    const success = await updateProfile(profileToSave);
    
    // 如果API调用成功，更新本地store
    if (success === true) {
      // 直接使用填写的数据更新userStore
      userStore.setUserProfile(profileToSave);
      showToast('个人信息已保存');
      emit('save', profileData);
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
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input {
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
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.skip-btn {
  background: none;
  border: none;
  color: #999;
  text-decoration: underline;
  cursor: pointer;
}
</style> 