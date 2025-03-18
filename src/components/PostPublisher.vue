<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'publish']);

// 内容输入
const content = ref('');
const contentPlaceholder = '分享你的穿搭心得...';

// 媒体类型
const activeMediaType = ref('image');

// 图片列表
const imageList = ref([]);

// 视频数据
const videoUrl = ref('');

// 常用标签列表 - 修改为包含 id 和 name 的对象
const hardTags = [
  { id: '1234567890128', name: '生活' },
  { id: '1234567890129', name: '工作' },
  { id: '1234567890130', name: '休闲' },
  { id: '1234567890131', name: '运动' },
  { id: '1234567890132', name: '聚会' },
  { id: '1234567890133', name: '约会' },
  { id: '1234567890134', name: '其他' }
];

// 选中的硬标签 - 存储 ID 而不是名称
const selectedHardTag = ref('1234567890128'); // 默认选择"生活"

// 软标签输入
const softTags = ref('');

// 切换媒体类型
const switchMediaType = (type) => {
  activeMediaType.value = type;
  
  // 清空其他类型的媒体
  if (type === 'image') {
    videoUrl.value = '';
  } else {
    imageList.value = [];
  }
};

// 处理图片上传
const handleImageUpload = (event) => {
  const files = event.target.files;
  if (!files || !files.length) return;
  
  // 处理多图上传
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('file', file); // 直接使用原始文件对象
    
    // 保存预览图
    const reader = new FileReader();
    reader.onload = (e) => {
      imageList.value.push({
        id: Date.now() + i,
        file: formData, // 保存 FormData 对象而不是文件对象
        url: e.target.result
      });
    };
    reader.readAsDataURL(file);
  }
  
  // 清空input，以便可以重复选择同一文件
  event.target.value = '';
};

// 删除图片
const deleteImage = (imageId) => {
  imageList.value = imageList.value.filter(img => img.id !== imageId);
};

// 处理视频上传
const handleVideoUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // 创建 FormData 对象
  const formData = new FormData();
  formData.append('file', file); // 直接使用原始文件对象
  
  // 保存预览图
  const reader = new FileReader();
  reader.onload = (e) => {
    videoUrl.value = {
      file: formData, // 保存 FormData 对象而不是文件对象
      url: e.target.result
    };
  };
  reader.readAsDataURL(file);
  
  // 清空input，以便可以重复选择同一文件
  event.target.value = '';
};

// 删除视频
const deleteVideo = () => {
  videoUrl.value = '';
};

// 选择硬标签
const selectHardTag = (tagId) => {
  selectedHardTag.value = tagId;
};

// 选择软标签
const toggleSoftTag = (tag) => {
  const tagText = '#' + tag;
  
  // 如果输入框为空，直接添加标签
  if (!softTags.value.trim()) {
    softTags.value = tagText;
  } else {
    // 检查是否已有该标签
    if (!softTags.value.includes(tagText)) {
      // 确保添加的格式正确
      if (softTags.value.endsWith('#')) {
        softTags.value += tag;
      } else if (softTags.value.endsWith(' ')) {
        softTags.value += tagText;
      } else {
        softTags.value += ' ' + tagText;
      }
    }
  }
};

// 发布帖子
const publishPost = () => {
  // 验证
  if (!content.value.trim()) {
    alert('请输入帖子内容');
    return;
  }
  
  // 验证媒体
  let hasMedia = false;
  if (activeMediaType.value === 'image') {
    hasMedia = imageList.value.length > 0;
  } else {
    hasMedia = !!videoUrl.value;
  }
  
  if (!hasMedia) {
    alert('请上传' + (activeMediaType.value === 'image' ? '图片' : '视频'));
    return;
  }
  
  // 收集的数据
  const postData = {
    content: content.value,
    mediaType: activeMediaType.value,
    media: activeMediaType.value === 'image' ? imageList.value : videoUrl.value,
    tag: selectedHardTag.value, // 直接使用标签 ID
    customTags: softTags.value.split(/\s+/).filter(tag => tag.startsWith('#')).map(tag => tag.slice(1))
  };
  
  // 发送数据
  emit('publish', postData);
  
  // 清空表单
  resetForm();
};

// 重置表单
const resetForm = () => {
  content.value = '';
  activeMediaType.value = 'image';
  imageList.value = [];
  videoUrl.value = '';
  selectedHardTag.value = '1234567890128'; // 重置为"生活"的 ID
  softTags.value = '';
};

// 关闭弹窗
const closePublisher = () => {
  emit('close');
  resetForm();
};
</script>

