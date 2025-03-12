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
        <!-- 标题输入 -->
        <div class="form-group">
          <label class="form-label" for="title">标题</label>
          <input 
            type="text" 
            id="title" 
            class="form-input" 
            placeholder="请输入日程标题" 
            v-model="formData.title"
          >
        </div>

        <!-- 日期选择 -->
        <div class="form-group" @click="showDatePicker">
          <label class="form-label">日期</label>
          <div class="picker-input">
            <span>{{ formatDate }}</span>
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>

        <!-- 时间选择 -->
        <div class="form-group">
          <label class="form-label">时间</label>
          <div class="time-options">
            <button 
              v-for="timeOption in timeOptions" 
              :key="timeOption.value"
              class="time-option"
              :class="{ 'active': formData.time === timeOption.value }"
              @click="formData.time = timeOption.value"
            >
              {{ timeOption.label }}
            </button>
          </div>
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
                <input type="checkbox" v-model="formData.hasReminder">
                <span class="slider round"></span>
              </label>
            </div>
          </div>
          <div v-if="formData.hasReminder" class="reminder-time-options">
            <button 
              v-for="reminderOption in reminderOptions" 
              :key="reminderOption.value"
              class="reminder-option"
              :class="{ 'active': formData.reminderTime === reminderOption.value }"
              @click="formData.reminderTime = reminderOption.value"
            >
              {{ reminderOption.label }}
            </button>
          </div>
        </div>

        <!-- 地点输入 -->
        <div class="form-group">
          <label class="form-label" for="location">地点</label>
          <input 
            type="text" 
            id="location" 
            class="form-input" 
            placeholder="请输入地点（选填）" 
            v-model="formData.location"
          >
        </div>

        <!-- 描述输入 -->
        <div class="form-group">
          <label class="form-label" for="description">描述</label>
          <textarea 
            id="description" 
            class="form-textarea" 
            placeholder="请输入日程描述（选填）" 
            v-model="formData.description"
            rows="4"
          ></textarea>
        </div>

        <!-- 参与人员选择 -->
        <div class="form-group">
          <div class="section-header">
            <label class="form-label">参与人员</label>
            <button class="add-btn" @click="addParticipant">
              <i class="fas fa-plus"></i> 添加
            </button>
          </div>
          <div class="participants-list" v-if="formData.participants && formData.participants.length > 0">
            <div v-for="(person, index) in formData.participants" :key="index" class="participant-item">
              <div class="participant-info">
                <div class="avatar">{{ person.avatar || person.name.charAt(0) }}</div>
                <span>{{ person.name }}</span>
              </div>
              <button class="remove-btn" @click="removeParticipant(index)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div v-else class="empty-participants">
            <p>暂无参与人员</p>
          </div>
        </div>

        <!-- 附件管理 -->
        <div class="form-group">
          <div class="section-header">
            <label class="form-label">附件</label>
            <button class="add-btn" @click="uploadAttachment">
              <i class="fas fa-plus"></i> 添加
            </button>
          </div>
          <div class="attachments-list" v-if="formData.attachments && formData.attachments.length > 0">
            <div v-for="(attachment, index) in formData.attachments" :key="index" class="attachment-item">
              <div class="attachment-info">
                <i :class="getAttachmentIcon(attachment.type)"></i>
                <span>{{ attachment.name }}</span>
              </div>
              <button class="remove-btn" @click="removeAttachment(index)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div v-else class="empty-attachments">
            <p>暂无附件</p>
          </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SubPageNavBar from '@/components/SubPageNavBar.vue'

const route = useRoute()
const router = useRouter()
const eventId = route.params.id ? parseInt(route.params.id) : null
const isEdit = computed(() => !!eventId)

