<template>
  <div class="outfit-record-page">
    <!-- 顶部导航栏 -->
    <div class="fixed top-0 left-0 right-0 bg-white shadow-sm z-30">
      <div class="flex items-center justify-between h-14 px-4">
        <div class="flex items-center">
          <router-link to="/" class="text-gray-500 mr-2">
            <i class="fas fa-chevron-left"></i>
          </router-link>
          <h1 class="text-lg font-medium">我的穿搭</h1>
        </div>
        <button @click="refreshRecords" class="text-blue-500">
          <i class="fas fa-sync-alt" :class="{'animate-spin': loading}"></i>
        </button>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="pt-14 pb-safe" ref="scrollContainer" @scroll="handleScroll">
      <div v-if="loading && !outfits.length" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
      
      <!-- 穿搭记录瀑布流 -->
      <div v-else class="px-4 outfit-grid">
        <template v-if="visibleOutfits.length > 0">
          <div 
            v-for="(outfit, index) in visibleOutfits" 
            :key="outfit.id" 
            class="outfit-card"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <!-- 卡片内容 -->
            <div class="relative" @click="openDetail(outfit)">
              <!-- 图片容器 -->
              <div class="outfit-image-container">
                <img 
                  :src="getImageUrl(outfit)" 
                  class="outfit-image" 
                  :alt="outfit.aiPromptDescription || '穿搭图片'"
                  @error="handleImageError($event)"
                >
                
                <!-- 评分徽章 -->
                <div v-if="isOutfitRated(outfit)" class="rating-badge">
                  <i class="fas fa-star text-yellow-400 mr-1"></i>
                  <span>{{outfit.rating}}</span>
                </div>
              </div>
              
              <!-- 描述信息 -->
              <div class="p-3">
                <div class="text-xs text-gray-500 mb-1">
                  {{ formatDate(outfit.date) }}
                </div>
                <div class="text-sm line-clamp-2 text-gray-700">
                  {{ getShortDescription(outfit) }}
                </div>
              </div>
            </div>
            
            <!-- 操作按钮 - 点击显示菜单 -->
            <div class="absolute top-2 right-2 z-10">
              <button 
                class="action-button"
                @click="(e) => toggleMenu(outfit.outfitId, e)"
              >
                <i class="fas fa-ellipsis-h"></i>
              </button>
            </div>
            
            <!-- 操作菜单悬浮层 -->
            <div 
              v-if="activeMenu === outfit.outfitId"
              class="action-menu"
              v-click-outside="closeAllMenus"
              @click.stop
            >
              <div class="action-menu-item" @click.stop="openDetail(outfit)">
                <i class="fas fa-eye"></i>
                <span>查看详情</span>
              </div>
              <div 
                v-if="!isOutfitRated(outfit)"
                class="action-menu-item" 
                @click.stop="openRatingModal(outfit)"
              >
                <i class="fas fa-star"></i>
                <span>评价</span>
              </div>
              <div class="action-menu-item delete" @click.stop="showDeleteConfirm(outfit)">
                <i class="fas fa-trash"></i>
                <span>删除</span>
              </div>
            </div>
          </div>
        </template>
        
        <!-- 加载更多指示器 -->
        <div v-if="hasMoreToLoad && visibleOutfits.length > 0" class="loading-more">
          <div class="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mr-2"></div>
          <span>加载更多...</span>
        </div>
        
        <!-- 空状态 -->
        <div v-if="!loading && outfits.length === 0" class="empty-state">
          <div class="flex flex-col items-center justify-center py-20">
            <i class="fas fa-tshirt text-5xl text-gray-300 mb-4"></i>
            <p class="text-gray-500 mb-6">暂无穿搭记录</p>
            <button 
              @click="$router.push('/')" 
              class="px-6 py-2 bg-blue-500 text-white rounded-full"
            >
              去获取推荐
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 穿搭详情弹窗 -->
    <transition name="slide-up">
      <div v-if="showDetailModal" class="outfit-detail-modal">
        <div class="modal-overlay" @click="closeModal"></div>
        <div class="modal-container">
          <!-- 头部 -->
          <div class="modal-header">
            <h3 class="text-lg font-semibold">穿搭详情</h3>
            <button @click="closeModal" class="text-gray-500">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- 内容区 -->
          <div class="modal-body" v-if="currentOutfit">
            <!-- 图片 -->
            <div class="outfit-detail-image">
              <img 
                :src="getImageUrl(currentOutfit)" 
                class="w-full h-auto" 
                :alt="currentOutfit.aiPromptDescription || '穿搭图片'"
              >
            </div>
            
            <!-- 基本信息 -->
            <div class="outfit-info">
              <div class="flex justify-between mb-2">
                <div class="text-sm text-gray-500">
                  {{ formatDate(currentOutfit.date) }}
                </div>
                <div v-if="isOutfitRated(currentOutfit)" class="detail-rating-badge">
                  <i class="fas fa-star mr-1"></i>
                  {{ currentOutfit.rating }} 分
                </div>
              </div>
              
              <!-- 标签 -->
              <div class="tags-container">
                <span v-if="currentOutfit.sceneId || currentOutfit.occasion" class="info-tag">
                  <i class="fas fa-map-marker-alt mr-1"></i>
                  {{ currentOutfit.sceneId || currentOutfit.occasion }}
                </span>
                <span v-if="currentOutfit.styleType || currentOutfit.highlightImageUrl" class="info-tag">
                  <i class="fas fa-tshirt mr-1"></i>
                  {{ currentOutfit.styleType || currentOutfit.highlightImageUrl }}
                </span>
              </div>
              
              <!-- AI提示词 -->
              <div class="info-section">
                <h4 class="info-title">AI提示词</h4>
                <div class="info-content">
                  {{ currentOutfit.aiPromptDescription || '无提示词信息' }}
                </div>
              </div>
              
              <!-- 穿搭描述 -->
              <div class="info-section">
                <h4 class="info-title">穿搭描述</h4>
                <div class="info-content prose prose-sm">
                  <MarkdownRenderer :markdown="currentOutfit.outfitDescription || '无穿搭描述'" />
                </div>
              </div>
              
              <!-- 评价区域 -->
              <div class="info-section" v-if="isOutfitRated(currentOutfit)">
                <h4 class="info-title">我的评价</h4>
                <div class="user-comment">
                  <div class="stars-display">
                    <i v-for="i in 5" :key="i" 
                       :class="['fas', 'fa-star', i <= currentOutfit.rating ? 'text-yellow-400' : 'text-gray-300']"></i>
                  </div>
                  <p class="mt-2">{{ currentOutfit.evaluationText || '无评论内容' }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 底部操作栏 -->
          <div class="modal-footer">
            <button 
              v-if="!isOutfitRated(currentOutfit)"
              class="action-button primary" 
              @click="openRatingModal(currentOutfit)"
            >
              <i class="fas fa-star mr-1"></i>
              评价
            </button>
            <button 
              class="action-button delete" 
              @click="showDeleteConfirm(currentOutfit)"
            >
              <i class="fas fa-trash mr-1"></i>
              删除
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 评分弹窗 -->
    <transition name="slide-up">
      <div v-if="showRatingModal" class="outfit-detail-modal">
        <div class="modal-overlay" @click="closeModal"></div>
        <div class="rating-container">
          <!-- 头部 -->
          <div class="rating-header">
            <h3 class="text-lg font-semibold">评价穿搭</h3>
            <button @click="closeModal" class="text-gray-500">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- 评分内容 -->
          <div class="rating-body">
            <!-- 星星评分 -->
            <div class="rating-stars">
              <div 
                v-for="i in 5" 
                :key="i" 
                class="star-item"
                @click="setRating(i)"
              >
                <i :class="['fas', 'fa-star', i <= ratingScore ? 'text-yellow-400' : 'text-gray-300']"></i>
              </div>
            </div>
            
            <!-- 文字评价 -->
            <textarea 
              v-model="ratingComment" 
              class="rating-textarea" 
              placeholder="分享您对这套穿搭的想法..."
            ></textarea>
            <p class="text-right text-xs text-gray-500">{{ ratingComment.length }}/200</p>
          </div>
          
          <!-- 底部按钮 -->
          <div class="rating-footer">
            <button class="cancel-button" @click="closeModal">取消</button>
            <button 
              class="submit-button" 
              :disabled="ratingScore === 0 && !ratingComment.trim()" 
              @click="submitRating"
            >
              <div v-if="submittingRating" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              提交评价
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 删除确认弹窗 -->
    <transition name="fade">
      <div v-if="showDeleteModal" class="outfit-detail-modal">
        <div class="modal-overlay" @click="closeModal"></div>
        <div class="confirm-container p-4 text-center">
          <h3 class="text-lg font-semibold mb-2">确认删除</h3>
          <p class="text-gray-500 mb-4">删除后无法恢复，确定要删除这条穿搭记录吗？</p>
          <div class="flex justify-center gap-4">
            <button 
              class="px-6 py-2 border border-gray-300 rounded-lg" 
              @click="closeModal"
            >
              取消
            </button>
            <button 
              class="px-6 py-2 bg-red-500 text-white rounded-lg"
              @click="confirmDelete"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOutfitRecordStore } from '@/stores/outfitRecord'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'
