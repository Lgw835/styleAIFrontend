<template>
  <div class="bg-[#F5F5F5] min-h-screen">
    <!-- 顶部导航栏 -->
    <SubPageNavBar 
      title="上传穿搭" 
      :back-link="'/ai-review'"
    />

    <!-- 内容区域 -->
    <div class="content-container pt-20 pb-20 px-4">
      <!-- 上传区域 - 仅在未显示评价结果且没有预览图片时显示 -->
      <div v-if="!showResult" class="upload-container">
        <!-- 上传区域框 - 仅在没有预览图片时显示 -->
        <div v-if="!previewImage" class="upload-area rounded-lg p-8 mb-6 bg-white text-center">
          <input type="file" id="image-upload" class="hidden" accept="image/*" @change="handleFileChange">
          <label for="image-upload" class="cursor-pointer">
            <div class="space-y-4">
              <i class="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
              <div class="text-gray-600">
                点击或拖拽上传穿搭照片
              </div>
              <div class="text-sm text-gray-400">
                支持 JPG、PNG 格式，大小不超过 10MB
              </div>
            </div>
          </label>
        </div>

        <!-- 图片预览区域 -->
        <div v-if="previewImage" class="mb-6">
          <!-- 普通预览模式 -->
          <div v-if="!isLoading" class="bg-white rounded-lg p-4 text-center">
            <h3 class="text-lg font-medium mb-4">预览</h3>
            <div class="flex justify-center mb-4">
              <img :src="previewImage" alt="穿搭预览" class="preview-image">
            </div>
            <button @click="removeImage" class="text-red-500 text-sm">
              <i class="fas fa-trash-alt mr-1"></i> 删除图片
            </button>
          </div>
          
          <!-- AI分析模式 - 修复居中对齐问题 -->
          <div v-else class="bg-white rounded-lg p-6 mb-6 flex flex-col items-center justify-center">
            <!-- 带发光边框的图片容器 - 修改样式确保居中 -->
            <div class="ai-scan-container mb-8 flex justify-center items-center">
              <img :src="previewImage" alt="穿搭扫描" class="preview-image">
              <div class="scan-line"></div>
            </div>
            
            <!-- AI智能分析中文字 -->
            <div class="ai-title mb-4 text-center">AI智能分析中</div>
            
            <!-- 分析状态文字 -->
            <div class="text-sm text-gray-500 mb-4 text-center">{{ analysisStatusText }}</div>
            
            <!-- 进度条 -->
            <div class="w-full max-w-md">
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-600 rounded-full progress-bar"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <button 
          class="btn-primary mb-6" 
          :disabled="!previewImage || isLoading"
          @click="submitImage"
        >
          <span v-if="!isLoading">获取AI穿搭评价</span>
          <span v-else>分析中...</span>
        </button>
      </div>

      <!-- AI评价结果区域 -->
      <div v-if="showResult" class="result-container">
        <!-- 穿搭图片展示区域 -->
        <div class="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <img :src="previewImage" class="outfit-image mx-auto" alt="穿搭图片">
        </div>

        <!-- AI评价结果区域 -->
        <div class="grid grid-cols-1 gap-6">
          <!-- 总体评分 -->
          <div class="bg-white rounded-lg p-6 shadow-sm evaluation-card flex flex-col items-center">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">总体评分</h3>
            <div class="flex items-center justify-center">
              <div class="score-ring" :style="`--score: ${reviewData.score * 10}`">
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-3xl font-bold text-indigo-600">{{ reviewData.score }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 图片描述 -->
          <div class="bg-white rounded-lg p-6 shadow-sm evaluation-card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              <i class="fas fa-image text-indigo-600 mr-2"></i>图片描述
            </h3>
            <p class="text-gray-600 whitespace-pre-line">{{ reviewData.description }}</p>
          </div>

          <!-- 优点分析 -->
          <div class="bg-white rounded-lg p-6 shadow-sm evaluation-card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              <i class="fas fa-thumbs-up text-green-600 mr-2"></i>优点分析
            </h3>
            <p class="text-gray-600">{{ reviewData.advantages }}</p>
          </div>

          <!-- 不足之处 -->
          <div class="bg-white rounded-lg p-6 shadow-sm evaluation-card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              <i class="fas fa-exclamation-circle text-yellow-600 mr-2"></i>不足之处
            </h3>
            <p class="text-gray-600">{{ reviewData.disadvantages }}</p>
          </div>

          <!-- 改进建议 -->
          <div class="bg-white rounded-lg p-6 shadow-sm evaluation-card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              <i class="fas fa-lightbulb text-blue-600 mr-2"></i>改进建议
            </h3>
            <p class="text-gray-600">{{ reviewData.suggestions }}</p>
          </div>
        </div>

        <!-- 上传新照片按钮 -->
        <button class="btn-primary mt-6" @click="resetView">
          上传新照片
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SubPageNavBar from '@/components/SubPageNavBar.vue'
import { useUserStore } from '@/stores/user'
import { useExternalDataStore } from '@/stores/externalData'
import { useOutfitStore } from '@/stores/outfitStore'
// 导入统一的API
import { uploadOutfitImage, evaluateOutfit } from '@/api/outfit'
import { showToast } from 'vant'

