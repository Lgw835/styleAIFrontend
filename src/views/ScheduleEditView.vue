<template>
  <div class="schedule-edit-page">
    <!-- 使用SubPageNavBar组件作为顶部导航栏 -->
    <SubPageNavBar 
      :title="isEdit ? '编辑日程' : '添加日程'" 
      :back-link="isEdit ? `/schedule-detail/${eventId}` : '/schedule'"
    >
      <template #right-action>
        <button class="save-btn" @click="saveEvent">保存</button>
      </template>
    </SubPageNavBar>

    <div class="schedule-edit-container">
      <div class="edit-form">
        <!-- 事件描述输入 -->
        <div class="form-group">
          <label class="form-label" for="eventDescribe">事件描述</label>
          <input 
            type="text" 
            id="eventDescribe" 
            class="form-input" 
            placeholder="请输入事件描述" 
            v-model="formData.eventDescribe"
          >
        </div>

        <!-- 日期选择 -->
        <div class="form-group">
          <label class="form-label">日期</label>
          <input 
            type="date" 
            class="form-input"
            v-model="formData.date"
          >
        </div>

        <!-- 提醒设置 -->
        <div class="form-group">
          <div class="reminder-toggle">
            <div>
              <label class="form-label">开启提醒</label>
              <p class="form-desc">开启后将在日程开始前提醒您</p>
            </div>
            <div class="switch-container">
              <label class="switch">
                <input type="checkbox" v-model="formData.reminder">
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- 备注输入 -->
        <div class="form-group">
          <label class="form-label" for="notes">备注</label>
          <textarea 
            id="notes" 
            class="form-textarea" 
            placeholder="请输入备注(选填)" 
            v-model="formData.notes"
            rows="4"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- 日期选择弹窗 -->
    <div class="date-picker-popup" :class="{ 'active': isDatePickerVisible }">
      <div class="date-picker-container">
        <div class="picker-header">
          <h2>选择日期</h2>
          <button class="close-btn" @click="hideDatePicker">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- 月份选择器 -->
        <div class="month-selector">
          <button class="month-btn" @click="prevMonth">
            <i class="fas fa-chevron-left"></i>
          </button>
          <h3 class="current-month">{{ formatCurrentMonth }}</h3>
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
              'other-month': day.isOtherMonth
            }"
            @click="selectDate(day.date)"
          >
            {{ day.day }}
          </div>
        </div>
        
        <div class="picker-footer">
          <button class="confirm-btn" @click="confirmDate">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useScheduleStore } from '@/stores/schedule'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const scheduleStore = useScheduleStore()

const eventId = route.params.id
const isEdit = computed(() => !!eventId)

// 表单数据
const formData = ref({
  eventDescribe: '',
  date: new Date().toISOString().split('T')[0],
  reminder: false,
  notes: '',
  userId: userStore.userInfo?.userId
})

// 日期选择器状态
const isDatePickerVisible = ref(false)
const currentDate = ref(new Date())
const calendarDays = ref([])

// 计算属性
const formatDate = computed(() => {
  const year = formData.value.date.getFullYear()
  const month = formData.value.date.getMonth() + 1
  const day = formData.value.date.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const weekday = weekdays[formData.value.date.getDay()]
  return `${year}年${month}月${day}日 (周${weekday})`
})

const formatCurrentMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年${month}月`
})


function hideDatePicker() {
  isDatePickerVisible.value = false
}

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  renderCalendar()
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  renderCalendar()
}

function confirmDate() {
  hideDatePicker()
}

function selectDate(date) {
  formData.value.date = date
  renderCalendar()
}

// 从日程对象设置表单数据
function setFormDataFromEvent(event) {
  const eventDate = new Date(event.date)
  
  formData.value = {
    eventDescribe: event.eventDescribe,
    date: eventDate.toISOString().split('T')[0],
    reminder: event.reminder === 1,
    notes: event.notes || '',
    userId: event.userId
  }
}

// 保存日程
async function saveEvent() {
  if (!formData.value.eventDescribe) {
    alert('请输入事件描述')
    return
  }

  try {
    const data = {
      ...formData.value,
      reminder: formData.value.reminder ? 1 : 0
    }

    if (isEdit.value) {
      data.schedule_id = eventId
      await scheduleStore.updateSchedule(data)
    } else {
      await scheduleStore.createSchedule(data)
    }

    router.push('/schedule')
  } catch (error) {
    console.error('保存日程失败:', error)
    alert('保存失败')
  }
}

function renderCalendar() {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // 获取当月第一天是星期几
  const firstDayIndex = firstDay.getDay()
  
  // 获取上个月的最后几天
  const prevLastDay = new Date(year, month, 0)
  const daysInPrevMonth = prevLastDay.getDate()
  
  // 计算需要显示的日期总数
  const daysInMonth = lastDay.getDate()
  
  const days = []
  
  // 上个月的日期
  for (let i = firstDayIndex; i > 0; i--) {
    const day = daysInPrevMonth - i + 1
    const date = new Date(year, month - 1, day)
    
    days.push({
      day,
      date,
      isOtherMonth: true,
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, formData.value.date)
    })
  }
  
  // 当月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    
    days.push({
      day: i,
      date,
      isOtherMonth: false,
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, formData.value.date)
    })
  }
  
  // 下个月的日期
  const nextDays = 42 - days.length
  for (let i = 1; i <= nextDays; i++) {
    const date = new Date(year, month + 1, i)
    
    days.push({
      day: i,
      date,
      isOtherMonth: true,
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, formData.value.date)
    })
  }
  
  calendarDays.value = days
}

// 辅助函数
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

// 生命周期钩子
onMounted(() => {
  renderCalendar()
  
  if (isEdit.value && scheduleStore.schedules.length > 0) {
    const event = scheduleStore.schedules.find(e => e.schedule_id === eventId)
    if (event) {
      formData.value = {
        eventDescribe: event.eventDescribe,
        date: new Date(event.date).toISOString().split('T')[0],
        reminder: event.reminder === 1,
        notes: event.notes,
        userId: event.userId
      }
    }
  }
})
</script>

<style scoped>
.schedule-edit-page {
  min-height: 100vh;
  background-color: #F7F7F7;
}

.schedule-edit-container {
  padding-top: 56px;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding-bottom: 32px;
}

.edit-form {
  margin: 16px;
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4B5563;
  margin-bottom: 8px;
}

.form-desc {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 15px;
  color: #111827;
}

.form-textarea {
  resize: none;
}

.picker-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 15px;
  color: #111827;
}

.picker-input i {
  color: #9CA3AF;
}

.time-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-option {
  padding: 8px 12px;
  background-color: #F3F4F6;
  border-radius: 6px;
  font-size: 14px;
  color: #4B5563;
  border: none;
  cursor: pointer;
}

.time-option.active {
  background-color: #EBF5FF;
  color: #2563EB;
}

.reminder-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.date-picker-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: none;
}

.date-picker-popup.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-picker-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  width: 90%;
  max-width: 360px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.picker-header h2 {
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

.picker-footer {
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

.save-btn {
  color: #2563EB;
  font-size: 15px;
  font-weight: 500;
  background: none;
  border: none;
  padding: 8px;
}
</style> 