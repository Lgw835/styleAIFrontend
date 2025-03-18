<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user'; // 引入用户store
import { useExternalDataStore } from '@/stores/externalData'; // 引入 externalDataStore
import TopNavBar from '@/components/TopNavBar.vue'
import PostPublisher from '@/components/PostPublisher.vue'
import { SQUARE_API, USER_API } from '@/api/config';
import request from '@/utils/request';
import { uploadFile } from '@/api/user';
import { getPosts, likePost, unlikePost, createPost } from '@/api/community';
import { usePostsStore } from '@/stores/posts';

const router = useRouter();
const userStore = useUserStore(); // 初始化用户store
const externalDataStore = useExternalDataStore(); // 初始化 externalDataStore
const postsStore = usePostsStore(); // 使用帖子 store

// 当前激活的标签
const activeTab = ref('recommend'); // 'recommend' 或 'follow'

// 显示发布帖子组件
const showPublisher = ref(false);

// 帖子数据
const posts = computed(() => {
  return postsStore.posts;
});
const loading = ref(false);
const pageInfo = ref({
  currentPage: 0,
  size: 5,
  total: 0,
  totalPages: 0
});

// 获取当前用户信息
const currentUser = computed(() => {
  return userStore.userInfo || {};
});

// 确保用户已登录
const checkUserLogin = () => {
  if (!currentUser.value?.userId) {
    router.push('/login');
    return false;
  }
  return true;
};

// 搜索关键词
const searchKeyword = ref('');
// 标签筛选
const selectedTag = ref('');

// 加载帖子列表
const loadPosts = async (reset = false) => {
  if (loading.value) return;
  
  // 检查用户是否登录
  if (!checkUserLogin()) return;
  
  loading.value = true;
  
  if (reset) {
    postsStore.resetState();
    pageInfo.value = {
      currentPage: 0,
      size: 5,
      total: 0,
      totalPages: 0
    };
  }
  
  try {
    const mode = activeTab.value === 'follow' ? 2 : 1;
    
    const response = await getPosts({
      userId: currentUser.value.userId,
      mode: mode,
      keyword: searchKeyword.value,
      tag: selectedTag.value,
      page: pageInfo.value.currentPage,
      size: pageInfo.value.size
    });
    
    if (response.posts && Array.isArray(response.posts)) {
      if (reset) {
        postsStore.setPosts(response.posts);
      } else {
        postsStore.addPosts(response.posts);
      }
      
      // 从响应更新本地状态
      pageInfo.value.total = response.total || 0;
      pageInfo.value.totalPages = response.totalPages || 0;
      pageInfo.value.currentPage = response.currentPage || 0;
      
      // 更新 store 中的分页信息
      postsStore.setPagination(pageInfo.value);
    }
  } catch (error) {
    console.error('加载帖子失败:', error);
  } finally {
    loading.value = false;
  }
};

// 切换标签
const switchTab = (tab) => {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  loadPosts(true); // 重置并加载新数据
};

// 切换关注状态
const toggleFollow = async (post, event) => {
  // 阻止事件冒泡，防止触发帖子点击
  event.stopPropagation();
  
  try {
    // 发送请求前先更新UI，提供即时反馈
    post.isFollowed = !post.isFollowed;
    
    // TODO: 调用关注/取消关注API
    // 由于API文档中没有明确的关注用户接口，这里需要向后端确认具体接口
    // 临时使用模拟实现
    console.log(`${post.isFollowed ? '关注' : '取消关注'}用户:`, post.author.userId);
    
    // 如果请求失败，恢复状态
    // await someFollowApi();
  } catch (error) {
    // 请求失败，回滚UI状态
    post.isFollowed = !post.isFollowed;
    console.error('关注操作失败:', error);
  }
};