import { saveOutfitComment } from '@/api/outfit'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

// 修改 v-click-outside 指令的实现
const clickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      // 检查点击事件是否来自菜单按钮
      const isFromMenuButton = event.target.closest('.action-button')
      if (!isFromMenuButton && !(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    // 使用捕获阶段来确保事件处理的优先级
    document.addEventListener('click', el._clickOutside, true)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside, true)
  }
}

export default {
  directives: {
    'click-outside': clickOutside
  },
  components: {
    MarkdownRenderer
  },
  
  setup() {
    const router = useRouter()
    const outfitRecordStore = useOutfitRecordStore()
    const userStore = useUserStore()
    
    // 数据状态
    const loading = ref(false)
    const outfits = ref([])
    const currentOutfit = ref(null)
    const activeMenu = ref(null)
    const showDetailModal = ref(false)
    const showRatingModal = ref(false)
    const showDeleteModal = ref(false)
    const scrollContainer = ref(null)
    const currentOutfitForRating = ref(null)
    const deleteTarget = ref(null)
    
    // 分页相关
    const pageSize = 6 // 每页显示6条
    const currentPage = ref(1)
    const hasMore = ref(true) // 添加是否有更多数据的标志
    
    // 修改 visibleOutfits 的计算方式
    const visibleOutfits = computed(() => outfits.value)
    
    // 修改 hasMoreToLoad 的计算方式
    const hasMoreToLoad = computed(() => hasMore.value)
    
    // 评分相关
    const ratingScore = ref(0)
    const ratingComment = ref('')
    const submittingRating = ref(false)
    
    // 初始化
    onMounted(async () => {
      await fetchRecords()
    })
    
    onUnmounted(() => {
    })
    
    // 获取记录
    const fetchRecords = async (isRefresh = false) => {
      try {
        if (isRefresh) {
          currentPage.value = 1
          outfits.value = []
          hasMore.value = true
        }
        
        loading.value = true
        const userId = userStore.userInfo?.userId
        
        if (!userId) {
          showToast('请先登录')
          router.push('/login')
          return
        }
        
        // 添加分页参数
        const records = await outfitRecordStore.fetchOutfitRecords(userId, {
          page: currentPage.value,
          pageSize: pageSize
        })
        
        if (Array.isArray(records)) {
          if (isRefresh) {
            outfits.value = records
          } else {
            outfits.value = [...outfits.value, ...records]
          }
          
          // 如果返回的数据少于 pageSize，说明没有更多数据了
          hasMore.value = records.length === pageSize
        }
        
        console.log('获取记录数量:', records?.length)
      } catch (error) {
        console.error('获取记录失败:', error)
        showToast('获取记录失败')
      } finally {
        loading.value = false
      }
    }
    
    // 刷新记录
    const refreshRecords = async () => {
      await fetchRecords(true)
    }
    
    // 修改滚动加载更多的方法
    const handleScroll = async (e) => {
      const el = e.target
      const threshold = 100 // 距离底部多少像素时触发加载
      const bottomDistance = el.scrollHeight - el.scrollTop - el.clientHeight
      
      if (bottomDistance < threshold && !loading.value && hasMore.value) {
        console.log('触发加载更多')
        currentPage.value++
        await fetchRecords()
      }
    }
    
    // 修改 toggleMenu 方法
    const toggleMenu = (outfitId, event) => {
      // 阻止事件冒泡
      event.stopPropagation()
      
      // 如果点击的是当前打开的菜单，则关闭
      if (activeMenu.value === outfitId) {
        activeMenu.value = null
      } else {
        // 关闭其他菜单，打开当前菜单
        activeMenu.value = outfitId
      }
    }
    
    const closeAllMenus = () => {
      activeMenu.value = null
    }
    
    // 打开详情
    const openDetail = (outfit) => {
      currentOutfit.value = outfit
      showDetailModal.value = true
    }
    
    // 关闭模态框
    const closeModal = () => {
      showDetailModal.value = false
      showRatingModal.value = false
      showDeleteModal.value = false
      ratingScore.value = 0
      ratingComment.value = ''
      currentOutfitForRating.value = null
    }
    
    // 评分相关
    const openRatingModal = (outfit) => {
      currentOutfitForRating.value = outfit
      ratingScore.value = outfit.rating || 0
      ratingComment.value = outfit.evaluationText || ''
      showDetailModal.value = false
      showRatingModal.value = true
    }
    
    const setRating = (score) => {
      ratingScore.value = score
    }
    
    const submitRating = async () => {
      if (submittingRating.value) return
      if (!currentOutfitForRating.value) return
      
      if (ratingScore.value === 0 && !ratingComment.value.trim()) {
        showToast('请至少评分或填写评价内容')
        return
      }
      
      try {
        submittingRating.value = true
        
        const ratingData = {
          userId: userStore.userInfo?.userId,
          outfitId: currentOutfitForRating.value.outfitId, // 修改为 outfitId
          rating: ratingScore.value,
          evaluationText: ratingComment.value.trim(),
          ipAddress: "上海市"
        }
        
        console.log('提交评分:', ratingData)
        
        const result = await saveOutfitComment(ratingData)
        
        if (result) {
          showToast('评价成功')
          
          // 更新本地数据
          const index = outfits.value.findIndex(o => o.outfitId === currentOutfitForRating.value.outfitId)
          if (index !== -1) {
            outfits.value[index] = {
              ...outfits.value[index],
              rating: ratingScore.value,
              evaluationText: ratingComment.value,
              ifEvaluate: 1,
              createdAt: new Date().toISOString()
            }
          }
          
          // 如果当前显示的是这条记录，也要更新
          if (currentOutfit.value && currentOutfit.value.outfitId === currentOutfitForRating.value.outfitId) {
            currentOutfit.value = {
              ...currentOutfit.value,
              rating: ratingScore.value,
              evaluationText: ratingComment.value,
              ifEvaluate: 1,
              createdAt: new Date().toISOString()
            }
          }
          
          closeModal()
        } else {
          throw new Error('评价失败')
        }
      } catch (error) {
        console.error('提交评价失败:', error)
        showToast('评价失败，请重试')
      } finally {
        submittingRating.value = false
      }
    }
    
    // 删除相关
    const showDeleteConfirm = (outfit) => {
      deleteTarget.value = outfit
      showDeleteModal.value = true
      activeMenu.value = null
    }
    
    const confirmDelete = async () => {
      if (!deleteTarget.value) return
      
      try {
        loading.value = true
        
        const success = await outfitRecordStore.deleteOutfit(deleteTarget.value.id)
        
        if (success) {
          outfits.value = outfits.value.filter(o => o.id !== deleteTarget.value.id)
          showToast('删除成功')
          
          closeModal()
        } else {
          throw new Error('删除失败')
        }
      } catch (error) {
        console.error('删除失败:', error)
        showToast('删除失败，请重试')
      } finally {
        loading.value = false
        deleteTarget.value = null
      }
    }
    
    // 工具方法
    const getImageUrl = (outfit) => {
      return outfit.outfitImageUrl || '/placeholders/outfit-placeholder.png'
    }
    
    const getShortDescription = (outfit) => {
      const text = outfit.outfitDescription || outfit.aiPromptDescription || ''
      // 移除 markdown 标记
      const plainText = text.replace(/[#\-*]/g, '').replace(/\n/g, ' ').trim()
      return plainText.length > 30 ? plainText.substring(0, 30) + '...' : plainText
    }
    
    const isOutfitRated = (outfit) => {
      return outfit && outfit.ifEvaluate === 1
    }
    
    const handleImageError = (e) => {
      e.target.src = '/placeholders/outfit-placeholder.png'
    }
    
    // 修改时间格式化方法
    const formatDate = (dateString) => {
      if (!dateString) return '未知时间'
      
      const date = new Date(dateString)
      const now = new Date()
      
      if (isNaN(date.getTime())) return '未知时间'
      
      const seconds = Math.floor((now - date) / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      
      if (seconds < 60) {
        return '刚刚'
      } else if (minutes < 60) {
        return `${minutes}分钟前`
      } else if (hours < 24) {
        return `${hours}小时前`
      } else if (days < 30) {
        return `${days}天前`
      } else {
        // 直接格式化为年月日
        return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`
      }
    }
    
    return {
      outfits,
      loading,
      currentOutfit,
      visibleOutfits,
      hasMoreToLoad,
      activeMenu,
      showDetailModal,
      showRatingModal,
      showDeleteModal,
      ratingScore,
      ratingComment,
      submittingRating,
      scrollContainer,
      
      fetchRecords,
      refreshRecords,
      handleScroll,
      toggleMenu,
      openDetail,
      closeModal,
      openRatingModal,
      setRating,
      submitRating,
      showDeleteConfirm,
      confirmDelete,
      getImageUrl,
      getShortDescription,
      isOutfitRated,
      handleImageError,
      formatDate,
      closeAllMenus
    }
  }
}
</script>

<style scoped>
.outfit-record-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

/* 瀑布流布局 */
.outfit-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding-bottom: 16px;
}

.outfit-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.outfit-image-container {
  width: 100%;
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
}

.outfit-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rating-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.action-button {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-menu {
  position: absolute;
  top: 40px;
  right: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 20;
  overflow: hidden;
  width: 120px;
  animation: fadeIn 0.2s ease;
}

.action-menu-item {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-size: 14px;
  transition: background-color 0.2s;
}

.action-menu-item:active {
  background-color: #f5f5f5;
}

.action-menu-item.delete {
  color: #ff4d4f;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 加载更多提示 */
.loading-more {
  grid-column: span 2;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  color: #666;
  font-size: 14px;
}

/* 空状态提示 */
.empty-state {
  grid-column: span 2;
}

/* 下拉刷新 */
.pull-indicator {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  width: 120px;
  margin: 0 auto;
  font-size: 14px;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rotate-180 {
  transform: rotate(180deg);
}

/* 模态框样式 */
.outfit-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
}

.modal-container {
  position: relative;
  width: 100%;
  height: 90%;
  background: white;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin-top: auto;
  z-index: 51;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.modal-footer {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  border-top: 1px solid #eee;
}

.modal-footer .action-button {
  width: auto;
  height: auto;
  padding: 8px 16px;
  border-radius: 8px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
}

.modal-footer .action-button.primary {
  background: #3b82f6;
  color: white;
}

.modal-footer .action-button.delete {
  background: #fee2e2;
  color: #ef4444;
}

/* 详情页样式 */
.outfit-detail-image {
  width: 100%;
  max-height: 50vh;
  overflow: hidden;
}

.outfit-info {
  padding: 16px;
}

.detail-rating-badge {
  background: #fef3c7;
  color: #f59e0b;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.info-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.info-section {
  margin-bottom: 16px;
}

.info-title {
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 15px;
  color: #374151;
}

.info-content {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
}

.user-comment {
  background: #fef3c7;
  padding: 12px;
  border-radius: 8px;
}

.stars-display {
  display: flex;
  gap: 4px;
}

/* 评分弹窗样式 */
.rating-container {
  position: relative;
  width: 100%;
  background: white;
  border-radius: 16px 16px 0 0;
  z-index: 51;
}

.rating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.rating-body {
  padding: 16px;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.star-item {
  font-size: 24px;
  cursor: pointer;
}

.rating-textarea {
  width: 100%;
  height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
  margin-bottom: 4px;
}

.rating-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #eee;
}

.cancel-button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
}

.submit-button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.submit-button:disabled {
  background: #93c5fd;
}

/* 删除确认弹窗 */
.confirm-container {
  position: relative;
  width: 85%;
  background: white;
  border-radius: 12px;
  z-index: 51;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* 适配小屏幕 */
@media (max-width: 340px) {
  .outfit-grid {
    gap: 8px;
  }
}

/* 添加 Markdown 样式 */
.prose {
  max-width: none;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}

.prose h1 { font-size: 1.8em; }
.prose h2 { font-size: 1.5em; }
.prose h3 { font-size: 1.25em; }
.prose h4 { font-size: 1em; }

.prose p {
  margin-top: 0;
  margin-bottom: 1em;
}

.prose ul,
.prose ol {
  margin-top: 0;
  margin-bottom: 1em;
  padding-left: 2em;
}

.prose li {
  margin-bottom: 0.25em;
}

.prose blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 1em 0;
}

.prose hr {
  height: 1px;
  background-color: #e5e7eb;
  border: none;
  margin: 2em 0;
}
</style> 