<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TopNavBar from '@/components/TopNavBar.vue';
import { SQUARE_API } from '@/api/config';
import request from '@/utils/request';
import { getPostComments, createComment, likePost, unlikePost } from '@/api/community';
import { useUserStore } from '@/stores/user';
import { usePostsStore } from '@/stores/posts';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const postsStore = usePostsStore();
const postId = ref('');
const comments = ref([]);
const commentText = ref('');
const loading = ref(false);
const loadingComments = ref(false);

// 为评论分页添加变量
const commentPage = ref(0);
const totalComments = ref(0);
const totalCommentPages = ref(0);
// 存储被回复的评论ID
const replyToCommentId = ref(null);

// 从 Pinia store 获取帖子数据
const postData = computed(() => {
  const id = postId.value;
  if (!id) return null;
  return postsStore.getPostById(id);
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

// 获取资源类型 - 重命名以避免混淆
const resourceType = computed(() => {
  if (!postData.value || !postData.value.post) return 'none';
  
  const post = postData.value.post;
  
  if (post.videoUrl) {
    return 'video';
  } else if (post.resourceUrls && post.resourceUrls.length > 0) {
    return 'image';
  } else if (post.images && post.images.length > 0) {
    return 'image';
  }
  
  return 'none';
});

// 处理图片URL，去掉末尾的 ,img 后缀
const processImageUrl = (url) => {
  // 如果 url 不是字符串，尝试转换为字符串
  if (typeof url !== 'string') {
    // 如果是对象，可能需要获取特定属性
    if (url && typeof url === 'object' && 'url' in url) {
      url = url.url;
    } else {
      // 其他情况尝试转换为字符串，如果失败则返回空字符串
      url = String(url || '');
    }
  }
  
  // 确保 url 是非空字符串
  if (!url) return '';
  
  // 移除末尾的 ,img
  return url.replace(/,img$/, '');
};

// 获取资源URL列表 - 重命名以避免混淆
const resourceUrls = computed(() => {
  if (!postData.value || !postData.value.post) return [];
  
  const post = postData.value.post;
  let urls = [];
  
  if (post.resourceUrls && Array.isArray(post.resourceUrls)) {
    urls = post.resourceUrls;
  } else if (post.resourceUrls && Array.isArray(post.resourceUrls[0])) {
    urls = post.resourceUrls[0];
  } else if (post.images && Array.isArray(post.images)) {
    urls = post.images;
  }
  
  // 过滤掉无效的URL，然后处理每个URL
  return urls
    .filter(url => url != null) // 移除 null 和 undefined
    .map(url => processImageUrl(url));
});

// 获取评论列表
const fetchComments = async () => {
  if (!postId.value) return;
  
  // 检查用户是否登录
  if (!checkUserLogin()) return;
  
  loadingComments.value = true;
  
  try {
    const response = await getPostComments(
      postId.value, 
      currentUser.value.userId,
      commentPage.value || 0
    );
    
    if (response && response.comments && Array.isArray(response.comments)) {
      comments.value = response.comments;
      // 保存分页信息
      totalComments.value = response.total || 0;
      totalCommentPages.value = response.totalPages || 0; 
      commentPage.value = response.currentPage || 0;
    } else {
      console.error('评论数据格式不正确');
      comments.value = [];
    }
  } catch (error) {
    console.error('获取评论失败:', error);
  } finally {
    loadingComments.value = false;
  }
};

// 切换关注状态
const toggleFollow = async () => {
  if (!postData.value || !postData.value.author) return;
  
  try {
    // 先更新UI
    postData.value.isFollowed = !postData.value.isFollowed;
    
    // 注意：这里需要根据实际API实现关注功能
    console.log(`${postData.value.isFollowed ? '关注' : '取消关注'}用户:`, postData.value.author.userId);
  } catch (error) {
    // 请求失败，回滚UI状态
    postData.value.isFollowed = !postData.value.isFollowed;
    console.error('关注操作失败:', error);
  }
};

// 点赞/取消点赞
const toggleLike = async () => {
  if (!postData.value || !postData.value.post) return;
  
  try {
    const isLiked = postData.value.isLiked;
    // 立即更新UI
    postData.value.isLiked = !isLiked;
    
    // 发送请求
    const response = await (isLiked ? unlikePost : likePost)({
      userId: currentUser.value.userId,
      postId: postData.value.post.postId
    });
    
    if (response === true) {
      // 更新点赞数
      if (isLiked) {
        postData.value.post.likes = Math.max(0, postData.value.post.likes - 1);
      } else {
        postData.value.post.likes += 1;
      }
    } else {
      // 操作失败，恢复状态
      postData.value.isLiked = isLiked;
    }
  } catch (error) {
    // 请求失败，恢复UI状态
    postData.value.isLiked = !postData.value.isLiked;
    console.error('点赞操作失败:', error);
  }
};

// 回复特定评论
const replyToComment = (comment) => {
  if (comment && comment.user && comment.user.username) {
    commentText.value = `回复@${comment.user.username}: `;
    // 存储被回复的评论ID，发送评论时使用
    replyToCommentId.value = comment.comment.commentId;
  }
};

// 发送评论
const sendComment = async () => {
  if (!commentText.value.trim() || !postData.value || !postData.value.post) return;
  
  // 检查用户是否登录
  if (!checkUserLogin()) return;
  
  try {
    const commentData = {
      userId: currentUser.value.userId,
      postId: postData.value.post.postId,
      content: commentText.value
    };
    
    // 如果是回复其他评论，添加父评论ID
    if (replyToCommentId.value) {
      commentData.parentCommentId = replyToCommentId.value;
    }
    
    const response = await createComment(commentData);
    
    if (response === true || (response && response.success)) {
      // 评论成功，重新获取评论列表
      fetchComments();
      // 更新帖子评论数
      postData.value.post.comments += 1;
      // 清空评论文本和回复ID
      commentText.value = '';
      replyToCommentId.value = null;
    }
  } catch (error) {
    console.error('发送评论失败:', error);
  }
};

// 查看大图
const viewFullImage = (imageUrl) => {
  window.open(imageUrl, '_blank');
};

// 格式化时间
const formatTime = (timeString) => {
  if (!timeString) return '';
  
  const date = new Date(timeString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 60) return `${diffSec}秒前`;
  
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}分钟前`;
  
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}小时前`;
  
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}天前`;
  
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

// 加载更多评论
const loadMoreComments = async () => {
  if (loadingComments.value || commentPage.value >= totalCommentPages.value - 1) return;
  
  commentPage.value++;
  loadingComments.value = true;
  
  try {
    const response = await getPostComments(
      postId.value, 
      currentUser.value.userId,
      commentPage.value
    );
    
    if (response && response.comments && Array.isArray(response.comments)) {
      // 追加评论
      comments.value = [...comments.value, ...response.comments];
      // 更新分页信息
      totalComments.value = response.total || totalComments.value;
      totalCommentPages.value = response.totalPages || totalCommentPages.value;
    }
  } catch (error) {
    console.error('加载更多评论失败:', error);
    // 加载失败时恢复页码
    commentPage.value--;
  } finally {
    loadingComments.value = false;
  }
};

// 格式化数字显示
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

onMounted(() => {
  // 从路由参数中获取帖子ID
  postId.value = route.params.id || '';
  console.log('Post ID:', postId.value);
  
  // 检查用户是否登录
  if (!checkUserLogin()) return;
  
  // 检查是否能找到帖子数据
  if (!postData.value) {
    console.error('未找到帖子数据，返回列表页');
    router.replace('/plaza');
    return;
  }
  
  // 获取评论
  if (postId.value) {
    fetchComments();
  }
});
</script>

<template>
  <div class="post-detail">
    <TopNavBar title="帖子详情" :showBack="true" />
    
    <!-- 调试信息，帮助检查数据 -->
    <div v-if="!postData && !loading" class="debug-info">
      <p>未找到帖子数据，请返回列表重试</p>
      <p>Post ID: {{ postId }}</p>
    </div>
    
    <!-- 显示加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="postData" class="content-container">
      <!-- 帖子内容 -->
      <div class="post-content">
        <div class="user-header">
          <div class="user-info">
            <img :src="postData.author.imagePath" class="avatar" :alt="postData.author.username">
            <div class="user-details">
              <div class="username">{{ postData.author.username }}</div>
              <div class="location">IP属地：{{ postData.post.ipAddress || '未知' }}</div>
            </div>
          </div>
          <button 
            :class="['follow-button', { 'following': postData.isFollowed }]"
            @click="toggleFollow"
          >
            {{ postData.isFollowed ? '已关注' : '关注' }}
          </button>
        </div>
        
        <p class="post-text">{{ postData.post.content }}</p>

        <!-- 视频显示 -->
        <div v-if="resourceType === 'video'" class="post-video">
          <video 
            class="video-player" 
            controls
            autoplay
            muted
            loop
            playsinline
            :src="postData.post.videoUrl"
            preload="metadata"
            controlsList="nodownload"
          >
            您的浏览器不支持视频播放
          </video>
        </div>
        
        <!-- 图片显示 -->
        <div 
          v-else-if="resourceType === 'image'" 
          :class="[
            'post-images', 
            resourceUrls.length === 1 ? 'one-image' : '',
            resourceUrls.length === 2 ? 'two-images' : '',
            resourceUrls.length === 4 ? 'four-images' : ''
          ]"
        >
          <img 
            v-for="(imageUrl, index) in resourceUrls" 
            :key="index" 
            :src="imageUrl" 
            class="post-image" 
            alt="穿搭图片"
            @click="viewFullImage(imageUrl)"
          >
        </div>
        
        <div class="post-time">{{ formatTime(postData.post.createdAt) }}</div>
        
        <div class="post-actions">
          <button 
            :class="['action-button', { liked: postData.isLiked }]"
            @click="toggleLike"
          >
            <i class="fas" :class="postData.isLiked ? 'fa-heart' : 'fa-heart'"></i>
            {{ formatNumber(postData.post.likes || 0) }}
          </button>
          
          <button class="action-button">
            <i class="fas fa-comment"></i>
            {{ formatNumber(postData.post.comments || 0) }}
          </button>
          
          <button class="action-button">
            <i class="fas fa-share"></i>
            分享
          </button>
        </div>
      </div>
      
      <!-- 评论区 -->
      <div class="comments-section">
        <div class="comments-header">
          全部评论 ({{ postData.post.comments || 0 }})
        </div>
        
        <div v-if="loadingComments" class="comments-loading">
          <div class="loading-spinner-small"></div>
          加载评论中...
        </div>
        
        <div v-else-if="comments.length === 0" class="no-comments">
          暂无评论，快来抢沙发吧~
        </div>
        
        <div v-else class="comment-list">
          <div 
            v-for="comment in comments" 
            :key="comment.comment.commentId" 
            class="comment-item"
          >
            <img :src="comment.user.imagePath" class="comment-avatar" :alt="comment.user.username">
            
            <div class="comment-content">
              <div class="comment-user">
                <span class="comment-author">{{ comment.user.username }}</span>
                <span class="comment-location">IP属地：{{ comment.comment.ipAddress || '未知' }}</span>
              </div>
              
              <div v-if="comment.parentUser" class="comment-reply-info">
                回复 <span class="reply-username">@{{ comment.parentUser.username }}</span>
              </div>
              
              <div class="comment-text">{{ comment.comment.content }}</div>
              
              <div class="comment-actions">
                <span class="comment-time">{{ formatTime(comment.comment.createdAt) }}</span>
                <button class="reply-button" @click="replyToComment(comment)">
                  回复
                </button>
              </div>
            </div>
          </div>
          
          <!-- 加载更多评论 -->
          <div v-if="comments.length > 0 && commentPage.value < totalCommentPages.value - 1" 
               class="load-more-comments"
               @click="loadMoreComments">
            加载更多评论
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部评论栏 -->
    <div class="comment-bar">
      <div class="comment-input-container">
        <input 
          type="text" 
          v-model="commentText" 
          class="comment-input" 
          placeholder="说点什么..." 
        />
        <button class="send-button" @click="sendComment">发送</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-detail {
  min-height: 100vh;
  background-color: white;
}

.content-container {
  padding-top: 56px; /* 为顶部导航栏留出空间 */
  padding-bottom: 60px; /* 为底部评论栏留出空间 */
  overflow-y: auto;
  height: calc(100vh - 56px);
  background-color: #F5F5F5;
}

/* 加载和空状态 */
.loading-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 56px);
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

/* 帖子内容区域 */
.post-content {
  background-color: white;
  padding: 16px;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

.post-text {
  margin-bottom: 16px;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #111827;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-bottom: 16px;
}

.post-image {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.post-video {
  margin-bottom: 16px;
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

.post-time {
  font-size: 0.75rem;
  color: #6B7280;
  margin-bottom: 16px;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 8px;
  border-top: 1px solid #F3F4F6;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: #6B7280;
  background: none;
  border: none;
  cursor: pointer;
}

.action-button i {
  font-size: 1.125rem;
}

.action-button.liked {
  color: #EF4444;
}

.action-button.liked i {
  color: #EF4444;
}

/* 评论区样式 */
.comments-section {
  margin-top: 8px;
}

.comments-header {
  padding: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.comments-loading, .no-comments {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: #9CA3AF;
  font-size: 0.875rem;
}

.comment-list {
  background-color: white;
}

.comment-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #F3F4F6;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  margin-left: 12px;
  flex: 1;
}

.comment-user {
  margin-bottom: 4px;
}

.comment-author {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
}

.comment-location {
  font-size: 0.75rem;
  color: #6B7280;
  margin-left: 8px;
}

.comment-reply-info {
  font-size: 0.75rem;
  color: #6B7280;
  margin-bottom: 4px;
}

.reply-username {
  color: #3B82F6;
}

.comment-text {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #111827;
  margin-bottom: 8px;
}

.comment-actions {
  display: flex;
  align-items: center;
}

.comment-time {
  font-size: 0.75rem;
  color: #6B7280;
}

.reply-button {
  margin-left: 16px;
  font-size: 0.75rem;
  color: #6B7280;
  background: none;
  border: none;
  cursor: pointer;
}

/* 底部评论栏 */
.comment-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 16px;
  background-color: white;
  border-top: 1px solid #F3F4F6;
  z-index: 10;
}

.comment-input-container {
  display: flex;
  align-items: center;
}

.comment-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 20px;
  border: none;
  background-color: #F5F5F5;
  outline: none;
  font-size: 0.875rem;
}

.send-button {
  margin-left: 12px;
  color: #3B82F6;
  background: none;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
}

.load-more-comments {
  padding: 16px;
  text-align: center;
  color: #3B82F6;
  font-size: 0.875rem;
  cursor: pointer;
}

.debug-info {
  padding: 16px;
  background-color: #ffeeee;
  color: #ff0000;
  margin: 16px;
  border-radius: 4px;
}
</style> 