// 点赞/取消点赞
const toggleLike = async (post, event) => {
  // 检查用户是否登录
  if (!checkUserLogin()) return;
  
  event.stopPropagation();
  
  try {
    const isLiked = post.isLiked;
    post.isLiked = !isLiked;
    
    const response = await (isLiked ? unlikePost : likePost)({
      userId: currentUser.value.userId, // 从store中获取userId
      postId: post.post.postId
    });
    
    if (response === true) {
      // 更新点赞数
      if (isLiked) {
        post.post.likes = Math.max(0, post.post.likes - 1);
      } else {
        post.post.likes += 1;
      }
    } else {
      // 操作失败，恢复状态
      post.isLiked = isLiked;
    }
  } catch (error) {
    // 请求失败，恢复UI状态
    post.isLiked = !post.isLiked;
    console.error('点赞操作失败:', error);
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
const handlePublish = async (postData) => {
  // 检查用户是否登录
  if (!checkUserLogin()) return;
  
  try {
    // 1. 处理媒体文件上传
    const mediaUrls = [];
    let videoUrl = '';
    
    if (postData.mediaType === 'image' && Array.isArray(postData.media)) {
      // 上传图片(最多9张)
      const imageFiles = postData.media.slice(0, 9);
      for (const image of imageFiles) {
        try {
          const response = await uploadFile(image.file);
          if (response && response.fileUrl) {
            mediaUrls.push(response.fileUrl);
          }
        } catch (error) {
          console.error('文件上传失败:', error);
        }
      }
    } else if (postData.mediaType === 'video' && postData.media) {
      try {
        const response = await uploadFile(postData.media.file);
        if (response && response.fileUrl) {
          videoUrl = response.fileUrl;
        }
      } catch (error) {
        console.error('视频上传失败:', error);
      }
    }
    
    // 获取位置信息
    const locationData = externalDataStore.locationData;
    const locationString = locationData.city ? `${locationData.province || ''} ${locationData.city}` : '';
    
    // 2. 创建帖子
    const response = await createPost({
      userId: currentUser.value.userId,
      content: postData.content,
      tag: postData.tag,
      softLabel: postData.customTags ? postData.customTags.join('#') : '',
      imageUrls: mediaUrls.length > 0 ? mediaUrls : null,
      videoUrl: videoUrl || null,
      location: locationString // 使用位置信息
    });
    
    if (response === true) {
      loadPosts(true);
      closePublisher();
    }
  } catch (error) {
    console.error('发布帖子失败:', error);
  }
};

// 修改帖子跳转方法
const navigateToPostDetail = (post) => {
  // 增加文章浏览量
  request({
    url: SQUARE_API.POST_VIEW + post.post.postId,
    method: 'post'
  }).catch(error => {
    console.error('增加浏览量失败:', error);
  });
  
  // 直接跳转到详情页，数据已经在 store 中
  router.push(`/post/${post.post.postId}`);
};

// 搜索帖子
const searchPosts = () => {
  loadPosts(true);
};

// 监听滚动加载更多
const onScroll = (e) => {
  const element = e.target;
  // 检查是否滚动到底部
  if (element.scrollHeight - element.scrollTop - element.clientHeight < 50) {
    // 如果还有更多数据且当前没有加载中
    if (!loading.value && pageInfo.value.currentPage < pageInfo.value.totalPages - 1) {
      pageInfo.value.currentPage += 1;
      loadPosts();
    }
  }
};

// 格式化点赞数、评论数和浏览量
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

// 获取资源类型
const getResourceType = (post) => {
  if (!post?.post) return 'none';
  
  // 检查资源 URL 是否是视频
  const isVideoUrl = (url) => {
    return typeof url === 'string' && (
      url.endsWith('.mp4') || 
      url.endsWith('.webm') || 
      url.includes('/videos/')
    );
  };

  // 先检查 videoUrl
  if (post.post.videoUrl && isVideoUrl(post.post.videoUrl)) {
    return 'video';
  }

  // 再检查 resourceUrls
  if (post.post.resourceUrls && Array.isArray(post.post.resourceUrls) && post.post.resourceUrls.length > 0) {
    // 如果第一个资源是视频，则认为是视频帖子
    const firstUrl = Array.isArray(post.post.resourceUrls[0]) 
      ? post.post.resourceUrls[0][0] 
      : post.post.resourceUrls[0];
      
    if (isVideoUrl(firstUrl)) {
      return 'video';
    }
    return 'image';
  }

  return 'none';
};

// 获取资源URL列表
const getResourceUrls = (post) => {
  if (!post?.post) return [];
  
  // 如果是视频类型，返回空数组（视频会单独处理）
  if (getResourceType(post) === 'video') {
    return [];
  }
  
  // 处理图片资源
  if (post.post.resourceUrls) {
    const urls = Array.isArray(post.post.resourceUrls) ? post.post.resourceUrls : [];
    return urls.map(urlArray => {
      return Array.isArray(urlArray) ? urlArray[0] : urlArray;
    }).filter(url => url && !url.endsWith('.mp4') && !url.includes('/videos/'));
  }
  
  return [];
};

// 获取视频 URL
const getVideoUrl = (post) => {
  if (!post?.post) return '';
  
  // 先检查 videoUrl 字段
  if (post.post.videoUrl) {
    return post.post.videoUrl;
  }
  
  // 如果在 resourceUrls 中找到视频
  if (post.post.resourceUrls && Array.isArray(post.post.resourceUrls) && post.post.resourceUrls.length > 0) {
    const firstUrl = Array.isArray(post.post.resourceUrls[0]) 
      ? post.post.resourceUrls[0][0] 
      : post.post.resourceUrls[0];
      
    if (firstUrl && (firstUrl.endsWith('.mp4') || firstUrl.includes('/videos/'))) {
      return firstUrl;
    }
  }
  
  return '';
};

// 组件挂载时加载数据
onMounted(() => {
  loadPosts(true);
  if (!externalDataStore.locationData.city) {
    externalDataStore.getLocationData();
  }
});
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
      <div class="content-container" @scroll="onScroll">
        <div v-if="loading && posts.length === 0" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="posts.length === 0" class="empty-container">
          <p>暂无帖子</p>
        </div>
        
        <div v-else class="posts-list">
          <!-- 帖子卡片 -->
          <div 
            v-for="post in posts" 
            :key="post.post.postId" 
            class="post-card"
            @click="navigateToPostDetail(post)"
          >
            <div class="post-header">
              <div class="user-info">
                <img :src="post.author.imagePath || 'https://i.pravatar.cc/40'" class="avatar" :alt="post.author.username">
                <div class="user-details">
                  <div class="username">{{ post.author.username }}</div>
                  <div class="location">IP属地：{{ post.post.ipAddress || '未知' }}</div>
                </div>
              </div>
              <button 
                :class="['follow-button', { 'following': post.isFollowed }]"
                @click="toggleFollow(post, $event)"
              >
                {{ post.isFollowed ? '已关注' : '关注' }}
              </button>
            </div>
            <p class="post-content">{{ post.post.content }}</p>
            
            <!-- 视频显示 -->
            <div v-if="getResourceType(post) === 'video'" class="post-video">
              <video 
                class="video-player" 
                controls
                autoplay
                muted
                loop
                playsinline
                :src="getVideoUrl(post)"
                preload="metadata"
                controlsList="nodownload"
              >
                您的浏览器不支持视频播放
              </video>
            </div>
            
            <!-- 图片显示 -->
            <div 
              v-else-if="getResourceType(post) === 'image'" 
              :class="[
                'post-images', 
                getResourceUrls(post).length === 1 ? 'one-image' : '',
                getResourceUrls(post).length === 2 ? 'two-images' : '',
                getResourceUrls(post).length === 4 ? 'four-images' : ''
              ]"
            >
              <img 
                v-for="(image, index) in getResourceUrls(post)" 
                :key="index" 
                :src="image" 
                class="post-image" 
                alt="穿搭图片"
              >
            </div>
            
            <div class="post-actions">
              <button class="action-button" @click="toggleLike(post, $event)">
                <i :class="[post.isLiked ? 'fas fa-heart text-red-500' : 'far fa-heart']"></i>
                <span>{{ formatNumber(post.post.likes) }}</span>
              </button>
              <button class="action-button">
                <i class="far fa-comment"></i>
                <span>{{ formatNumber(post.post.comments) }}</span>
              </button>
              <div class="action-button">
                <i class="far fa-eye"></i>
                <span>{{ formatNumber(post.post.views) }}</span>
              </div>
            </div>
          </div>
          
          <!-- 加载更多提示 -->
          <div v-if="loading" class="loading-more">
            <div class="loading-spinner-small"></div>
            <span>加载中...</span>
          </div>
          
          <!-- 没有更多数据提示 -->
          <div v-if="!loading && pageInfo.currentPage >= pageInfo.totalPages - 1 && posts.length > 0" class="no-more">
            --- 已经到底了 ---
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

/* 加载中和空状态 */
.loading-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 200px);
  color: #9CA3AF;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  border-top-color: #3B82F6;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  border-top-color: #3B82F6;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-more, .no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  color: #9CA3AF;
  font-size: 0.875rem;
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
  background-color: #000;
}

.video-player {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  background-color: #000;
}

/* 添加底部占位符样式 */
.bottom-placeholder {
  height: 80px; /* 为底部留出足够的空间 */
  width: 100%;
}
</style> 