<template>
  <div class="help-center">
    <SubPageNavBar title="帮助中心" backLink="/profile" />
    
    <div class="content-wrapper">
      <!-- 搜索框 -->
      <div class="search-container">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索常见问题..." 
            class="search-input"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- 常见问题分类 -->
      <div class="faq-categories">
        <div 
          v-for="(category, index) in categories" 
          :key="index"
          class="category-item"
          :class="{ active: activeCategory === index }"
          @click="activeCategory = index"
        >
          <i :class="category.icon"></i>
          <span>{{ category.name }}</span>
        </div>
      </div>

      <!-- 问题列表 -->
      <div class="faq-container">
        <h2 class="section-title">{{ categories[activeCategory].name }}</h2>
        
        <div class="faq-list">
          <div 
            v-for="(question, qIndex) in filteredQuestions" 
            :key="qIndex"
            class="faq-item"
          >
            <div 
              class="question"
              @click="toggleQuestion(question)"
            >
              <span>{{ question.title }}</span>
              <i :class="question.expanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </div>
            <div 
              class="answer"
              v-if="question.expanded"
              v-html="question.answer"
            ></div>
          </div>
        </div>

        <!-- 没有结果时显示 -->
        <div v-if="filteredQuestions.length === 0" class="no-results">
          <i class="fas fa-search"></i>
          <p>未找到相关问题</p>
          <p class="sub-text">请尝试使用其他关键词搜索</p>
        </div>
      </div>

      <!-- 联系客服提示 -->
      <div class="contact-tip">
        <p>没有找到需要的帮助？</p>
        <router-link to="/contact-service" class="contact-btn">
          联系客服
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

// 搜索相关
const searchQuery = ref('')
const clearSearch = () => {
  searchQuery.value = ''
}

// 分类
const activeCategory = ref(0)
const categories = ref([
  { name: '穿搭咨询', icon: 'fas fa-tshirt' },
  { name: '应用功能', icon: 'fas fa-mobile-alt' },
  { name: '账户问题', icon: 'fas fa-user-shield' },
  { name: '支付相关', icon: 'fas fa-credit-card' }
])

// 常见问题数据
const questions = ref([
  {
    category: 0,
    title: '如何获取个性化穿搭建议？',
    answer: '您可以通过以下步骤获取个性化穿搭建议：<br><br>1. 完善个人资料中的身材数据<br>2. 上传您的衣物到虚拟衣柜<br>3. 前往"每日穿搭"页面，系统会根据您的衣柜、体型数据和当日天气提供合适的穿搭方案',
    expanded: false
  },
  {
    category: 0,
    title: '智能穿搭如何根据场合推荐衣物？',
    answer: '我们的智能穿搭系统会考虑多种因素：<br><br>• 您设定的场合类型（工作、约会、休闲等）<br>• 您的个人风格偏好<br>• 季节和天气情况<br>• 您衣柜中可用的服装组合<br><br>系统会综合分析这些因素，推荐最适合的穿搭方案。',
    expanded: false
  },
  {
    category: 0,
    title: '如何使用AI评测我的穿搭？',
    answer: '使用AI评测您的穿搭非常简单：<br><br>1. 点击"AI评测"功能<br>2. 上传您当前的穿搭照片<br>3. 选择场合类型（如职场、派对等）<br>4. 等待AI分析（通常在30秒内完成）<br>5. 查看详细的评测报告和改进建议',
    expanded: false
  },
  {
    category: 1,
    title: '如何添加衣物到我的虚拟衣柜？',
    answer: '添加衣物到虚拟衣柜有两种方式：<br><br>1. <b>拍照上传</b>：在"衣柜"页面点击"+"按钮，拍摄您的衣物照片，填写基本信息后上传<br><br>2. <b>从相册选择</b>：同样在"衣柜"页面点击"+"按钮，从相册中选择已有的衣物照片上传<br><br>上传后，AI将自动识别衣物类型、颜色等属性，您也可以手动修改这些信息。',
    expanded: false
  },
  {
    category: 1,
    title: '如何设置我的体型数据？',
    answer: '设置体型数据步骤如下：<br><br>1. 进入"我的"-"个人资料"<br>2. 点击"用户画像"<br>3. 在表单中填写您的身高、体重、三围等数据<br>4. 选择您的体型类型<br>5. 保存信息<br><br>更准确的体型数据将帮助系统提供更精准的穿搭建议。',
    expanded: false
  },
  {
    category: 2,
    title: '如何修改我的账户密码？',
    answer: '修改账户密码的步骤：<br><br>1. 进入"我的"-"修改密码"<br>2. 输入当前密码<br>3. 输入新密码并确认<br>4. 点击"确认修改"<br><br>为了账户安全，建议使用包含字母、数字和特殊字符的强密码。',
    expanded: false
  },
  {
    category: 2,
    title: '如何设置隐私保护？',
    answer: '保护您的隐私很重要，您可以：<br><br>1. 进入"我的"-"个人资料"-"隐私设置"<br>2. 设置谁可以查看您的穿搭分享<br>3. 控制个人信息的可见范围<br>4. 开启或关闭定位共享<br><br>我们建议定期检查您的隐私设置，确保数据安全。',
    expanded: false
  },
  {
    category: 3,
    title: '如何订阅高级会员？',
    answer: '订阅高级会员步骤：<br><br>1. 进入"我的"-"会员中心"<br>2. 查看不同会员套餐及权益<br>3. 选择适合您的套餐<br>4. 选择支付方式完成支付<br><br>高级会员可享受AI深度分析、无限衣物存储等特权。',
    expanded: false
  },
  {
    category: 3,
    title: '支持哪些支付方式？',
    answer: '我们目前支持以下支付方式：<br><br>• 微信支付<br>• 支付宝<br>• 银联卡<br>• Apple Pay（iOS用户）<br>• 各大银行储蓄卡/信用卡',
    expanded: false
  }
])