export default {
  name: 'UploadOutfitView',
  components: {
    SubPageNavBar
  },
  setup() {
    // 获取位置数据
    const externalDataStore = useExternalDataStore()
    // 位置加载状态
    const isLocationLoading = ref(false)
    
    // 初始化位置数据
    onMounted(async () => {
      if (!externalDataStore.locationData.city) {
        isLocationLoading.value = true
        try {
          await externalDataStore.getLocationData()
        } catch (error) {
          console.error('获取位置信息失败', error)
        } finally {
          isLocationLoading.value = false
        }
      }
    })
    
    return { externalDataStore, isLocationLoading }
  },
  data() {
    const externalDataStore = useExternalDataStore()
    const userStore = useUserStore()
    const outfitStore = useOutfitStore()
    
    return {
      previewImage: '',
      isLoading: false,
      file: null,
      uploadedImageUrl: '',
      showResult: false,
      analysisStatus: 0,
      analysisStatusTexts: [
        '正在识别图片内容...',
        '分析穿搭风格特点...',
        '评估搭配合理性...',
        '生成专业评价意见...'
      ],
      reviewData: {
        score: 0,
        summary: '',
        description: '',
        advantages: '',
        disadvantages: '',
        suggestions: ''
      },
      uploadCompleted: false,
      evaluationCompleted: false,
      minAnimationTime: 2500,
      animationStartTime: 0,
      externalDataStore,
      userStore,
      outfitStore
    }
  },
  computed: {
    analysisStatusText() {
      return this.analysisStatusTexts[this.analysisStatus % this.analysisStatusTexts.length]
    },
    userId() {
      if (this.userStore && this.userStore.userInfo && this.userStore.userInfo.id) {
        return this.userStore.userInfo.id
      }
      return localStorage.getItem('userId') || ''
    },
    locationForTracking() {
      if (!this.externalDataStore || !this.externalDataStore.locationData) {
        return '未知位置'
      }
      
      const locationData = this.externalDataStore.locationData
      
      if (locationData.city) {
        return locationData.city
      }
      
      return '未知位置'
    }
  },
  mounted() {
    const currentEval = this.outfitStore.currentEvaluation
    
    if (currentEval) {
      this.loadReviewFromStore(currentEval)
    } else {
      const id = this.$route.query.id
      const image = this.$route.query.image
      if (id && image) {
        this.loadReviewById(id, image)
      }
    }
  },
  methods: {
    loadReviewFromStore(evaluation) {
      this.previewImage = evaluation.imagePath
      this.reviewData = {
        score: evaluation.score,
        summary: evaluation.summary,
        description: evaluation.description,
        advantages: evaluation.advantages,
        disadvantages: evaluation.disadvantages,
        suggestions: evaluation.suggestions
      }
      this.showResult = true
    },
    
    async loadReviewById(userId, imagePath) {
      this.isLoading = true
      this.previewImage = imagePath
      
      try {
        if (this.outfitStore.evaluations.length === 0) {
          await this.outfitStore.fetchEvaluations()
        }
        
        const evaluation = this.outfitStore.findEvaluationByIdAndImage(userId, imagePath)
        
        if (evaluation) {
          this.loadReviewFromStore(evaluation)
        } else {
          this.reviewData = this.getMockReviewData()
          this.showResult = true
        }
      } catch (error) {
        console.error('加载评价详情失败:', error)
        alert('无法加载评价详情，请稍后再试')
      } finally {
        this.isLoading = false
      }
    },
    
    handleFileChange(event) {
      const files = event.target.files
      if (!files.length) return
      
      this.file = files[0]
      
      if (!this.validateFile(this.file)) return
      
      this.createPreview(this.file)
    },
    
    validateFile(file) {
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        alert('请上传JPG或PNG格式的图片')
        return false
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过10MB')
        return false
      }
      
      return true
    },
    
    createPreview(file) {
      const reader = new FileReader()
      reader.onload = e => {
        this.previewImage = e.target.result
      }
      reader.readAsDataURL(file)
    },
    
    removeImage() {
      this.previewImage = ''
      this.file = null
      this.uploadedImageUrl = ''
      
      const fileInput = document.getElementById('image-image-upload')
      if (fileInput) fileInput.value = ''
    },
    
    async submitImage() {
      if (!this.previewImage || this.isLoading) return
      
      this.isLoading = true
      this.analysisStatusText = '正在分析服装元素...'
      
      try {
        // 确保有用户ID
        const userId = this.userStore?.userInfo?.userId || ''
        
        // 在submitImage方法中添加文件检查
        if (!this.file) {
          throw new Error('请选择要上传的图片文件')
        }
        
        // 打印调试信息
        console.log('准备上传文件:', this.file.name, this.file.type, this.file.size)
        
        // 上传图片 - 使用统一的API
        const uploadResponse = await uploadOutfitImage({
          image: this.file,
          userId: userId
        })
        
        console.log('图片上传响应:', uploadResponse)
        
        // 检查返回的图片URL - 使用fileUrl字段
        if (!uploadResponse || !uploadResponse.fileUrl) {
          throw new Error('图片上传失败，没有获取到URL')
        }
        
        this.analysisStatusText = '正在进行穿搭评价...'
        
        // 获取定位信息
        const ipAddress = this.externalDataStore?.locationData?.city || ''
        
        // 使用fileUrl字段
        console.log('评价参数:', {
          userId: userId,
          ipAddress: ipAddress,
          url: uploadResponse.fileUrl
        })
        
        // 使用fileUrl字段传递给评价API - 使用统一的API
        const evaluationResponse = await evaluateOutfit({
          userId: userId,
          ipAddress: ipAddress,
          url: uploadResponse.fileUrl
        })
        
        console.log('评价响应:', evaluationResponse)
        
        // 保存评价结果 - 使用fileUrl作为imagePath
        this.reviewData = evaluationResponse
        this.reviewData.imagePath = uploadResponse.fileUrl
        
        // 添加到评价记录
        this.outfitStore.addEvaluation({
          ...this.reviewData,
          userId: userId,
          createdAt: new Date().toISOString()
        })
        
        // 显示结果
        this.showResult = true
      } catch (error) {
        console.error('AI评价失败:', error)
        showToast('评价失败: ' + (error.message || '服务器错误'))
      } finally {
        this.isLoading = false
      }
    },
    
    resetView() {
      this.previewImage = ''
      this.file = null
      this.isLoading = false
      this.showResult = false
      this.uploadedImageUrl = ''
      this.reviewData = {
        score: 0,
        summary: '',
        description: '',
        advantages: '',
        disadvantages: '',
        suggestions: ''
      }
      
      const fileInput = document.getElementById('image-upload')
      if (fileInput) fileInput.value = ''
    },

  },
  beforeUnmount() {
    this.outfitStore.setCurrentEvaluation(null)
    
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval)
      this.analysisInterval = null
    }
  }
}
</script>

