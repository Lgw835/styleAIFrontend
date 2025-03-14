<script setup>
import { ref } from 'vue';
import TopNavBar from '@/components/TopNavBar.vue'
import PostPublisher from '@/components/PostPublisher.vue'

// 当前激活的标签
const activeTab = ref('follow'); // 'follow' 或 'recommend'

// 显示发布帖子组件
const showPublisher = ref(false);

// 模拟的帖子数据
const posts = ref([
  {
    id: 1,
    author: 'Sarah',
    avatar: 'https://i.pravatar.cc/40?img=5',
    location: '北京',
    content: '今日穿搭分享 ✨ 简约知性风，适合日常通勤。上衣选择了米色针织开衫，内搭白色丝质衬衫，下装是高腰直筒西装裤，整体搭配既正式又不失温柔感。',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=200&h=200&fit=crop'
    ],
    likes: '1.2k',
    comments: '368',
    views: '5.6k',
    isFollowing: false
  },
  {
    id: 2,
    author: 'Michael',
    avatar: 'https://i.pravatar.cc/40?img=8',
    location: '上海',
    content: '分享一套休闲运动风穿搭 🏃 灰色连帽卫衣搭配黑色运动裤，既舒适又时尚。最近天气转凉，这样搭配运动或者周末出街都很合适。',
    images: [
      'https://images.unsplash.com/photo-1483721310020-03333e577078?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop'
    ],
    likes: '856',
    comments: '234',
    views: '3.2k',
    isFollowing: true
  }
]);

// 切换标签
const switchTab = (tab) => {
  activeTab.value = tab;
};

// 切换关注状态
const toggleFollow = (post) => {
  // 查找当前帖子在数组中的索引
  const index = posts.value.findIndex(p => p.id === post.id);
  if (index !== -1) {
    // 创建一个新的帖子对象并更新isFollowing属性
    const updatedPost = { ...posts.value[index], isFollowing: !posts.value[index].isFollowing };
    // 通过直接替换数组中的对象来确保响应式更新
    posts.value[index] = updatedPost;
  }
};

// 打开发布帖子弹窗
const openPublisher = () => {
  showPublisher.value = true;
};

// 关闭发布帖子弹窗
const closePublisher = () => {
  showPublisher.value = false;
};

// 处理发布帖子
const handlePublish = (postData) => {
  // 生成新帖子ID
  const newPostId = posts.value.length > 0 ? Math.max(...posts.value.map(p => p.id)) + 1 : 1;
  
  // 提取媒体数据
  let postImages = [];
  let videoSource = '';
  
  if (postData.mediaType === 'image' && Array.isArray(postData.media)) {
    // 最多只取9张图片
    postImages = postData.media.slice(0, 9).map(img => img.url);
  } else if (postData.mediaType === 'video' && postData.media) {
    // 处理视频
    videoSource = postData.media;
  }
  
  // 创建新帖子对象
  const newPost = {
    id: newPostId,
    author: '我', // 假设当前用户名
    avatar: 'https://i.pravatar.cc/40?img=1', // 假设当前用户头像
    location: '广州', // 假设当前用户位置
    content: postData.content,
    images: postImages,
    video: videoSource, // 添加视频字段
    mediaType: postData.mediaType, // 保存媒体类型
    likes: '0',
    comments: '0',
    views: '0',
    isFollowing: false,
    // 可以添加标签信息，但不渲染在视图中
    tags: {
      hard: postData.hardTag,
      soft: postData.softTags
    }
  };
  
  // 添加到帖子列表开头
  posts.value.unshift(newPost);
  
  // 关闭发布窗口
  showPublisher.value = false;
  
  // 切换到关注标签页，让用户立即看到自己发布的帖子
  activeTab.value = 'follow';
};
</script>

