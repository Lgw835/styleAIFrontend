import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { 
  getTodaySchedules,
  getSchedulesByDate,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  recordWeather
} from '@/api/schedule'

export const useScheduleStore = defineStore('schedule', () => {
  // 只存储日程列表，供其他模块使用
  const schedules = ref([])
  // 重要日程数量，供其他模块使用
  const importantCount = ref(0)
  // 最后更新时间，用于缓存控制
  const lastUpdated = ref(null)
  const todaySchedules = ref([])
  const todayNotificationViewed = ref(false)
  
  // 格式化日期为 YYYY-MM-DD
  function formatDateToString(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 获取今日日程并更新store
  async function fetchTodaySchedules(userId) {
    if (!userId) return null
    
    try {
      const response = await getTodaySchedules(userId)
      
      if (response && response.scheduleList) {
        // 更新store数据供其他模块使用
        schedules.value = response.scheduleList
        importantCount.value = response.importantCount || 0
        lastUpdated.value = new Date().toISOString()
        todaySchedules.value = response.scheduleList
      }
      
      return response
    } catch (error) {
      console.error('获取今日日程失败:', error)
      return null
    }
  }

  // 获取指定日期的日程，不更新store
  async function fetchSchedulesByDate(userId, date) {
    if (!userId || !date) return null
    
    try {
      return await getSchedulesByDate({ 
        userId,
        date: typeof date === 'string' ? date : formatDateToString(date)
      })
    } catch (error) {
      console.error('获取日程失败:', error)
      return null
    }
  }

  // 创建日程
  async function createNewSchedule(scheduleData) {
    try {
      const data = {
        userId: scheduleData.userId,
        eventDescribe: scheduleData.eventDescribe,
        date: scheduleData.date,
        notes: scheduleData.notes,
        reminder: scheduleData.reminder ? 1 : 0
      }
      
      const response = await createSchedule(data)
      
      // 如果是今天的日程，更新store数据
      const today = new Date()
      const scheduleDate = new Date(data.date)
      if (today.toDateString() === scheduleDate.toDateString()) {
        await fetchTodaySchedules(data.userId)
      }
      
      return response
    } catch (error) {
      console.error('创建日程失败:', error)
      return { success: false, message: '创建日程失败' }
    }
  }

  // 更新日程
  async function updateExistingSchedule(scheduleData) {
    try {
      const data = {
        scheduleId: scheduleData.scheduleId,
        userId: scheduleData.userId,
        eventDescribe: scheduleData.eventDescribe,
        date: scheduleData.date,
        notes: scheduleData.notes,
        reminder: scheduleData.reminder ? 1 : 0
      }
      
      const response = await updateSchedule(data)
      
      // 如果是今天的日程，更新store数据
      const today = new Date()
      const scheduleDate = new Date(data.date)
      if (today.toDateString() === scheduleDate.toDateString()) {
        await fetchTodaySchedules(data.userId)
      }
      
      return response
    } catch (error) {
      console.error('更新日程失败:', error)
      return { success: false, message: '更新日程失败' }
    }
  }

  // 删除日程
  async function deleteExistingSchedule(scheduleId, userId, date) {
    try {
      const response = await deleteSchedule(scheduleId)
      
      // 如果是今天的日程，更新store数据
      const today = new Date()
      const scheduleDate = new Date(date)
      if (today.toDateString() === scheduleDate.toDateString()) {
        await fetchTodaySchedules(userId)
      }
      
      return response
    } catch (error) {
      console.error('删除日程失败:', error)
      return { success: false, message: '删除日程失败' }
    }
  }

  // 记录天气信息
  async function recordWeatherInfo(weatherInfo) {
    try {
      const response = await recordWeather(weatherInfo)
      return response
    } catch (error) {
      console.error('记录天气信息失败:', error)
      return { success: false, message: '记录天气信息失败' }
    }
  }

  // 设置今日提醒查看状态
  function setTodayNotificationViewed(viewed) {
    todayNotificationViewed.value = viewed
    saveToSession()
  }

  // 修改保存到 session 的数据
  function saveToSession() {
    const data = {
      schedules: schedules.value,
      importantCount: importantCount.value,
      lastUpdated: lastUpdated.value,
      todaySchedules: todaySchedules.value,
      todayNotificationViewed: todayNotificationViewed.value
    }
    sessionStorage.setItem('scheduleData', JSON.stringify(data))
  }
  
  // 修改从 session 恢复数据的方法
  function restoreFromSession() {
    const savedData = sessionStorage.getItem('scheduleData')
    if (savedData) {
      const data = JSON.parse(savedData)
      schedules.value = data.schedules || []
      importantCount.value = data.importantCount || 0
      lastUpdated.value = data.lastUpdated || null
      todaySchedules.value = data.todaySchedules || []
      todayNotificationViewed.value = data.todayNotificationViewed || false
    }
  }
  
  // 监听数据变化
  watch(
    [schedules, importantCount, lastUpdated, todaySchedules, todayNotificationViewed],
    () => {
      saveToSession()
    },
    { deep: true }
  )

  // 初始化时恢复数据
  restoreFromSession()

  return {
    // 暴露给其他模块使用的数据和方法
    schedules,
    importantCount,
    lastUpdated,
    todaySchedules,
    todayNotificationViewed,
    fetchTodaySchedules,
    recordWeather: recordWeatherInfo,
    restoreFromSession,
    saveToSession,
    setTodayNotificationViewed,
    
    // 日程模块内部使用的方法
    fetchSchedulesByDate,
    createSchedule: createNewSchedule,
    updateSchedule: updateExistingSchedule,
    deleteSchedule: deleteExistingSchedule
  }
}) 