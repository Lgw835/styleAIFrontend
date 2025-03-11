<template>
  <div class="outfit-record">
    <!-- 使用SubPageNavBar组件作为顶部导航 -->
    <SubPageNavBar 
      title="推荐记录" 
      :back-link="'/'"
    />
    
    <!-- 内容区域 -->
    <div class="content-container">
      <div class="px-4">
        <!-- 推荐记录卡片列表 -->
        <template v-if="outfits.length > 0">
          <div 
            v-for="outfit in outfits" 
            :key="outfit.outfit_id" 
            class="record-card"
            :data-outfit-id="outfit.outfit_id"
          >
            <!-- 更多选项按钮 -->
            <button 
              class="more-options-btn"
              @click.stop="toggleMenu(outfit.outfit_id)"
            >
              <i class="fas fa-ellipsis-v"></i>
            </button>
            
            <!-- 操作菜单 -->
            <div 
              class="action-menu" 
              :class="{ active: activeMenu === outfit.outfit_id }"
            >
              <div 
                class="action-menu-item delete"
                @click.stop="deleteOutfit(outfit.outfit_id)"
              >
                <i class="fas fa-trash"></i> 删除记录
              </div>
            </div>

            <!-- 卡片主体内容，点击打开详情 -->
            <div class="p-4" @click="openDetail(outfit)">
              <div class="mb-3">
                <div class="text-base font-medium text-gray-900">{{ outfit.title }}</div>
                <div class="flex justify-between items-center mt-1">
                  <div class="text-xs text-gray-500">{{ outfit.date }}</div>
                  <div class="score-badge">评分 {{ outfit.score }}</div>
                </div>
              </div>

              <div class="flex gap-2 mb-3">
                <span 
                  v-for="(tag, index) in outfit.tags" 
                  :key="index" 
                  class="tag"
                >{{ tag }}</span>
              </div>

              <div class="text-sm text-gray-600 mb-3 line-clamp-2">
                {{ outfit.description }}
              </div>

              <div class="grid grid-cols-3 gap-2">
                <img 
                  :src="outfit.image_url" 
                  class="w-full h-24 object-cover rounded-lg" 
                  :alt="outfit.title"
                >
                <div class="col-span-2 bg-[#F8F9FA] rounded-lg p-3">
                  <div class="text-xs text-gray-500 mb-1">AI 生成描述</div>
                  <div class="text-sm text-gray-700 line-clamp-3">
                    {{ outfit.ai_description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 空状态展示 -->
        <template v-else>
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-inbox text-4xl mb-3"></i>
            <p>暂无穿搭推荐记录</p>
          </div>
        </template>
      </div>
    </div>

    <!-- 穿搭详情模态框 -->
    <div class="modal" :class="{ active: showDetailModal }">
      <div class="modal-content">
        <!-- 模态框头部 -->
        <div class="p-4 border-b sticky top-0 bg-white z-10">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">穿搭详情</h2>
            <button @click="closeDetail" class="text-gray-500">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- 穿搭详情内容 -->
        <div class="p-4" v-if="currentOutfit">
          <div class="mb-6">
            <div class="mb-4">
              <h3 class="text-xl font-semibold">{{ currentOutfit.title }}</h3>
              <div class="flex justify-between items-center mt-1">
                <p class="text-sm text-gray-500">{{ currentOutfit.date }}</p>
                <div class="score-badge">评分 {{ currentOutfit.score }}</div>
              </div>
            </div>

            <div class="flex gap-2 mb-4">
              <span 
                v-for="(tag, index) in currentOutfit.tags" 
                :key="index" 
                class="tag"
              >{{ tag }}</span>
            </div>

            <div class="w-full mb-4">
              <img 
                :src="currentOutfit.image_url" 
                class="w-full h-auto rounded-lg" 
                :alt="currentOutfit.title"
              >
            </div>

            <div class="bg-[#F8F9FA] rounded-lg p-4 mb-4">
              <div class="text-sm text-gray-500 mb-2">AI 生成描述</div>
              <div class="text-gray-700">{{ currentOutfit.ai_description }}</div>
            </div>

            <div class="text-gray-700 mb-4">
              <div class="font-medium mb-2">穿搭描述</div>
              <p>{{ currentOutfit.description }}</p>
            </div>
          </div>
        </div>

        <!-- 评论区域 -->
        <div class="border-t p-4">
          <h3 class="text-base font-medium mb-3">我的评价</h3>

          <!-- 评价显示区域 -->
          <div class="mb-4">
            <template v-if="currentEvaluation">
              <div>
                <!-- 评分星星 -->
                <div class="flex mb-4 justify-center">
                  <i 
                    v-for="n in 5" 
                    :key="n"
                    class="fas fa-star text-2xl mx-1"
                    :class="n <= currentEvaluation.rating ? 'text-yellow-400' : 'text-gray-300'"
                  ></i>
                </div>

                <!-- 评价内容 -->
                <div class="bg-gray-50 rounded-lg p-4 mb-3">
                  <p class="text-gray-700">{{ currentEvaluation.evaluation_text }}</p>
                </div>

                <!-- 删除按钮 -->
                <div class="text-right">
                  <button 
                    @click="deleteEvaluation"
                    class="text-red-500 text-sm flex items-center ml-auto"
                  >
                    <i class="fas fa-trash mr-1"></i> 删除评价
                  </button>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="text-center text-gray-500 my-4">
                <p>您还没有评价过这套穿搭</p>
              </div>
            </template>
          </div>

          <!-- 评分与评论表单 -->
          <div v-if="!currentEvaluation" class="pt-3 border-t">
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">评分</label>
              <div class="rating">
                <input 
                  v-for="n in 5"
                  :key="n"
                  type="radio"
                  :id="'star' + n"
                  name="rating"
                  :value="n"
                  v-model="newRating"
                >
                <label 
                  v-for="n in 5"
                  :key="'label' + n"
                  :for="'star' + n" 
                  class="fas fa-star"
                ></label>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">评论</label>
              <textarea 
                v-model="newComment"
                rows="3" 
                class="w-full border border-gray-300 rounded-lg p-2 text-sm" 
                placeholder="分享您对这套穿搭的看法..."
              ></textarea>
            </div>

            <button 
              @click="submitEvaluation"
              class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              提交评价
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SubPageNavBar from '@/components/SubPageNavBar.vue'

export default {
  name: 'OutfitRecordView',
  
  components: {
    SubPageNavBar
  },

  data() {
    return {
      // 当前用户信息
      currentUser: {
        user_id: "user123",
        username: "当前用户"
      },

      // 模态框显示状态
      showDetailModal: false,

      // 当前选中的穿搭
      currentOutfit: null,

      // 当前激活的菜单ID
      activeMenu: null,

      // 新评价表单数据
      newRating: null,
      newComment: '',

      // 模拟的穿搭数据
      outfits: [
        {
          outfit_id: "1001",
          title: "春季通勤穿搭",
          date: "2024-03-15 10:30",
          score: "暂无",
          tags: ["商务场景", "知性优雅", "春季"],
          description: "简约知性风格，米色风衣搭配白色丝质衬衫，下装选择高腰直筒西装裤，整体搭配既正式又不失温柔感。",
          image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop",
          ai_description: "一位年轻女性穿着米色风衣，内搭白色丝质衬衫，下身是高腰直筒西装裤，整体造型简约大方，突出职业女性的知性美。"
        },
        {
          outfit_id: "1002",
          title: "约会穿搭推荐",
          date: "2024-03-13 18:45",
          score: "暂无",
          tags: ["约会场景", "甜美", "春季"],
          description: "甜美淑女风格，粉色针织开衫搭配白色蕾丝连衣裙，搭配精致配饰，打造浪漫约会造型。",
          image_url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=200&h=200&fit=crop",
          ai_description: "温柔甜美的约会装扮，粉色针织开衫搭配白色蕾丝连衣裙，突出女性柔美气质，适合浪漫的约会场合。"
        },
        {
          outfit_id: "1003",
          title: "周末休闲穿搭",
          date: "2024-03-10 09:15",
          score: 4,
          tags: ["休闲场景", "舒适", "春季"],
          description: "舒适休闲风格，宽松牛仔裤搭配基础款T恤，外搭轻薄夹克，适合周末逛街、看电影等轻松场合。",
          image_url: "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=200&h=200&fit=crop",
          ai_description: "随性舒适的休闲搭配，主打轻松自在的生活态度，适合各种非正式场合，展现休闲中的时尚感。"
        }
      ],

      // 用户评价数据
      userEvaluations: {
        "1003": {
          evaluation_id: "eval001",
          user_id: "user123",
          outfit_id: "1003",
          evaluation_text: "这套搭配非常适合周末，舒适又时尚，我很喜欢！",
          rating: 4,
          created_at: "2024-03-11 14:25"
        }
      }
    }
  },

  computed: {
    // 当前选中穿搭的评价
    currentEvaluation() {
      if (!this.currentOutfit) return null
      return this.userEvaluations[this.currentOutfit.outfit_id]
    }
  },

  methods: {
    // 切换操作菜单显示状态
    toggleMenu(outfitId) {
      this.activeMenu = this.activeMenu === outfitId ? null : outfitId
    },

    // 打开穿搭详情
    openDetail(outfit) {
      this.currentOutfit = outfit
      this.showDetailModal = true
      document.body.style.overflow = 'hidden' // 防止背景滚动
    },

    // 关闭穿搭详情
    closeDetail() {
      this.showDetailModal = false
      this.currentOutfit = null
      this.newRating = null
      this.newComment = ''
      document.body.style.overflow = '' // 恢复背景滚动
    },

    // 删除穿搭记录
    deleteOutfit(outfitId) {
      if (confirm('确定要删除这条穿搭推荐记录吗？此操作不可恢复。')) {
        // 删除穿搭数据
        this.outfits = this.outfits.filter(outfit => outfit.outfit_id !== outfitId)
        
        // 删除相关评价
        if (this.userEvaluations[outfitId]) {
          delete this.userEvaluations[outfitId]
        }

        // 如果当前正在查看该穿搭的详情，则关闭模态框
        if (this.currentOutfit?.outfit_id === outfitId) {
          this.closeDetail()
        }

        // 关闭操作菜单
        this.activeMenu = null
      }
    },

    // 提交评价
    submitEvaluation() {
      if (!this.newRating) {
        alert('请选择评分')
        return
      }

      if (!this.newComment.trim()) {
        alert('请输入评论内容')
        return
      }

      // 创建新评价
      const newEvaluation = {
        evaluation_id: 'eval' + Date.now(),
        user_id: this.currentUser.user_id,
        outfit_id: this.currentOutfit.outfit_id,
        evaluation_text: this.newComment,
        rating: this.newRating,
        created_at: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\//g, '-')
      }

      // 保存评价
      this.$set(this.userEvaluations, this.currentOutfit.outfit_id, newEvaluation)

      // 更新穿搭评分
      const outfitIndex = this.outfits.findIndex(o => o.outfit_id === this.currentOutfit.outfit_id)
      if (outfitIndex !== -1) {
        this.$set(this.outfits[outfitIndex], 'score', this.newRating)
      }

      // 重置表单
      this.newRating = null
      this.newComment = ''

      // 提示用户
      alert('评价提交成功！')
    },

    // 删除评价
    deleteEvaluation() {
      if (!this.currentOutfit) return

      if (confirm('确定要删除此评价吗？')) {
        // 删除评价数据
        delete this.userEvaluations[this.currentOutfit.outfit_id]

        // 更新穿搭评分
        const outfitIndex = this.outfits.findIndex(o => o.outfit_id === this.currentOutfit.outfit_id)
        if (outfitIndex !== -1) {
          this.$set(this.outfits[outfitIndex], 'score', '暂无')
        }
      }
    }
  },

  // 点击页面其他地方关闭操作菜单
  mounted() {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.more-options-btn') && !e.target.closest('.action-menu')) {
        this.activeMenu = null
      }
    })
  }
}
</script>