<template>
  <div class="plaza">
    <TopNavBar title="广场圈子" />
    <div class="plaza-container">
      <!-- 标签页 -->
      <div class="tabs">
        <div class="tabs-container">
          <div class="tab-buttons">
            <button 
              :class="['tab-button', { 'tab-active': activeTab === 'follow' }]" 
              @click="switchTab('follow')"
            >
              关注
            </button>
            <button 
              :class="['tab-button', { 'tab-active': activeTab === 'recommend' }]" 
              @click="switchTab('recommend')"
            >
              推荐
            </button>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-container">
        <div class="posts-list">
          <!-- 帖子卡片 -->
          <div v-for="post in posts" :key="post.id" class="post-card">
            <div class="post-header">
              <div class="user-info">
                <img :src="post.avatar" class="avatar" :alt="post.author">
                <div class="user-details">
                  <div class="username">{{ post.author }}</div>
                  <div class="location">IP属地：{{ post.location }}</div>
                </div>
              </div>
              <button 
                :class="['follow-button', { 'following': post.isFollowing }]"
                @click="toggleFollow(post)"
              >
                {{ post.isFollowing ? '已关注' : '关注' }}
              </button>
            </div>
            <p class="post-content">{{ post.content }}</p>
            
            <!-- 图片显示 -->
            <div 
              v-if="post.images && post.images.length > 0" 
              :class="[
                'post-images', 
                post.images.length === 1 ? 'one-image' : '',
                post.images.length === 2 ? 'two-images' : '',
                post.images.length === 4 ? 'four-images' : ''
              ]"
            >
              <img 
                v-for="(image, index) in post.images" 
                :key="index" 
                :src="image" 
                class="post-image" 
                alt="穿搭图片"
              >
            </div>
            
            <!-- 视频显示 -->
            <div v-if="post.video" class="post-video">
              <video 
                controls 
                :src="post.video" 
                class="video-player"
              ></video>
            </div>
            
            <div class="post-actions">
              <button class="action-button">
                <i class="far fa-heart"></i>
                <span>{{ post.likes }}</span>
              </button>
              <button class="action-button">
                <i class="far fa-comment"></i>
                <span>{{ post.comments }}</span>
              </button>
              <div class="action-button">
                <i class="far fa-eye"></i>
                <span>{{ post.views }}</span>
              </div>
            </div>
          </div>
          
          <!-- 添加底部填充元素，确保最后一项内容完全可见 -->
          <div class="bottom-placeholder"></div>
        </div>
      </div>

      <!-- 发布按钮 -->
      <div class="publish-button" @click="openPublisher">
        <i class="fas fa-pen-to-square"></i>
      </div>
      
      <!-- 发布帖子组件 -->
      <PostPublisher 
        :visible="showPublisher" 
        @close="closePublisher" 
        @publish="handlePublish"
      />
    </div>
  </div>
</template>

<style scoped>
.plaza-container {
  padding-top: 56px; /* 从100px减少到56px，仅为顶部导航栏留出空间 */
  padding-bottom: 60px; /* 为底部导航栏留出空间 */
  background-color: #F5F5F5;
  min-height: 100vh;
  position: relative; /* 确保相对定位 */
}

/* 标签页 */
.tabs {
  position: fixed;
  top: 56px; /* 保持在顶部导航栏下方 */
  left: 0;
  right: 0;
  background-color: white;
  border-bottom: 1px solid #F0F0F0;
  z-index: 20;
}

.tabs-container {
  display: flex;
  max-width: 640px;
  margin: 0 auto;
  padding: 0 16px;
  justify-content: center;
}

.tab-buttons {
  display: flex;
  gap: 32px;
}

.tab-button {
  position: relative;
  padding: 12px 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #666666;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.tab-button:hover {
  color: #3B82F6;
}

.tab-active {
  color: #3B82F6;
}

.tab-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: #3B82F6;
  border-radius: 3px;
}

/* 内容区域 */
.content-container {
  /* 调整高度计算，考虑顶部标题(56px)、标签栏(48px)和底部导航栏(60px)的高度 */
  height: calc(100vh - 164px); 
  margin-top: 48px; /* 添加上边距，为标签栏留出空间 */
  padding-bottom: 20px; /* 增加底部内边距，确保最后一项内容完全可见 */
  overflow-y: auto;
  position: relative; /* 添加相对定位 */
  -webkit-overflow-scrolling: touch; /* 增加iOS滚动性能 */
}

.posts-list {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 80px; /* 为发布按钮留出额外的空间 */
}

/* 帖子卡片 */
.post-card {
  background-color: white;
  padding: 16px;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  margin-left: 12px;
}

.username {
  font-weight: 500;
  color: #111827;
}

.location {
  font-size: 0.75rem;
  color: #6B7280;
}

.follow-button {
  padding: 4px 16px;
  border-radius: 9999px;
  font-size: 0.875rem;
  transition: all 0.2s;
  border: 1px solid #3B82F6;
  color: #3B82F6;
  background-color: transparent;
}

.follow-button.following {
  background-color: #F3F4F6;
  color: #6B7280;
  border-color: transparent;
}

.post-content {
  margin-bottom: 12px;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #111827;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-bottom: 12px;
}

/* 一张图片时的样式 */
.post-images.one-image {
  grid-template-columns: 1fr;
}

.post-images.one-image .post-image {
  height: 240px;
  width: 100%;
  max-width: 100%;
}

/* 两张图片时的样式 */
.post-images.two-images {
  grid-template-columns: repeat(2, 1fr);
}

.post-images.two-images .post-image {
  height: 160px;
}

/* 四张图片时的样式 */
.post-images.four-images {
  grid-template-columns: repeat(2, 1fr);
}

.post-image {
  width: 100%;
  height: 112px;
  object-fit: cover;
  border-radius: 4px;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 24px;
  color: #9CA3AF;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
}

.action-button i {
  font-size: 1rem;
}

/* 发布按钮 */
.publish-button {
  position: fixed;
  bottom: 76px; /* 调整位置，确保在底部导航栏上方且不会被遮挡 */
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #3B82F6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 20;
  cursor: pointer;
}

.publish-button i {
  font-size: 1.25rem;
}

/* 视频样式 */
.post-video {
  margin-bottom: 12px;
  border-radius: 4px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: auto;
  aspect-ratio: 16/9;
  object-fit: contain;
  background-color: #000;
}

/* 添加底部占位符样式 */
.bottom-placeholder {
  height: 80px; /* 为底部留出足够的空间 */
  width: 100%;
}
</style> 