// 表单数据
const formData = ref({
  title: '',
  date: new Date(),
  time: '上午 10:00',
  hasReminder: false,
  reminderTime: '10分钟前',
  location: '',
  description: '',
  participants: [],
  attachments: []
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

// 配置选项
const timeOptions = [
  { label: '上午 08:00', value: '上午 08:00' },
  { label: '上午 09:00', value: '上午 09:00' },
  { label: '上午 10:00', value: '上午 10:00' },
  { label: '上午 11:00', value: '上午 11:00' },
  { label: '下午 12:00', value: '下午 12:00' },
  { label: '下午 13:00', value: '下午 13:00' },
  { label: '下午 14:00', value: '下午 14:00' },
  { label: '下午 15:00', value: '下午 15:00' },
  { label: '下午 16:00', value: '下午 16:00' },
  { label: '下午 17:00', value: '下午 17:00' },
  { label: '下午 18:00', value: '下午 18:00' },
  { label: '晚上 19:00', value: '晚上 19:00' },
  { label: '晚上 20:00', value: '晚上 20:00' },
  { label: '全天', value: '全天' }
]

const reminderOptions = [
  { label: '准时', value: '准时' },
  { label: '5分钟前', value: '5分钟前' },
  { label: '10分钟前', value: '10分钟前' },
  { label: '15分钟前', value: '15分钟前' },
  { label: '30分钟前', value: '30分钟前' },
  { label: '1小时前', value: '1小时前' },
  { label: '2小时前', value: '2小时前' },
  { label: '1天前', value: '1天前' }
]

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

// 方法
function showDatePicker() {
  isDatePickerVisible.value = true
  currentDate.value = new Date(formData.value.date)
  renderCalendar()
}

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

function selectDate(date) {
  formData.value.date = date
  renderCalendar()
}

function confirmDate() {
  hideDatePicker()
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

function addParticipant() {
  if (!formData.value.participants) {
    formData.value.participants = []
  }

  // 这里应该弹出选择联系人的界面，目前简单模拟添加
  const newParticipant = {
    id: Date.now(),
    name: `联系人${formData.value.participants.length + 1}`,
    avatar: (formData.value.participants.length + 1).toString()
  }
  
  formData.value.participants.push(newParticipant)
}

function removeParticipant(index) {
  formData.value.participants.splice(index, 1)
}

function uploadAttachment() {
  if (!formData.value.attachments) {
    formData.value.attachments = []
  }

  // 这里应该弹出文件选择器，目前简单模拟添加
  const fileTypes = ['pdf', 'doc', 'excel', 'ppt', 'image']
  const randomType = fileTypes[Math.floor(Math.random() * fileTypes.length)]
  const fileNames = {
    'pdf': '文档.pdf',
    'doc': '报告.docx',
    'excel': '数据.xlsx',
    'ppt': '演示.pptx',
    'image': '图片.jpg'
  }
  
  const newAttachment = {
    id: Date.now(),
    name: fileNames[randomType],
    type: randomType
  }
  
  formData.value.attachments.push(newAttachment)
}

function removeAttachment(index) {
  formData.value.attachments.splice(index, 1)
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

function saveEvent() {
  if (!formData.value.title.trim()) {
    alert('请输入日程标题')
    return
  }

  // 这里应该有保存日程的实际逻辑
  console.log('保存日程', formData.value)
  
  // 保存后返回列表页或详情页
  if (isEdit.value) {
    router.push(`/schedule-detail/${eventId}`)
  } else {
    router.push('/schedule')
  }
}

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

// 辅助函数
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

// 生命周期钩子
onMounted(() => {
  if (isEdit.value) {
    // 获取事件详情
    const foundEvent = findEvent(eventId)
    if (foundEvent) {
      // 填充表单数据
      formData.value.title = foundEvent.title
      formData.value.time = foundEvent.time
      formData.value.hasReminder = foundEvent.hasReminder
      formData.value.reminderTime = foundEvent.reminderTime || '10分钟前'
      formData.value.description = foundEvent.description || ''
      formData.value.location = foundEvent.location || ''
      formData.value.participants = foundEvent.participants ? [...foundEvent.participants] : []
      formData.value.attachments = foundEvent.attachments ? [...foundEvent.attachments] : []
      
      // 设置日期
      const eventDate = findEventDate(eventId)
      if (eventDate) {
        formData.value.date = new Date(eventDate)
        currentDate.value = new Date(eventDate)
      }
    } else {
      router.push('/schedule')
    }
  }
  
  renderCalendar()
})
</script>

<style scoped>
.schedule-edit-page {
  min-height: 100vh;
  background-color: #F7F7F7;
}

.schedule-edit-container {
  padding-top: 56px; /* 与顶部导航栏高度相同 */
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding-bottom: 32px;
}

.edit-form {
  padding: 16px;
}

.form-group {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.form-label {
  font-size: 15px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  display: block;
}

.form-desc {
  font-size: 13px;
  color: #6B7280;
  margin-top: 2px;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 10px 0;
  border: none;
  border-bottom: 1px solid #E5E7EB;
  font-size: 15px;
  color: #1F2937;
  background: none;
  outline: none;
}

.form-textarea {
  resize: none;
  line-height: 1.5;
}

.form-input:focus, .form-textarea:focus {
  border-bottom-color: #2563EB;
}

.picker-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #E5E7EB;
  cursor: pointer;
}

.picker-input span {
  font-size: 15px;
  color: #1F2937;
}

.picker-input i {
  color: #9CA3AF;
  font-size: 12px;
}

.time-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
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

.reminder-time-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.reminder-option {
  padding: 6px 10px;
  background-color: #F3F4F6;
  border-radius: 6px;
  font-size: 13px;
  color: #4B5563;
  border: none;
  cursor: pointer;
}

.reminder-option.active {
  background-color: #EBF5FF;
  color: #2563EB;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.add-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #2563EB;
  font-size: 14px;
  cursor: pointer;
}

.add-btn i {
  margin-right: 4px;
  font-size: 12px;
}

.participants-list, .attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.participant-item, .attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #F3F4F6;
  border-radius: 8px;
}

.participant-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #D1D5DB;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4B5563;
  font-weight: 500;
  margin-right: 8px;
  font-size: 14px;
}

.participant-info span, .attachment-info span {
  font-size: 14px;
  color: #374151;
}

.attachment-info {
  display: flex;
  align-items: center;
}

.attachment-info i {
  color: #4B5563;
  margin-right: 8px;
  font-size: 16px;
}

.remove-btn {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 4px;
}

.empty-participants, .empty-attachments {
  display: flex;
  justify-content: center;
  padding: 12px;
}

.empty-participants p, .empty-attachments p {
  font-size: 14px;
  color: #9CA3AF;
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