<style scoped>
.outfit-record {
  padding-top: 56px;
}

.content-container {
  height: calc(100vh - 56px);
  overflow-y: auto;
  padding-top: 16px;
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

.record-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.score-badge {
  background: rgba(64, 150, 255, 0.1);
  color: #4096FF;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.tag {
  background: #F5F5F5;
  color: #666;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.more-options-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.more-options-btn:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.action-menu {
  position: absolute;
  top: 45px;
  right: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 20;
  overflow: hidden;
  display: none;
  width: 110px;
}

.action-menu.active {
  display: block;
}

.action-menu-item {
  padding: 12px;
  display: flex;
  align-items: center;
  color: #333;
  font-size: 14px;
  cursor: pointer;
}

.action-menu-item i {
  margin-right: 8px;
  font-size: 14px;
}

.action-menu-item.delete {
  color: #ff4d4f;
}

.action-menu-item:active {
  background-color: #f5f5f5;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: none;
  z-index: 50;
  overflow-y: auto;
}

.modal.active {
  display: block;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  margin: 20px auto;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content::-webkit-scrollbar {
  width: 4px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

.rating {
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
}

.rating input {
  display: none;
}

.rating label {
  color: #ddd;
  font-size: 24px;
  padding: 0 2px;
  cursor: pointer;
}

.rating label:hover,
.rating label:hover ~ label,
.rating input:checked ~ label {
  color: #FFD700;
}
</style> 