// 点击展开/收起问题
const toggleQuestion = (question) => {
  question.expanded = !question.expanded
}

// 根据搜索和分类过滤问题
const filteredQuestions = computed(() => {
  return questions.value.filter(q => {
    // 先按分类过滤
    const matchCategory = q.category === activeCategory.value
    
    // 如果有搜索词，再按搜索词过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      return matchCategory && (
        q.title.toLowerCase().includes(query) || 
        q.answer.toLowerCase().includes(query)
      )
    }
    
    return matchCategory
  })
})
</script>

<style scoped>
.help-center {
  background-color: #F7F7F7;
  min-height: 100vh;
}

.content-wrapper {
  padding-top: 56px; /* 与顶部导航栏高度相同 */
  padding-bottom: 30px;
  max-width: 640px;
  margin: 0 auto;
}

/* 搜索框样式 */
.search-container {
  padding: 16px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 0 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-icon {
  color: #9CA3AF;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  padding: 12px 0;
  font-size: 15px;
  color: #374151;
  outline: none;
}

.clear-btn {
  background: none;
  border: none;
  color: #9CA3AF;
  padding: 0;
  cursor: pointer;
}

/* 分类样式 */
.faq-categories {
  display: flex;
  overflow-x: auto;
  padding: 0 16px 8px;
  gap: 12px;
  scrollbar-width: none; /* Firefox */
}

.faq-categories::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  min-width: 70px;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-item i {
  font-size: 20px;
  margin-bottom: 6px;
  color: #9CA3AF;
}

.category-item span {
  font-size: 13px;
  color: #4B5563;
}

.category-item.active {
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
}

.category-item.active i,
.category-item.active span {
  color: white;
}

/* 问题列表样式 */
.faq-container {
  padding: 0 16px;
  margin-top: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.faq-list {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.faq-item {
  border-bottom: 1px solid #F3F4F6;
}

.faq-item:last-child {
  border-bottom: none;
}

.question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
}

.question span {
  font-size: 15px;
  color: #374151;
  font-weight: 500;
}

.question i {
  color: #9CA3AF;
  font-size: 14px;
}

.answer {
  padding: 0 16px 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #6B7280;
}

/* 无结果样式 */
.no-results {
  text-align: center;
  padding: 40px 0;
}

.no-results i {
  font-size: 40px;
  color: #D1D5DB;
  margin-bottom: 16px;
}

.no-results p {
  font-size: 16px;
  color: #4B5563;
  margin-bottom: 8px;
}

.no-results .sub-text {
  font-size: 14px;
  color: #9CA3AF;
}

/* 联系客服提示 */
.contact-tip {
  margin-top: 24px;
  text-align: center;
}

.contact-tip p {
  font-size: 15px;
  color: #6B7280;
  margin-bottom: 12px;
}

.contact-btn {
  display: inline-block;
  background: linear-gradient(135deg, #9333EA 0%, #EC4899 100%);
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(236, 72, 153, 0.3);
  transition: all 0.3s ease;
}

.contact-btn:active {
  transform: scale(0.98);
}
</style> 