<style scoped>
.content-container {
  min-height: calc(100vh - 56px);
  overflow-y: auto;
}

.content-container::-webkit-scrollbar {
  width: 4px;
}

.content-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.content-container::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

.preview-image, .outfit-image {
  max-height: 300px;
  max-width: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.btn-primary {
  background-color: #4096FF;
  color: white;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  width: 100%;
}

.btn-primary:disabled {
  background-color: #B3D4FF;
  cursor: not-allowed;
}

.upload-area {
  border: 2px dashed #CBD5E0;
  transition: all 0.3s ease;
}

.upload-area:hover {
  background-color: #f8f9fa;
  border-color: #4096FF;
}

.score-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(#4096FF calc(var(--score) * 3.6deg), #E5E7EB 0deg);
  position: relative;
  margin: 0 auto;
  box-shadow: 0 0 15px rgba(64, 150, 255, 0.2);
}

.score-ring::before {
  content: '';
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  background: white;
}

.evaluation-card {
  transition: transform 0.3s ease;
  background-color: white;
  border-radius: 0.5rem;
}

.evaluation-card:hover {
  transform: translateY(-2px);
}

/* AI加载动画样式 */
.ai-loading-container {
  animation: pulse 2s infinite;
}

.preview-image-container {
  width: 100%;
  max-width: 300px;
  height: 300px;
  overflow: hidden;
  position: relative;
  border-radius: 8px;
  border: 2px solid rgba(79, 70, 229, 0.3);
  box-shadow: 0 0 20px rgba(79, 70, 229, 0.2);
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, #4F46E5, transparent);
  box-shadow: 0 0 15px 3px rgba(79, 70, 229, 0.8);
  animation: scan 2s linear infinite;
  z-index: 1;
}

.progress-bar {
  width: 0%;
  animation: progress 5s linear forwards;
}

@keyframes scan {
  0% {
    top: 0;
  }
  100% {
    top: 100%;
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 rgba(79, 70, 229, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(79, 70, 229, 0.4);
  }
}

@keyframes progress {
  0% {
    width: 0%;
  }
  20% {
    width: 20%;
  }
  50% {
    width: 60%;
  }
  80% {
    width: 85%;
  }
  100% {
    width: 100%;
  }
}

.analysis-text p:first-child {
  animation: glow 1.5s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #4F46E5, 0 0 20px #4F46E5;
  }
  to {
    text-shadow: 0 0 10px #fff, 0 0 15px #818CF8, 0 0 20px #818CF8, 0 0 25px #818CF8;
  }
}

/* 修改AI扫描容器样式确保居中 */
.ai-scan-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.ai-scan-container .preview-image {
  max-height: 300px;
  max-width: 100%; 
  border-radius: 12px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  filter: blur(1px) brightness(1.1);
  opacity: 0.85;
  border: 2px solid rgba(79, 70, 229, 0.3);
  box-shadow: 0 0 15px 5px rgba(128, 90, 213, 0.4);
  animation: border-pulse 2s infinite;
}

/* 白色蒙版层 */
.ai-scan-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.25);
  pointer-events: none;
  border-radius: 12px;
}

.ai-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4F46E5;
  text-shadow: 0 0 10px rgba(79, 70, 229, 0.8);
  animation: title-glow 1.5s ease-in-out infinite alternate;
  width: 100%;
  text-align: center;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4F46E5, #8B5CF6, transparent);
  box-shadow: 0 0 20px 5px rgba(139, 92, 246, 0.8);
  animation: scan 2s linear infinite;
  z-index: 1;
  width: 100%;
}

@keyframes border-pulse {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3),
                0 0 15px 5px rgba(128, 90, 213, 0.4);
  }
  50% {
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.5),
                0 0 25px 8px rgba(128, 90, 213, 0.6);
  }
}

@keyframes title-glow {
  0%, 100% {
    text-shadow: 0 0 5px rgba(79, 70, 229, 0.8);
  }
  50% {
    text-shadow: 0 0 10px rgba(79, 70, 229, 1);
  }
}

/* 添加动画效果 */
@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 150, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(64, 150, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 150, 255, 0);
  }
}

.score-ring {
  animation: pulse-ring 2s infinite;
}
</style> 