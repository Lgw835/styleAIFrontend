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
  // 日程列表
  const schedules = ref([])
  // 重要日程数量
  const importantCount = ref(0)
  // 加载状态
  const loading = ref(false)
  // 最后更新时间
  const lastUpdated = ref(null)
  // 当前选中日期
  const selectedDate = ref(new Date())
  
  // 获取今日日程
  async function fetchTodaySchedules(userId) {
    if (!userId) return
    
    try {
      loading.value = true
      const response = await getTodaySchedules(userId)
      
      if (response && response.scheduleList) {
        schedules.value = response.scheduleList
        importantCount.value = response.importantCount || 0
        lastUpdated.value = new Date().toISOString()
      }
      
      return response
    } catch (error) {
      console.error('获取今日日程失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 获取指定日期的日程
  async function fetchSchedulesByDate(userId, date) {
    if (!userId || !date) return
    
    try {
      loading.value = true
      
      const response = await getSchedulesByDate({ 
        userId,
        date: typeof date === 'string' ? date : formatDateToString(date)
      })
      
      if (response && response.scheduleList) {
        schedules.value = response.scheduleList
        importantCount.value = response.importantCount || 0
        selectedDate.value = typeof date === 'string' ? new Date(date) : new Date(date)
        lastUpdated.value = new Date().toISOString()
      }
      
      return response
    } catch (error) {
      console.error('获取日程失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 添加日期格式化辅助函数
  function formatDateToString(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 创建日程
  async function createNewSchedule(scheduleData) {
    try {
      loading.value = true
      
      // 转换字段名以匹配后端
      const data = {
        userId: scheduleData.userId,
        eventDescribe: scheduleData.eventDescribe,
        date: scheduleData.date,
        notes: scheduleData.notes,
        reminder: scheduleData.reminder ? 1 : 0
      }
      
      const response = await createSchedule(data)
      
      if (response.data.success) {
        // 重新获取当天日程以保持数据同步
        await fetchSchedulesByDate(data.userId, new Date(data.date))
      }
      
      return response.data
    } catch (error) {
      console.error('创建日程失败:', error)
      return { success: false, message: '创建日程失败' }
    } finally {
      loading.value = false
    }
  }

  // 更新日程
  async function updateExistingSchedule(scheduleData) {
    try {
      loading.value = true
      
      const data = {
        scheduleId: scheduleData.scheduleId,
        userId: scheduleData.userId,
        eventDescribe: scheduleData.eventDescribe,
        date: scheduleData.date,
        notes: scheduleData.notes,
        reminder: scheduleData.reminder ? 1 : 0
      }
      
      const response = await updateSchedule(data)
      
      if (response.success) {
        // 重新获取当天日程以保持数据同步
        await fetchSchedulesByDate(data.userId, new Date(data.date))
      }
      
      return response
    } catch (error) {
      console.error('更新日程失败:', error)
      return { success: false, message: '更新日程失败' }
    } finally {
      loading.value = false
    }
  }

  // 删除日程
  async function deleteExistingSchedule(scheduleId, userId, date) {
    try {
      loading.value = true
      
      const response = await deleteSchedule(scheduleId)
      
      if (response.data.success) {
        // 重新获取当天日程以保持数据同步
        await fetchSchedulesByDate(userId, date)
      }
      
      return response.data
    } catch (error) {
      console.error('删除日程失败:', error)
      return { success: false, message: '删除日程失败' }
    } finally {
      loading.value = false
    }
  }

  // 记录天气信息
  async function recordWeatherInfo(weatherInfo) {
    try {
      const response = await recordWeather(weatherInfo)
      return response.data
    } catch (error) {
      console.error('记录天气信息失败:', error)
      return false
    }
  }

  // 从 sessionStorage 恢复数据
  function restoreFromSession() {
    const savedData = sessionStorage.getItem('scheduleData')
    if (savedData) {
      const data = JSON.parse(savedData)
      schedules.value = data.schedules || []
      importantCount.value = data.importantCount || 0
      lastUpdated.value = data.lastUpdated || null
      selectedDate.value = data.selectedDate ? new Date(data.selectedDate) : new Date()
    }
  }

  // 保存数据到 sessionStorage
  function saveToSession() {
    const data = {
      schedules: schedules.value,
      importantCount: importantCount.value,
      lastUpdated: lastUpdated.value,
      selectedDate: selectedDate.value.toISOString()
    }
    sessionStorage.setItem('scheduleData', JSON.stringify(data))
  }

  // 监听数据变化并保存
  watch(
    [schedules, importantCount, lastUpdated, selectedDate],
    () => {
      saveToSession()
    },
    { deep: true }
  )

  // 初始化时恢复数据
  restoreFromSession()

  return {
    schedules,
    importantCount,
    loading,
    lastUpdated,
    selectedDate,
    fetchTodaySchedules,
    fetchSchedulesByDate,
    createSchedule: createNewSchedule,
    updateSchedule: updateExistingSchedule,
    deleteSchedule: deleteExistingSchedule,
    recordWeather: recordWeatherInfo,
    restoreFromSession,
    saveToSession
  }
}) 