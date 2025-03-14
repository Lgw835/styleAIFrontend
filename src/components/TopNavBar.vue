<template>
  <div class="top-nav-bar">
    <div class="nav-left">
      <slot name="left">
        <!-- 默认左侧内容 -->
        <i class="fas fa-arrow-left" v-if="showBack" @click="goBack"></i>
      </slot>
    </div>
    <div class="nav-title">{{ title }}</div>
    <div class="nav-right">
      <slot name="right">
        <!-- 默认右侧为空 -->
      </slot>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'TopNavBar',
  props: {
    title: {
      type: String,
      default: ''
    },
    showBack: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const router = useRouter()

    const goBack = () => {
      router.back()
    }

    return {
      goBack
    }
  }
}
</script>

<style scoped>
.top-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  z-index: 100;
}

.nav-left {
  width: 40px;
  display: flex;
  align-items: center;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.nav-right {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.nav-left i, .nav-right i {
  font-size: 1.2rem;
  color: #333;
}
</style> 