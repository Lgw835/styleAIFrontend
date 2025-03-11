<script setup>
import { ref } from 'vue';

// 当前激活的标签
const activeTab = ref('follow'); // 'follow' 或 'recommend'

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
  post.isFollowing = !post.isFollowing;
};
</script>

<template>
  <div class="plaza-container">
    <!-- 顶部导航栏 -->
    <nav class="top-nav">
      <div class="nav-container">
        <h1 class="nav-title">广场圈子</h1>
      </div>
    </nav>

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
          <div :class="['post-images', post.images.length === 2 ? 'two-images' : '']">
            <img 
              v-for="(image, index) in post.images" 
              :key="index" 
              :src="image" 
              class="post-image" 
              alt="穿搭图片"
            >
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
      </div>
    </div>

    <!-- 发布按钮 -->
    <div class="publish-button">
      <i class="fas fa-pen-to-square"></i>
    </div>
  </div>
</template>

<style scoped>
.plaza-container {
  padding-top: 100px; /* 为顶部标题和标签页留出空间 */
  padding-bottom: 60px; /* 为底部导航栏留出空间 */
  background-color: #F5F5F5;
  min-height: 100vh;
}

/* 顶部导航栏 */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 20;
}

.nav-container {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  max-width: 640px;
  margin: 0 auto;
}

.nav-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  text-align: left;
}

/* 标签页 */
.tabs {
  position: fixed;
  top: 56px;
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
  height: calc(100vh - 104px);
  overflow-y: auto;
}

.posts-list {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.post-images.two-images {
  grid-template-columns: repeat(2, 1fr);
}

.post-image {
  width: 100%;
  height: 112px;
  object-fit: cover;
  border-radius: 4px;
}

.two-images .post-image {
  height: 160px;
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
  bottom: 96px;
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
</style> 