<template>
  <div class="home">
    <!-- 使用导航栏组件 -->
    <TopNavBar title="智能穿搭" />
    
    <!-- 主要内容区 -->
    <div class="content">
      <!-- 天气卡片 -->
      <div class="weather-card">
        <div class="weather-info">
          <div>
            <h3>北京</h3>
            <p>晴朗 • 空气优</p>
          </div>
          <div class="temperature">
            <p class="current-temp">23°</p>
            <p class="temp-range">15° / 26°</p>
          </div>
        </div>
      </div>

      <!-- 今日幸运色 -->
      <div class="lucky-color">
        <h3>今日幸运色</h3>
        <div class="color-display">
          <div class="color-circle"></div>
          <div class="color-info">
            <p>浅粉红色</p>
            <p>带来好运与温暖</p>
          </div>
        </div>
      </div>

      <!-- 功能网格 -->
      <div class="feature-grid">
        <router-link to="/daily-match" class="feature-item">
          <div class="icon-wrapper blue">
            <i class="fas fa-tshirt"></i>
          </div>
          <h3>每日一搭</h3>
          <p>AI为您精选搭配</p>
        </router-link>
        <router-link to="/dress-recommend" class="feature-item">
          <div class="icon-wrapper purple">
            <i class="fas fa-magic"></i>
          </div>
          <h3>穿搭推荐</h3>
          <p>个性化搭配建议</p>
        </router-link>
        <div class="feature-item">
          <div class="icon-wrapper green">
            <i class="fas fa-star"></i>
          </div>
          <h3>AI评价</h3>
          <p>专业搭配点评</p>
        </div>
        <div class="feature-item">
          <div class="icon-wrapper yellow">
            <i class="fas fa-history"></i>
          </div>
          <h3>穿搭记录</h3>
          <p>查看历史搭配</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TopNavBar from '@/components/TopNavBar.vue'

export default {
  name: 'HomeView',
  components: {
    TopNavBar
  }
}
</script>

<style scoped>
.home {
  padding-top: 56px;
}

.content {
  padding: 16px;
}

.weather-card, .lucky-color {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.weather-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.current-temp {
  font-size: 2rem;
  font-weight: 300;
}

.temp-range {
  color: #6b7280;
  font-size: 0.875rem;
}

.color-display {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}

.color-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #FFB6C1;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.feature-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.icon-wrapper.blue { background-color: #e0f2fe; }
.icon-wrapper.purple { background-color: #f3e8ff; }
.icon-wrapper.green { background-color: #dcfce7; }
.icon-wrapper.yellow { background-color: #fef9c3; }

.feature-item h3 {
  font-size: 1rem;
  margin-bottom: 4px;
}

.feature-item p {
  font-size: 0.875rem;
  color: #6b7280;
}
</style> 