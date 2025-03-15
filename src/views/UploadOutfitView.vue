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
          <div class="bg-white rounded-lg p-6 shadow-sm evaluation-card">
            <div class="flex items-center justify-between">
              <div class="score-ring" :style="`--score: ${reviewData.score * 10}`">
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-3xl font-bold text-indigo-600">{{ reviewData.score }}</span>
                </div>
              </div>
              <div class="ml-6 flex-1">
                <h3 class="text-lg font-semibold text-gray-900">总体评分</h3>
                <p class="text-gray-600 mt-2">{{ reviewData.summary }}</p>
              </div>
            </div>
          </div>

          <!-- 图片描述 -->
          <div class="bg-white rounded-lg p-6 shadow-sm evaluation-card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              <i class="fas fa-image text-indigo-600 mr-2"></i>图片描述
            </h3>
            <p class="text-gray-600">{{ reviewData.description }}</p>
          </div>

          <!-- 优点分析 -->
          <div class="bg-white rounded-lg p-6 shadow-sm evaluation-card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              <i class="fas fa-thumbs-up text-green-600 mr-2"></i>优点分析
            </h3>
            <ul class="space-y-2 text-gray-600">
              <li v-for="(point, index) in reviewData.advantages" :key="index">
                <i class="fas fa-check text-green-500 mr-2"></i>{{ point }}
              </li>
            </ul>
          </div>

          <!-- 不足之处 -->
          <div class="bg-white rounded-lg p-6 shadow-sm evaluation-card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              <i class="fas fa-exclamation-circle text-yellow-600 mr-2"></i>不足之处
            </h3>
            <ul class="space-y-2 text-gray-600">
              <li v-for="(point, index) in reviewData.disadvantages" :key="index">
                <i class="fas fa-minus text-yellow-500 mr-2"></i>{{ point }}
              </li>
            </ul>
          </div>

          <!-- 改进建议 -->
          <div class="bg-white rounded-lg p-6 shadow-sm evaluation-card">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              <i class="fas fa-lightbulb text-blue-600 mr-2"></i>改进建议
            </h3>
            <div class="space-y-4">
              <p v-for="(suggestion, index) in reviewData.suggestions" :key="index" class="text-gray-600">
                {{ index + 1 }}. {{ suggestion }}
              </p>
            </div>
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
import SubPageNavBar from '@/components/SubPageNavBar.vue'
import { useOutfitStore } from '@/stores/outfitStore'
// TODO: 取消注释使用真实API
// import { uploadOutfitImage, evaluateOutfit } from '@/api/outfit'

