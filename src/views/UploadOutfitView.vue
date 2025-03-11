<template>
  <div class="bg-[#F5F5F5] min-h-screen">
    <!-- 顶部导航栏 -->
    <SubPageNavBar 
      title="上传穿搭" 
      :back-link="'/ai-review'"
    />

    <!-- 内容区域 -->
    <div class="content-container pt-20 pb-20 px-4">
      <!-- 上传区域 -->
      <div class="upload-area rounded-lg p-8 mb-6 bg-white text-center">
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
        <div class="bg-white rounded-lg p-4 text-center">
          <h3 class="text-lg font-medium mb-4">预览</h3>
          <img :src="previewImage" alt="穿搭预览" class="preview-image mx-auto mb-4">
          <button @click="removeImage" class="text-red-500 text-sm">
            <i class="fas fa-trash-alt mr-1"></i> 删除图片
          </button>
        </div>
      </div>

      <!-- 提交按钮 -->
      <button 
        class="btn-primary mb-6" 
        :disabled="!previewImage"
        @click="submitImage"
      >
        获取AI穿搭评价
      </button>
    </div>
  </div>
</template>

<script>
import SubPageNavBar from '@/components/SubPageNavBar.vue'

export default {
  name: 'UploadOutfitView',
  components: {
    SubPageNavBar
  },
  data() {
    return {
      previewImage: null,
      selectedFile: null
    }
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        // 验证文件类型
        if (!file.type.match('image.*')) {
          alert('请上传图片文件')
          return
        }
        
        // 验证文件大小 (10MB = 10 * 1024 * 1024 bytes)
        if (file.size > 10 * 1024 * 1024) {
          alert('图片大小不能超过10MB')
          return
        }

        // 保存选中的文件
        this.selectedFile = file

        // 创建预览
        const reader = new FileReader()
        reader.onload = (e) => {
          this.previewImage = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    removeImage() {
      this.previewImage = null
      this.selectedFile = null
      document.getElementById('image-upload').value = ''
    },
    submitImage() {
      if (!this.selectedFile) {
        alert('请先选择一张图片')
        return
      }
      
      // TODO: 实现图片上传和AI评价的逻辑
      // 这里可以添加上传到服务器的代码
      
      // 上传成功后跳转到评价记录页面
      this.$router.push('/ai-review')
    }
  },
  mounted() {
    // 添加拖放上传支持
    const uploadArea = document.querySelector('.upload-area')
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault()
      uploadArea.classList.add('bg-gray-50')
    })
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('bg-gray-50')
    })
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault()
      uploadArea.classList.remove('bg-gray-50')
      
      const file = e.dataTransfer.files[0]
      if (file) {
        // 以编程方式设置文件输入的值
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        const fileInput = document.getElementById('image-upload')
        fileInput.files = dataTransfer.files
        
        // 触发change事件
        const event = new Event('change', { bubbles: true })
        fileInput.dispatchEvent(event)
      }
    })
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

.preview-image {
  max-height: 300px;
  max-width: 100%;
  object-fit: contain;
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
  transition: background-color 0.3s ease;
}

.upload-area:hover {
  background-color: #f8f9fa;
}
</style> 