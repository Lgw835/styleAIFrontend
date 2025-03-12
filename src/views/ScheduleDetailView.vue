<template>
  <div class="schedule-detail-page">
    <!-- 使用SubPageNavBar组件作为顶部导航栏 -->
    <SubPageNavBar 
      title="日程详情" 
      :back-link="'/schedule'"
    >
      <template #right-action>
        <router-link :to="`/schedule-edit/${eventId}`" class="edit-btn">
          <i class="fas fa-edit"></i>
        </router-link>
      </template>
    </SubPageNavBar>

    <div class="schedule-detail-container">
      <div v-if="event" class="detail-card">
        <!-- 日程标题 -->
        <h1 class="event-title">{{ event.title }}</h1>
        
        <!-- 日程时间 -->
        <div class="event-time">
          <i class="fas fa-clock"></i>
          <span>{{ event.time }}</span>
          <span class="date-label">{{ formatEventDate }}</span>
        </div>

        <!-- 提醒设置 -->
        <div class="reminder-setting" :class="{ 'active': event.hasReminder }">
          <i class="fas fa-bell"></i>
          <span>{{ event.hasReminder ? '提醒已开启' : '提醒已关闭' }}</span>
          <div class="switch-container">
            <label class="switch">
              <input type="checkbox" v-model="event.hasReminder">
              <span class="slider round"></span>
            </label>
          </div>
        </div>

        <!-- 日程详情 -->
        <div class="event-description">
          <h2 class="section-title">详情描述</h2>
          <p class="description-content">{{ event.description }}</p>
        </div>

        <!-- 地点信息 -->
        <div class="event-location" v-if="event.location">
          <h2 class="section-title">地点</h2>
          <div class="location-content">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ event.location }}</span>
          </div>
        </div>

        <!-- 参与人员 -->
        <div class="event-participants" v-if="event.participants && event.participants.length > 0">
          <h2 class="section-title">参与人员</h2>
          <div class="participants-list">
            <div v-for="(person, index) in event.participants" :key="index" class="participant-item">
              <div class="avatar">{{ person.avatar || person.name.charAt(0) }}</div>
              <span>{{ person.name }}</span>
            </div>
          </div>
        </div>

        <!-- 附件信息 -->
        <div class="event-attachments" v-if="event.attachments && event.attachments.length > 0">
          <h2 class="section-title">附件</h2>
          <div class="attachments-list">
            <div v-for="(attachment, index) in event.attachments" :key="index" class="attachment-item">
              <i :class="getAttachmentIcon(attachment.type)"></i>
              <span>{{ attachment.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 删除按钮 -->
      <div class="action-buttons">
        <button class="delete-btn" @click="confirmDelete">
          <i class="fas fa-trash"></i>
          删除日程
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

const route = useRoute()
const router = useRouter()
const eventId = parseInt(route.params.id)
const event = ref(null)

// 示例事件数据
const events = {
  '2025-03-07': [
    { id: 101, time: '上午 09:00', title: '季度规划会议', description: '讨论下一季度的产品规划和发展方向', hasReminder: true },
    { id: 102, time: '下午 15:00', title: '团队建设活动', description: '参加公司组织的团队拓展训练', hasReminder: true }
  ],
  '2025-03-08': [
    { id: 103, time: '上午 10:30', title: '产品发布会', description: '参加新品发布会，负责技术演示环节', hasReminder: true, location: '公司会议厅', participants: [
      { id: 1, name: '张经理', avatar: 'Z' },
      { id: 2, name: '李工程师', avatar: 'L' },
      { id: 3, name: '王设计师', avatar: 'W' }
    ] },
    { id: 104, time: '下午 14:00', title: '客户洽谈', description: '与潜在客户讨论合作方案', hasReminder: false, location: '星巴克咖啡厅', participants: [
      { id: 4, name: '陈总', avatar: 'C' }
    ] },
    { id: 105, time: '晚上 18:30', title: '家庭聚餐', description: '和家人在喜欢的餐厅共进晚餐', hasReminder: true, location: '海底捞火锅', participants: [
      { id: 5, name: '妻子', avatar: '妻' },
      { id: 6, name: '儿子', avatar: '儿' }
    ] }
  ],
  '2025-03-09': [
    { id: 106, time: '全天', title: '周末出游', description: '带家人去郊外度假，放松心情', hasReminder: true, location: '青山湖景区', attachments: [
      { id: 1, name: '门票预订.pdf', type: 'pdf' },
      { id: 2, name: '行程安排.docx', type: 'doc' }
    ] }
  ],
  '2025-03-10': [
    { id: 107, time: '上午 11:00', title: '项目评审', description: '第一季度项目成果评审会议', hasReminder: true, location: '公司大会议室', attachments: [
      { id: 3, name: '项目报告.pptx', type: 'ppt' },
      { id: 4, name: '财务数据.xlsx', type: 'excel' }
    ] }
  ],
  '2025-03-15': [
    { id: 108, time: '下午 16:30', title: '健身课程', description: '参加健身房的有氧运动课程', hasReminder: false, location: '健身工厂' }
  ]
}

// 计算属性
const formatEventDate = computed(() => {
  if (!event.value) return ''

  const eventDate = findEventDate(eventId)
  if (!eventDate) return ''

  const date = new Date(eventDate)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[date.getDay()]
  
  return `${year}年${month}月${day}日 (周${weekday})`
})

// 方法
function findEvent(id) {
  for (const date in events) {
    const foundEvent = events[date].find(e => e.id === id)
    if (foundEvent) {
      return foundEvent
    }
  }
  return null
}

function findEventDate(id) {
  for (const date in events) {
    const foundEvent = events[date].find(e => e.id === id)
    if (foundEvent) {
      return date
    }
  }
  return null
}

function getAttachmentIcon(type) {
  const iconMap = {
    'pdf': 'fas fa-file-pdf',
    'doc': 'fas fa-file-word',
    'excel': 'fas fa-file-excel',
    'ppt': 'fas fa-file-powerpoint',
    'image': 'fas fa-file-image',
    'video': 'fas fa-file-video'
  }
  return iconMap[type] || 'fas fa-file'
}

function confirmDelete() {
  if (confirm('确定要删除这个日程吗？此操作不可撤销。')) {
    deleteEvent()
  }
}

function deleteEvent() {
  // 这里应该有实际的删除逻辑，目前只是模拟
  console.log(`删除日程：${eventId}`)
  // 删除后返回日程列表页
  router.push('/schedule')
}

// 生命周期钩子
onMounted(() => {
  // 获取事件详情
  const foundEvent = findEvent(eventId)
  if (foundEvent) {
    event.value = foundEvent
  } else {
    router.push('/schedule')
  }
})
</script>

<style scoped>
.schedule-detail-page {
  min-height: 100vh;
  background-color: #F7F7F7;
}

.schedule-detail-container {
  padding-top: 56px; /* 与顶部导航栏高度相同 */
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding-bottom: 32px;
}

.detail-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.event-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.event-time {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #E5E7EB;
}

.event-time i {
  color: #2563EB;
  margin-right: 8px;
  font-size: 16px;
}

.event-time span {
  font-size: 15px;
  color: #374151;
}

.date-label {
  margin-left: 12px;
  color: #6B7280;
  font-size: 14px;
}

.reminder-setting {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #E5E7EB;
}

.reminder-setting i {
  color: #9CA3AF;
  margin-right: 8px;
  font-size: 16px;
}

.reminder-setting.active i {
  color: #FBBF24;
}

.reminder-setting span {
  flex: 1;
  font-size: 15px;
  color: #374151;
}

.switch-container {
  display: flex;
  align-items: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #E5E7EB;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2563EB;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: #4B5563;
  margin: 16px 0 8px 0;
}

.event-description {
  padding: 12px 0;
  border-bottom: 1px solid #E5E7EB;
}

.description-content {
  font-size: 15px;
  color: #374151;
  line-height: 1.5;
}

.event-location {
  padding: 12px 0;
  border-bottom: 1px solid #E5E7EB;
}

.location-content {
  display: flex;
  align-items: center;
}

.location-content i {
  color: #2563EB;
  margin-right: 8px;
  font-size: 16px;
}

.location-content span {
  font-size: 15px;
  color: #374151;
}

.event-participants {
  padding: 12px 0;
  border-bottom: 1px solid #E5E7EB;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.participant-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4B5563;
  font-weight: 500;
  margin-bottom: 4px;
}

.participant-item span {
  font-size: 13px;
  color: #4B5563;
}

.event-attachments {
  padding: 12px 0;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #F3F4F6;
  border-radius: 8px;
}

.attachment-item i {
  color: #4B5563;
  margin-right: 8px;
  font-size: 16px;
}

.attachment-item span {
  font-size: 14px;
  color: #374151;
}

.action-buttons {
  padding: 0 16px;
  margin-top: 24px;
}

.delete-btn {
  width: 100%;
  padding: 12px 0;
  background-color: white;
  color: #EF4444;
  border: 1px solid #EF4444;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.delete-btn i {
  margin-right: 8px;
}

.edit-btn {
  color: #2563EB;
  font-size: 18px;
  padding: 8px;
}
</style> 