<template>
  <div class="schedule-detail-page">
    <!-- 使用SubPageNavBar组件作为顶部导航栏 -->
    <SubPageNavBar 
      title="日程详情" 
      :back-link="'/schedule'"
    >
      <template #right-action>
        <button class="edit-btn" @click="toggleEdit">
          <i class="fas" :class="isEditing ? 'fa-check' : 'fa-edit'"></i>
        </button>
      </template>
    </SubPageNavBar>

    <div class="schedule-detail-container">
      <div v-if="event" class="detail-card">
        <!-- 事件描述 -->
        <div class="event-title-container">
          <input 
            v-if="isEditing"
            v-model="editedEvent.eventDescribe"
            class="edit-input title-input"
            placeholder="请输入事件描述"
          >
          <h1 v-else class="event-title">{{ event.eventDescribe }}</h1>
        </div>
        
        <!-- 日期 -->
        <div class="event-time">
          <i class="fas fa-calendar"></i>
          <span>{{ formatDate(event.date) }}</span>
        </div>

        <!-- 提醒设置 -->
        <div class="reminder-setting" :class="{ 'active': isReminderEnabled }">
          <i class="fas fa-bell"></i>
          <span>{{ isReminderEnabled ? '提醒已开启' : '提醒已关闭' }}</span>
          <div class="switch-container">
            <label class="switch">
              <input 
                type="checkbox" 
                v-model="isReminderEnabled" 
                :disabled="!isEditing"
              >
              <span class="slider round"></span>
            </label>
          </div>
        </div>

        <!-- 备注 -->
        <div class="event-description">
          <h2 class="section-title">备注</h2>
          <textarea
            v-if="isEditing"
            v-model="editedEvent.notes"
            class="edit-input notes-input"
            placeholder="请输入备注(选填)"
            rows="4"
          ></textarea>
          <p v-else class="description-content">{{ event.notes || '暂无备注' }}</p>
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useScheduleStore } from '@/stores/schedule'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const scheduleStore = useScheduleStore()

const eventId = route.params.id
const event = ref(null)
const isReminderEnabled = ref(false)
const isEditing = ref(false)
const editedEvent = ref({})

// 格式化日期
function formatDate(dateStr) {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[date.getDay()]
  return `${year}年${month}月${day}日 (周${weekday})`
}

// 切换编辑模式
function toggleEdit() {
  if (isEditing.value) {
    saveChanges()
  } else {
    startEditing()
  }
  isEditing.value = !isEditing.value
}

// 开始编辑
function startEditing() {
  editedEvent.value = {
    ...event.value,
    reminder: isReminderEnabled.value ? 1 : 0
  }
}

// 保存更改
async function saveChanges() {
  if (!editedEvent.value.eventDescribe) {
    alert('请输入事件描述')
    return
  }

  const updatedEvent = {
    ...editedEvent.value,
    reminder: isReminderEnabled.value ? 1 : 0
  }

  try {
    const result = await scheduleStore.updateSchedule(updatedEvent)
    
    if (result.success) {
      event.value = { ...updatedEvent }
      isEditing.value = false
    } else {
      alert(result.message || '更新失败')
      isReminderEnabled.value = event.value.reminder === 1
    }
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败')
    isReminderEnabled.value = event.value.reminder === 1
  }
}

// 确认删除
function confirmDelete() {
  if (confirm('确定要删除这个日程吗？此操作不可撤销。')) {
    deleteEvent()
  }
}

// 删除日程
async function deleteEvent() {
  if (!event.value) return
  
  try {
    const result = await scheduleStore.deleteSchedule(
      event.value.scheduleId,
      event.value.userId,
      new Date(event.value.date)
    )
    
    if (result.success) {
      router.push('/schedule')
    } else {
      alert(result.message || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    alert('删除失败')
  }
}

// 初始化数据
onMounted(async () => {
  if (!eventId) {
    router.push('/schedule')
    return
  }

  try {
    // 直接通过ID获取日程详情
    const result = await scheduleStore.fetchScheduleById(eventId, userStore.userInfo?.userId)
    
    if (result && result.success && result.schedule) {
      // 使用获取到的日程数据
      event.value = result.schedule
      isReminderEnabled.value = result.schedule.reminder === 1
      editedEvent.value = { ...result.schedule }
    } else {
      // 如果API调用成功但未返回日程数据，尝试从本地查找
      const foundEvent = scheduleStore.schedules.find(e => e.scheduleId === eventId)
      if (foundEvent) {
        event.value = foundEvent
        isReminderEnabled.value = foundEvent.reminder === 1
        editedEvent.value = { ...foundEvent }
      } else {
        // 如果本地也找不到，则返回列表页
        console.error('未找到对应日程:', eventId)
        alert('未找到对应日程，请返回日程列表重新选择')
        router.push('/schedule')
      }
    }
  } catch (error) {
    console.error('获取日程详情失败:', error)
    alert('获取日程详情失败，请返回日程列表重新选择')
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

.event-title-container {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #E5E7EB;
}

.edit-input {
  width: 100%;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 15px;
  color: #374151;
}

.title-input {
  font-size: 20px;
  font-weight: 600;
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

.notes-input {
  width: 100%;
  resize: vertical;
  min-height: 80px;
}

.description-content {
  font-size: 15px;
  color: #374151;
  line-height: 1.5;
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