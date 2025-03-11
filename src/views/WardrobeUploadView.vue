<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <SubPageNavBar 
      title="上传衣物" 
      :back-link="'/wardrobe'"
    />

    <!-- 主要内容区 -->
    <div class="pt-16 pb-20 px-4">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- 图片上传 -->
        <div class="upload-container" @click="triggerFileInput">
          <input 
            type="file" 
            ref="fileInput"
            accept="image/*" 
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            @change="handleFileChange"
          >
          <template v-if="!previewImage">
            <i class="fas fa-camera text-3xl text-gray-400 mb-3"></i>
            <p class="text-sm text-gray-500">点击上传衣物照片</p>
            <p class="text-xs text-gray-400 mt-1">建议尺寸 800x800px</p>
          </template>
          <img v-else :src="previewImage" class="absolute inset-0 w-full h-full object-cover rounded-lg">
        </div>

        <!-- 基本信息 -->
        <div class="bg-white rounded-lg p-5 shadow-sm">
          <div class="form-group">
            <label class="form-label">衣物标题</label>
            <input 
              v-model="formData.title" 
              type="text" 
              class="form-input" 
              placeholder="请输入衣物名称，如：白色棉质衬衫"
              required
            >
          </div>

          <div class="form-group">
            <label class="form-label">衣物类型</label>
            <select v-model="formData.type" class="form-select" required>
              <option value="">请选择衣物类型</option>
              <option value="upper">上半身</option>
              <option value="lower">下半身</option>
              <option value="full">全身</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">衣物类别</label>
            <select v-model="formData.category" class="form-select" required>
              <option value="">请选择衣物类别</option>
              <option value="shirt">衬衫</option>
              <option value="tshirt">T恤</option>
              <option value="pants">裤子</option>
              <option value="dress">连衣裙</option>
              <option value="coat">外套</option>
              <option value="shoes">鞋子</option>
              <option value="accessories">配饰</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">颜色</label>
            <select v-model="formData.color" class="form-select" required>
              <option value="">请选择颜色</option>
              <option value="white">白色</option>
              <option value="black">黑色</option>
              <option value="gray">灰色</option>
              <option value="blue">蓝色</option>
              <option value="red">红色</option>
              <option value="pink">粉色</option>
              <option value="beige">米色</option>
              <option value="brown">棕色</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">适用季节</label>
            <select v-model="formData.season" class="form-select" required>
              <option value="">请选择季节</option>
              <option value="spring">春季</option>
              <option value="summer">夏季</option>
              <option value="autumn">秋季</option>
              <option value="winter">冬季</option>
              <option value="all">四季</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">风格</label>
            <select v-model="formData.style" class="form-select" required>
              <option value="">请选择风格</option>
              <option value="casual">休闲</option>
              <option value="formal">正装</option>
              <option value="business">商务</option>
              <option value="sports">运动</option>
              <option value="elegant">优雅</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">详细描述</label>
            <textarea 
              v-model="formData.description" 
              class="form-input" 
              placeholder="请输入衣物的详细描述，如面料、剪裁、穿着场合等"
              required
            ></textarea>
          </div>
        </div>
      </form>
    </div>

    <!-- 底部操作栏 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
      <button @click="handleSubmit" class="submit-btn">
        确认上传
      </button>
    </div>

    <!-- 预览图片的模态框 -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-70 items-center justify-center" 
      :class="{ 'hidden': !showPreviewModal, 'flex': showPreviewModal }"
      @click="closePreview"
    >
      <div class="bg-white p-4 rounded-lg w-11/12 max-w-lg" @click.stop>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">预览图片</h3>
          <button class="text-gray-500" @click="closePreview">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <img :src="previewImage" alt="预览图片" class="w-full rounded-lg">
        <div class="flex justify-end mt-4">
          <button @click="confirmPreview" class="px-6 py-2 bg-blue-500 text-white rounded-lg">
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

const router = useRouter()
const fileInput = ref(null)
const previewImage = ref('')
const showPreviewModal = ref(false)

// 表单数据
const formData = reactive({
  title: '',
  type: '',
  category: '',
  color: '',
  season: '',
  style: '',
  description: '',
  image: null
})

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target.result
      showPreviewModal.value = true
    }
    reader.readAsDataURL(file)
    formData.image = file
  }
}

// 关闭预览
const closePreview = () => {
  showPreviewModal.value = false
  if (!formData.image) {
    previewImage.value = ''
  }
}

// 确认预览
const confirmPreview = () => {
  showPreviewModal.value = false
}

// 提交表单
const handleSubmit = async () => {
  if (!formData.image) {
    alert('请上传衣物照片')
    return
  }

  try {
    // TODO: 实现上传逻辑
    console.log('提交的表单数据:', formData)
    
    // 上传成功后返回衣柜页面
    router.push('/wardrobe')
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败，请重试')
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  font-size: 15px;
  background-color: #FFFFFF;
  color: #333333;
}

.form-input:focus {
  outline: none;
  border-color: #4096FF;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.1);
}

.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  font-size: 15px;
  background-color: #FFFFFF;
  color: #333333;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

.form-select:focus {
  outline: none;
  border-color: #4096FF;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.1);
}

textarea.form-input {
  min-height: 100px;
  resize: vertical;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background-color: #4096FF;
  color: white;
  text-align: center;
}

.upload-container {
  width: 100%;
  aspect-ratio: 1/1;
  border: 2px dashed #DDDDDD;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #F9F9F9;
  position: relative;
  cursor: pointer;
  margin-bottom: 20px;
}
</style> 