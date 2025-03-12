import { reactive } from 'vue'

// 用户画像数据存储
const portraitData = reactive({
  height: 165,
  weight: 50,
  size: 'S',
  stylePreferences: ['简约知性', '优雅气质', '职场精英', '轻奢时尚'],
  scenePreferences: ['职场通勤', '商务会议', '约会', '休闲度假'],
  colorPreferences: ['黑色', '白色', '米色', '藏青色'],
  skinTone: '自然白皙'
})

// 模拟 API 调用获取用户画像
const getUserPortrait = () => {
  // 在实际应用中，这里应该是一个API请求
  // 例如: return api.get('/user/portrait')
  
  // 这里我们直接返回本地数据
  return Promise.resolve({ ...portraitData })
}

// 模拟 API 调用保存用户画像
const saveUserPortrait = (data) => {
  // 在实际应用中，这里应该是一个API请求
  // 例如: return api.post('/user/portrait', data)
  
  // 这里我们直接更新本地数据
  Object.assign(portraitData, data)
  return Promise.resolve({ success: true })
}

export default {
  portraitData,
  getUserPortrait,
  saveUserPortrait
} 