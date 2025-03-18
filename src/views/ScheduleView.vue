<template>
  <div class="schedule-page">
    <!-- 使用SubPageNavBar组件作为顶部导航栏 -->
    <SubPageNavBar 
      title="我的日程" 
      :back-link="'/profile'"
    >
      <template #right-action>
        <button id="calendarBtn" class="calendar-btn" @click="showCalendarPopup">
          <i class="fas fa-calendar-alt"></i>
        </button>
      </template>
    </SubPageNavBar>

    <!-- 主要内容区 -->
    <div class="schedule-container">
      <!-- 选中日期显示 -->
      <div class="date-display">
        <div class="flex items-center">
          <h2 class="selected-date">{{ formatSelectedDate }}</h2>
          <div class="weekday-label">{{ formatWeekday }}</div>
        </div>
        <button class="today-btn" @click="goToToday">今天</button>
      </div>

      <!-- 日程列表 -->
      <div class="event-list-container">
        <div v-if="dayEvents.length > 0" class="event-list">
          <!-- 日程列表项 -->
          <router-link 
            v-for="event in dayEvents" 
            :key="event.scheduleId" 
            :to="`/schedule-detail/${event.scheduleId}`" 
            class="event-link"
          >
            <div class="event-card">
              <div class="title">{{ event.eventDescribe }}</div>
              <div class="description">{{ event.notes }}</div>
              <div v-if="event.reminder === 1" class="reminder">
                <i class="fas fa-bell"></i>
                <span>提醒已开启</span>
              </div>
            </div>
          </router-link>
        </div>
        
        <!-- 空状态显示 -->
        <div v-else class="empty-state">
          <i class="fas fa-calendar-day"></i>
          <p class="empty-title">今日没有日程安排</p>
          <p class="empty-desc">点击右下角"+"按钮添加新日程</p>
        </div>
      </div>
    </div>

    <!-- 日历弹出框 -->
    <div class="calendar-popup" :class="{ 'active': isCalendarVisible }">
      <div class="calendar-container">
        <div class="calendar-header">
          <h3 class="calendar-title">选择日期</h3>
          <button class="close-btn" @click="hideCalendarPopup">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- 月份选择器 -->
        <div class="month-selector">
          <button class="month-btn" @click="prevMonth">
            <i class="fas fa-chevron-left"></i>
          </button>
          <h4 class="current-month">{{ formatCurrentMonth }}</h4>
          <button class="month-btn" @click="nextMonth">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <!-- 日历头部 -->
        <div class="calendar-header-grid">
          <div v-for="weekday in ['日', '一', '二', '三', '四', '五', '六']" :key="weekday" class="weekday">
            {{ weekday }}
          </div>
        </div>

        <!-- 日历网格 -->
        <div class="calendar-grid">
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            class="calendar-day"
            :class="{
              'today': day.isToday,
              'selected': day.isSelected,
              'other-month': day.isOtherMonth,
              'has-event': day.hasEvent
            }"
            @click="selectDate(day.date)"
          >
            {{ day.day }}
          </div>
        </div>
        
        <div class="calendar-footer">
          <button class="confirm-btn" @click="confirmDate">确定</button>
        </div>
      </div>
    </div>

    <!-- 添加按钮 -->
    <router-link to="/schedule-edit" class="add-button">
      <i class="fas fa-plus"></i>
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useScheduleStore } from '@/stores/schedule' 
import SubPageNavBar from '@/components/SubPageNavBar.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const scheduleStore = useScheduleStore()

// 状态变量
const currentDate = ref(new Date())
const isCalendarVisible = ref(false)
const calendarDays = ref([])

// 计算属性
const selectedDate = computed(() => scheduleStore.selectedDate)

const formatSelectedDate = computed(() => {
  const date = scheduleStore.selectedDate
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
})

const formatWeekday = computed(() => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[scheduleStore.selectedDate.getDay()]
})

const formatCurrentMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年${month}月`
})

const dayEvents = computed(() => {
  return scheduleStore.schedules
})

// 方法
// 格式化日期为 YYYY-MM-DD 格式
function formatDateToString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取日程列表
async function fetchSchedules() {
  if (!userStore.userInfo?.userId) return
  
  try {
    const date = scheduleStore.selectedDate
    // 使用格式化后的日期字符串
    await scheduleStore.fetchSchedulesByDate(
      userStore.userInfo.userId, 
      formatDateToString(date)
    )
  } catch (error) {
    console.error('获取日程失败:', error)
  }
}

// 渲染日历
function renderCalendar() {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // 获取当月第一天是星期几
  const firstDayOfWeek = firstDay.getDay()
  
  const days = []
  
  // 添加上个月的日期
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({
      date,
      day: date.getDate(),
      isOtherMonth: true,
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, selectedDate.value),
      hasEvent: false // 可以根据实际日程判断
    })
  }
  
  // 添加当月的日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({
      date,
      day: i,
      isOtherMonth: false,
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, selectedDate.value),
      hasEvent: false // 可以根据实际日程判断
    })
  }
  
  // 添加下个月的日期
  const remainingDays = 42 - days.length // 保持6行
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      date,
      day: i,
      isOtherMonth: true,
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, selectedDate.value),
      hasEvent: false // 可以根据实际日程判断
    })
  }
  
  calendarDays.value = days
}

// 判断两个日期是否是同一天
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

// 选择日期
function selectDate(date) {
  currentDate.value = new Date(date)
  calendarDays.value = calendarDays.value.map(day => ({
    ...day,
    isSelected: isSameDay(day.date, currentDate.value)
  }))
}

// 显示日历弹窗
function showCalendarPopup() {
  isCalendarVisible.value = true
  currentDate.value = new Date(scheduleStore.selectedDate)
  renderCalendar()
}

// 隐藏日历弹窗
function hideCalendarPopup() {
  isCalendarVisible.value = false
}

// 上个月
function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  renderCalendar()
}

// 下个月
function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  renderCalendar()
}

// 确认选择日期
async function confirmDate() {
  const selectedDate = new Date(currentDate.value)
  // 设置时间为当天的 00:00:00
  selectedDate.setHours(0, 0, 0, 0)
  scheduleStore.selectedDate = selectedDate
  hideCalendarPopup()
  await fetchSchedules()
}

// 跳转到今天
async function goToToday() {
  const today = new Date()
  // 设置时间为当天的 00:00:00
  today.setHours(0, 0, 0, 0)
  scheduleStore.selectedDate = today
  await fetchSchedules()
}

// 监听路由变化，重新获取数据
watch(
  () => route.path,
  () => {
    if (route.path === '/schedule') {
      fetchSchedules()
    }
  }
)

// 初始化
onMounted(() => {
  fetchSchedules()
  renderCalendar()
})
</script>

<style scoped>
.schedule-page {
  min-height: 100vh;
  background-color: #F7F7F7;
}

.schedule-container {
  padding-top: 56px;
  padding-bottom: 72px;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

/* 日期显示区域 */
.date-display {
  background: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #EEEEEE;
}

.selected-date {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.weekday-label {
  margin-left: 8px;
  font-size: 12px;
  background-color: #EBF5FF;
  color: #2563EB;
  padding: 2px 8px;
  border-radius: 12px;
}

.today-btn {
  font-size: 14px;
  color: #2563EB;
  background: none;
  border: none;
  padding: 4px 8px;
}

/* 事件列表容器 */
.event-list-container {
  padding: 16px;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

/* 事件卡片样式 */
.event-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.event-card .title {
  font-size: 16px;
  font-weight: 500;
  margin: 6px 0;
  color: #111827;
}

.event-card .description {
  font-size: 14px;
  color: #4B5563;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-card .reminder {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.event-card .reminder i {
  color: #FBBF24;
  margin-right: 6px;
  font-size: 12px;
}

.event-card .reminder span {
  font-size: 12px;
  color: #9CA3AF;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #E5E7EB;
}

.empty-state .empty-title {
  font-size: 16px;
  color: #6B7280;
  margin-bottom: 8px;
}

.empty-state .empty-desc {
  font-size: 14px;
  color: #9CA3AF;
}

/* 日历弹出框样式 */
.calendar-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: none;
}

.calendar-popup.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-container {
  background: white;
  border-radius: 12px;
  padding: 16px;
  width: 90%;
  max-width: 360px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.calendar-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  color: #6B7280;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

/* 月份选择器 */
.month-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.month-btn {
  color: #6B7280;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.current-month {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
}

/* 日历头部 */
.calendar-header-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
}

.weekday {
  font-size: 14px;
  color: #6B7280;
  padding: 4px 0;
}

/* 日历网格 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 16px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
  position: relative;
  cursor: pointer;
}

.calendar-day.today {
  background-color: #2563EB;
  color: white;
}

.calendar-day.selected {
  background-color: #EBF5FF;
  color: #2563EB;
}

.calendar-day.other-month {
  color: #D1D5DB;
}

.calendar-day.has-event::after {
  content: '';
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  background-color: #2563EB;
  border-radius: 50%;
}

/* 日历底部 */
.calendar-footer {
  display: flex;
  justify-content: flex-end;
}

.confirm-btn {
  background-color: #2563EB;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

/* 添加按钮 */
.add-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563EB 0%, #3B82F6 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 20;
  text-decoration: none;
  font-size: 20px;
  transition: transform 0.2s;
}

.add-button:active {
  transform: scale(0.95);
}

.calendar-btn {
  background: none;
  border: none;
  color: #111827;
  font-size: 18px;
  padding: 8px;
  cursor: pointer;
}

/* 移除时间相关样式,其他样式保持不变 */
.time {
  display: none;
}
</style> 