<template>
  <div v-if="visible" class="post-publisher-overlay">
    <div class="post-publisher">
      <!-- 顶部导航栏 -->
      <nav class="publisher-nav">
        <button @click="closePublisher" class="nav-back-button">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h1 class="nav-title">发布帖子</h1>
        <button @click="publishPost" class="publish-button">发布</button>
      </nav>

      <!-- 主要内容区 -->
      <div class="publisher-content">
        
        <!-- 内容输入 -->
        <div class="input-area">
          <textarea
            v-model="content"
            :placeholder="contentPlaceholder"
            class="content-input"
          ></textarea>
          
          <!-- 媒体类型切换 -->
          <div class="media-type-switcher">
            <div 
              :class="['media-type-option', { active: activeMediaType === 'image' }]" 
              @click="switchMediaType('image')"
            >
              <i class="fas fa-image"></i> 图片
            </div>
            <div 
              :class="['media-type-option', { active: activeMediaType === 'video' }]" 
              @click="switchMediaType('video')"
            >
              <i class="fas fa-video"></i> 视频
            </div>
          </div>
          
          <!-- 图片上传区域 -->
          <div v-if="activeMediaType === 'image'" class="image-upload-section">
            <!-- 预览图 -->
            <div 
              v-for="image in imageList" 
              :key="image.id" 
              class="image-preview"
            >
              <img :src="image.url" alt="预览图">
              <button class="delete-button" @click="deleteImage(image.id)">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <!-- 添加图片按钮 -->
            <label class="add-image" v-if="imageList.length < 9">
              <i class="fas fa-plus"></i>
              <span>添加图片</span>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                class="hidden-input" 
                @change="handleImageUpload"
              >
            </label>
          </div>
          
          <!-- 视频上传区域 -->
          <div v-else class="video-upload-section">
            <!-- 视频预览 -->
            <div v-if="videoUrl" class="video-preview">
              <video 
                controls 
                :src="videoUrl.url"
                class="video-preview-player"
                preload="metadata"
              >
                您的浏览器不支持视频播放
              </video>
              <button class="delete-button" @click="deleteVideo">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <!-- 添加视频按钮 -->
            <label v-if="!videoUrl" class="add-video">
              <i class="fas fa-film"></i>
              <span>添加视频</span>
              <span class="hint-text">仅支持上传一个视频</span>
              <input 
                type="file" 
                accept="video/*" 
                class="hidden-input" 
                @change="handleVideoUpload"
              >
            </label>
          </div>
        </div>
        
        <!-- 硬标签选择 -->
        <div class="tag-section">
          <h3 class="section-title">选择一个类别 <span class="required">*</span></h3>
          <div class="hard-tags">
            <button
              v-for="tag in hardTags"
              :key="tag.id"
              :class="['hard-tag-item', { selected: selectedHardTag === tag.id }]"
              @click="selectHardTag(tag.id)"
            >
              {{ tag.name }}
            </button>
          </div>
        </div>
        
        <!-- 软标签输入 -->
        <div class="tag-section">
          <h3 class="section-title">添加穿搭标签</h3>
          <p class="section-desc">用#分隔多个标签，例如：#日常穿搭#职场搭配#简约风</p>
          <input 
            type="text" 
            v-model="softTags" 
            class="soft-tag-input" 
            placeholder="输入标签..."
          >
          
          <div class="common-tags">
            <div class="section-subtitle">常用标签：</div>
            <div class="tag-items">
              <div 
                v-for="tag in ['生活', '职场穿搭', '休闲风格', '春季搭配', '配饰搭配']" 
                :key="tag"
                :class="['tag-item', { selected: tag.selected }]"
                @click="toggleSoftTag(tag); tag.selected = !tag.selected"
              >
                # {{ tag }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-publisher-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.post-publisher {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.publisher-nav {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: white;
}

.nav-back-button {
  background: none;
  border: none;
  font-size: 1.125rem;
  color: #666;
  padding: 4px 8px;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 1.125rem;
  font-weight: 500;
}

.publish-button {
  padding: 6px 16px;
  background-color: #3B82F6;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.publisher-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #F7F7F7;
}

.input-area {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.content-input {
  width: 100%;
  min-height: 100px;
  border: none;
  outline: none;
  resize: none;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 16px;
}

.media-type-switcher {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #E5E7EB;
  margin-bottom: 16px;
}

.media-type-option {
  flex: 1;
  text-align: center;
  padding: 10px;
  font-size: 0.875rem;
  color: #6B7280;
  background: #F9FAFB;
  cursor: pointer;
}

.media-type-option.active {
  background: #3B82F6;
  color: white;
}

.image-upload-section,
.video-upload-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-preview {
  position: relative;
  width: calc(33.333% - 6px);
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-button {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
}

.add-image {
  width: calc(33.333% - 6px);
  aspect-ratio: 1;
  background: #F3F4F6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  font-size: 0.8125rem;
  cursor: pointer;
}

.add-image i {
  font-size: 1.25rem;
  margin-bottom: 8px;
}

.video-upload-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.video-preview {
  position: relative;
  width: 100%;
  margin-bottom: 12px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #000;
}

.video-preview-player {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.add-video {
  width: 100%;
  aspect-ratio: 16/9;
  background: #F3F4F6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  cursor: pointer;
}

.add-video i {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.hint-text {
  font-size: 0.75rem;
  color: #9CA3AF;
  margin-top: 4px;
}

.hidden-input {
  display: none;
}

.tag-section {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 12px;
  color: #111827;
}

.required {
  color: #EF4444;
}

.section-desc {
  font-size: 0.875rem;
  color: #6B7280;
  margin-bottom: 12px;
}

.hard-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hard-tag-item {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9375rem;
  background-color: #F3F4F6;
  color: #4B5563;
  cursor: pointer;
}

.hard-tag-item.selected {
  background-color: #3B82F6;
  color: white;
}

.soft-tag-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.9375rem;
  margin-top: 4px;
  outline: none;
}

.soft-tag-input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.section-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 16px 0 8px;
}

.tag-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  background-color: #F3F4F6;
  color: #4B5563;
  cursor: pointer;
}

.tag-item.selected {
  background-color: #EBF5FF;
  color: #3B82F6;
}
</style> 