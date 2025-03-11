<template>
  <nav class="top-nav">
    <div class="nav-container">
      <h1 class="nav-title">{{ title }}</h1>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'TopNavBar',
  props: {
    title: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
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
</style> 