<template>
  <nav class="sub-nav" :class="{ 'with-border': showBorder }">
    <div class="nav-container">
      <!-- 返回按钮 -->
      <router-link :to="backLink" class="back-button">
        <slot name="back-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </slot>
      </router-link>
      
      <!-- 居中标题 -->
      <h1 class="nav-title">
        <slot name="title">{{ title }}</slot>
      </h1>

      <!-- 右侧操作区 -->
      <div class="right-action">
        <slot name="right-action"></slot>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'SubPageNavBar',
  props: {
    title: {
      type: String,
      required: true
    },
    backLink: {
      type: [String, Object],
      required: true
    },
    showBorder: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>
.sub-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: white;
  z-index: 20;
  transition: all 0.3s ease;
}

.with-border {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.nav-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  padding: 0 16px;
  max-width: 640px;
  margin: 0 auto;
}

.nav-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.back-button {
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111827;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.back-button:active {
  transform: scale(0.95);
}

.right-action {
  position: absolute;
  right: 16px;
  display: flex;
  align-items: center;
}
</style> 