export default {
  name: 'UploadOutfitView',
  components: {
    SubPageNavBar
  },
  data() {
    return {
      previewImage: '',
      isLoading: false,
      file: null,
      uploadedImageUrl: '', // 存储上传成功后的URL
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
        advantages: [],
        disadvantages: [],
        suggestions: []
      },
      // 新增状态变量
      uploadCompleted: false,
      evaluationCompleted: false,
      minAnimationTime: 2500, // 最小动画时间（毫秒）
      animationStartTime: 0
    }
  },
  computed: {
    analysisStatusText() {
      return this.analysisStatusTexts[this.analysisStatus % this.analysisStatusTexts.length]
    },
    outfitStore() {
      return useOutfitStore()
    }
  },
  mounted() {
    // 首先检查store中是否有当前选中的评价
    const currentEval = this.outfitStore.currentEvaluation
    
    if (currentEval) {
      // 如果store中有数据，直接使用
      this.loadReviewFromStore(currentEval)
    } else {
      // 如果store中没有数据，尝试从URL参数获取
      const id = this.$route.query.id
      const image = this.$route.query.image
      if (id && image) {
        this.loadReviewById(id, image)
      }
    }
  },
  methods: {
    /**
     * 从store中加载评价数据
     */
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
    
    /**
     * 根据ID和图片路径加载评价
     */
    async loadReviewById(userId, imagePath) {
      this.isLoading = true
      this.previewImage = imagePath
      
      try {
        // 首先检查store中是否有该评价数据
        if (this.outfitStore.evaluations.length === 0) {
          // 如果store中还没有数据，先获取数据
          await this.outfitStore.fetchEvaluations()
        }
        
        // 在store中查找对应的评价
        const evaluation = this.outfitStore.findEvaluationByIdAndImage(userId, imagePath)
        
        if (evaluation) {
          // 找到评价，加载数据
          this.loadReviewFromStore(evaluation)
        } else {
          // 未找到评价，使用模拟数据
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
    
    /**
     * 处理文件选择变更
     */
    handleFileChange(event) {
      const files = event.target.files
      if (!files.length) return
      
      this.file = files[0]
      
      // 验证文件类型和大小
      if (!this.validateFile(this.file)) return
      
      // 创建预览
      this.createPreview(this.file)
    },
    
    /**
     * 验证文件
     */
    validateFile(file) {
      // 验证文件类型
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        alert('请上传JPG或PNG格式的图片')
        return false
      }
      
      // 验证文件大小（10MB限制）
      if (file.size > 10 * 1024 * 1024) {
        alert('图片大小不能超过10MB')
        return false
      }
      
      return true
    },
    
    /**
     * 创建图片预览
     */
    createPreview(file) {
      const reader = new FileReader()
      reader.onload = e => {
        this.previewImage = e.target.result
      }
      reader.readAsDataURL(file)
    },
    
    /**
     * 删除预览图片
     */
    removeImage() {
      this.previewImage = ''
      this.file = null
      this.uploadedImageUrl = ''
      
      // 重置文件输入框，允许重新选择同一文件
      const fileInput = document.getElementById('image-upload')
      if (fileInput) fileInput.value = ''
    },
    
    /**
     * 提交图片进行AI评价
     */
    async submitImage() {
      if (!this.previewImage || this.isLoading) return
      
      this.isLoading = true
      this.uploadCompleted = false
      this.evaluationCompleted = false
      this.animationStartTime = Date.now()
      this.startAnalysisAnimation()
      
      // 同时启动上传和动画
      try {
        // 1. 上传图片
        await this.uploadImage()
        this.uploadCompleted = true
        
        // 2. 获取AI评价
        await this.getAIEvaluation()
        this.evaluationCompleted = true
        
        // 3. 确保至少播放了最小动画时间
        await this.ensureMinAnimationTime()
        
        // 4. 显示结果
        this.showResult = true
      } catch (error) {
        console.error('处理图片失败:', error)
        alert('无法处理图片，请稍后再试')
      } finally {
        this.isLoading = false
        if (this.analysisInterval) {
          clearInterval(this.analysisInterval)
          this.analysisInterval = null
        }
      }
    },
    
    /**
     * 确保至少播放了最小动画时间
     */
    async ensureMinAnimationTime() {
      const elapsed = Date.now() - this.animationStartTime
      const remaining = this.minAnimationTime - elapsed
      
      if (remaining > 0) {
        return new Promise(resolve => {
          console.log(`API调用完成，等待动画结束还需${remaining}ms`)
          setTimeout(resolve, remaining)
        })
      }
    },
    
    /**
     * 上传图片到服务器
     */
    async uploadImage() {
      // TODO: 取消注释使用真实API
      // const formData = new FormData()
      // formData.append('file', this.file)
      // const response = await uploadOutfitImage(formData)
      // this.uploadedImageUrl = response.imageUrl
      
      // 模拟上传延迟和URL生成
      return new Promise(resolve => {
        const uploadTime = Math.random() * 2000 + 500 // 随机500-2500ms，更真实地模拟变化的网络条件
        
        console.log(`模拟图片上传，需要${uploadTime}ms`)
        setTimeout(() => {
          // 模拟上传成功后返回的URL
          this.uploadedImageUrl = `https://api.example.com/uploads/${Date.now()}.jpg`
          resolve()
        }, uploadTime)
      })
    },
    
    /**
     * 获取AI评价
     */
    async getAIEvaluation() {
      // 确保图片已上传
      if (!this.uploadedImageUrl) {
        throw new Error('图片未上传成功')
      }
      
      // TODO: 取消注释使用真实API
      // const userId = localStorage.getItem('userId') || '1' 
      // const data = {
      //   userId,
      //   imageUrl: this.uploadedImageUrl
      // }
      // const result = await evaluateOutfit(data)
      // this.reviewData = result
      
      // 模拟AI评价延迟和结果
      return new Promise(resolve => {
        const aiTime = Math.random() * 4000 + 1000 // 随机1000-5000ms，模拟AI处理时间的变化
        
        console.log(`模拟AI评价，需要${aiTime}ms`)
        setTimeout(() => {
          // 获取评价数据
          this.reviewData = this.getMockReviewData()
          
          // 更新动画状态到最后阶段
          this.analysisStatus = this.analysisStatusTexts.length - 1
          
          // 将评价保存到store中（添加到评价历史记录）
          const userId = localStorage.getItem('userId') || '1'
          const evaluation = {
            userId: userId,
            imagePath: this.previewImage, // 使用当前预览图片作为图片路径
            description: this.reviewData.description,
            advantages: this.reviewData.advantages,
            disadvantages: this.reviewData.disadvantages,
            suggestions: this.reviewData.suggestions,
            score: this.reviewData.score,
            summary: this.reviewData.summary,
            createdTime: new Date().toISOString() // 使用当前时间
          }
          
          this.outfitStore.addEvaluation(evaluation)
          resolve()
        }, aiTime)
      })
    },
    
    /**
     * 重置视图状态
     */
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
        advantages: [],
        disadvantages: [],
        suggestions: []
      }
      
      // 重置文件输入框
      const fileInput = document.getElementById('image-upload')
      if (fileInput) fileInput.value = ''
    },
    
    /**
     * 启动分析动画
     */
    startAnalysisAnimation() {
      this.analysisStatus = 0
      
      // 设置分析状态自动循环
      this.analysisInterval = setInterval(() => {
        // 如果上传完成，确保至少显示第二阶段
        if (this.uploadCompleted && this.analysisStatus < 1) {
          this.analysisStatus = 1
        }
        
        // 如果评价也完成了，显示最后阶段
        if (this.evaluationCompleted) {
          this.analysisStatus = this.analysisStatusTexts.length - 1
          clearInterval(this.analysisInterval)
          this.analysisInterval = null
          return
        }
        
        // 否则正常循环显示状态
        this.analysisStatus = (this.analysisStatus + 1) % this.analysisStatusTexts.length
      }, 1200) // 状态切换间隔时间
    },
    
    /**
     * 获取模拟评价数据
     */
    getMockReviewData() {
      return {
        score: 8.7,
        summary: '整体搭配和谐时尚，色彩明快，风格统一，展现出良好的时尚感。',
        description: '这是一套休闲风格穿搭，上身为天蓝色衬衫，下身搭配深色修身牛仔裤，整体色调清新明快。服装剪裁合体，展现出良好的身材比例。',
        advantages: [
          '色彩搭配和谐统一，清新明快',
          '衣物尺寸合适，展现出良好的身材比例',
          '整体风格一致，展现出休闲自然的气质',
          '单品选择时尚实用，百搭易穿'
        ],
        disadvantages: [
          '配饰使用较少，造型层次感略显不足',
          '整体风格安全但个性不够突出',
          '鞋履选择略显普通，未能提升整体造型亮点'
        ],
        suggestions: [
          '可以考虑添加一些简约配饰，如项链、手表或帽子，增加造型的层次感',
          '尝试在单色系服装上选择有质感的面料或独特的细节设计，提升整体品质感',
          '鞋履可以考虑选择更有设计感的款式，成为整体造型的点睛之笔',
          '可以尝试在同色系中选择不同深浅的单品搭配，增加层次感'
        ]
      }
    }
  },
  beforeUnmount() {
    // 清除当前选中的评价
    this.outfitStore.setCurrentEvaluation(null)
    
    // 清除任何可能的定时器
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
</style> 