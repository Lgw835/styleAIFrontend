<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- 顶部导航栏 -->
    <SubPageNavBar title="穿搭推荐" backLink="/" />

    <!-- 主要内容区 -->
    <div class="flex-1 pt-14 pb-4">
      <div class="p-4 space-y-4">
        <!-- 用户形象导入 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-lg font-medium mb-4">用户画像</h3>
          <div class="flex items-center mb-4">
            <input 
              type="checkbox" 
              id="use-profile" 
              v-model="useProfile"
              class="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
            >
            <label for="use-profile" class="ml-2 text-gray-700">使用我的用户画像进行推荐</label>
          </div>
          <p class="text-xs text-gray-500 mb-3">系统将使用您的身材数据、风格偏好等信息，为您生成更个性化的穿搭推荐。</p>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">画像完整度</span>
            <div class="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div class="bg-blue-500 h-full rounded-full" :style="{ width: profileCompleteness + '%' }"></div>
            </div>
            <span class="text-sm text-blue-500">{{ profileCompleteness }}%</span>
          </div>
        </div>

        <!-- 场景选择 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-lg font-medium mb-4">穿搭场景</h3>
          <div class="grid grid-cols-3 gap-3">
            <button 
              v-for="scene in scenes" 
              :key="scene.name"
              class="p-3 border rounded-lg text-center"
              :class="{ 'bg-blue-50 border-blue-500': selectedScene === scene.name }"
              @click="selectScene(scene.name)"
            >
              <i :class="['fas', scene.icon, 'mb-2', 'text-gray-600']"></i>
              <p class="text-sm">{{ scene.name }}</p>
            </button>
          </div>
        </div>

        <!-- 形象标签 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-lg font-medium mb-4">形象标签</h3>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="tag in imageTags" 
              :key="tag"
              class="px-4 py-2 rounded-full border"
              :class="{ 'bg-blue-50 border-blue-500': selectedTags.includes(tag) }"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <!-- 性别选择 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-lg font-medium mb-4">性别</h3>
          <div class="flex gap-4">
            <button 
              class="flex-1 py-2 rounded-lg border"
              :class="{ 'bg-blue-50 border-blue-500': gender === 'male' }"
              @click="selectGender('male')"
            >
              <i class="fas fa-mars mr-2"></i>男士
            </button>
            <button 
              class="flex-1 py-2 rounded-lg border"
              :class="{ 'bg-blue-50 border-blue-500': gender === 'female' }"
              @click="selectGender('female')"
            >
              <i class="fas fa-venus mr-2"></i>女士
            </button>
          </div>
        </div>

        <!-- 附加信息 -->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <h3 class="text-lg font-medium mb-4">附加信息</h3>
          <textarea 
            v-model="additionalInfo"
            class="w-full border rounded-lg p-3 h-24" 
            placeholder="请输入其他需求或偏好..."
          ></textarea>
        </div>

        <!-- 下一步按钮 -->
        <button 
          class="w-full bg-blue-500 text-white py-3 rounded-lg mt-6"
          @click="handleNext"
        >
          下一步
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import SubPageNavBar from '@/components/SubPageNavBar.vue'

export default {
  name: 'DressRecommendView',
  components: {
    SubPageNavBar
  },
  data() {
    return {
      useProfile: true,
      profileCompleteness: 75,
      selectedScene: '',
      selectedTags: [],
      gender: '',
      additionalInfo: '',
      scenes: [
        { name: '商务正式', icon: 'fa-briefcase' },
        { name: '休闲日常', icon: 'fa-coffee' },
        { name: '约会', icon: 'fa-heart' },
        { name: '运动', icon: 'fa-dumbbell' },
        { name: '派对', icon: 'fa-glass-cheers' },
        { name: '更多', icon: 'fa-plus' }
      ],
      imageTags: ['优雅知性', '活力运动', '甜美可爱', '简约时尚', '成熟稳重']
    }
  },
  methods: {
    selectScene(scene) {
      this.selectedScene = scene
    },
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag)
      if (index === -1) {
        this.selectedTags.push(tag)
      } else {
        this.selectedTags.splice(index, 1)
      }
    },
    selectGender(gender) {
      this.gender = gender
    },
    handleNext() {
      // 表单验证
      if (!this.selectedScene) {
        alert('请选择穿搭场景')
        return
      }
      
      if (this.selectedTags.length === 0) {
        alert('请至少选择一个形象标签')
        return
      }
      
      if (!this.gender) {
        alert('请选择性别')
        return
      }

      // 准备推荐数据
      const recommendData = {
        useProfile: this.useProfile,
        selectedScene: this.selectedScene,
        selectedTags: this.selectedTags,
        gender: this.gender,
        additionalInfo: this.additionalInfo.trim()
      }
      
      // 导航到结果页面，并传递数据
      this.$router.push({
        name: 'outfit-result',
        query: {
          scene: this.selectedScene,
          tags: this.selectedTags.join(','),
          gender: this.gender
        },
        state: recommendData
      })
    }
  }
}
</script>

<style>
/* 由于使用了Tailwind CSS，这里不需要额外的样式 */
</style> 