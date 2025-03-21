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
      const response = await getSchedulesByDate({ 
        userId,
        date: typeof date === 'string' ? date : formatDateToString(date)
      })
      
      // 新增：保存获取到的日程到 Pinia Store
      if (response && response.scheduleList && response.scheduleList.length > 0) {
        // 将新获取的日程与现有日程合并，避免重复
        const newSchedules = response.scheduleList.filter(
          newS => !schedules.value.some(s => s.scheduleId === newS.scheduleId)
        )
        
        if (newSchedules.length > 0) {
          schedules.value = [...schedules.value, ...newSchedules]
          console.log(`将${newSchedules.length}条日程添加到状态管理中`)
          // 自动保存到会话存储（由于 watch 会触发）
        }
      }
      
      return response
    } catch (error) {
      console.error('获取日程失败:', error)
      return null
    }
  }

  // 根据ID获取单个日程详情
  async function fetchScheduleById(scheduleId, userId) {
    if (!scheduleId || !userId) {
      return { success: false, message: '参数不完整' }
    }
    
    try {
      // 首先检查本地缓存中是否存在该日程
      const cachedSchedule = schedules.value.find(s => s.scheduleId === scheduleId)
      if (cachedSchedule) {
        console.log('从本地缓存中找到日程:', scheduleId)
        return { success: true, schedule: cachedSchedule }
      }
      
      // 如果本地缓存中没有找到，尝试通过获取该日期的所有日程来查找
      // 但首先我们需要获取今天的日程，因为大多数情况下用户查看的是今天的日程
      if (schedules.value.length === 0) {
        console.log('本地缓存为空，获取今日日程')
        const todayResponse = await fetchTodaySchedules(userId)
        if (todayResponse && todayResponse.scheduleList) {
          const foundInToday = todayResponse.scheduleList.find(s => s.scheduleId === scheduleId)
          if (foundInToday) {
            console.log('在今日日程中找到:', scheduleId)
            return { success: true, schedule: foundInToday }
          }
        }
      }
      
      // 如果在今日日程中未找到，需要检查会话存储
      try {
        const savedData = sessionStorage.getItem('scheduleData')
        if (savedData) {
          const data = JSON.parse(savedData)
          if (data.schedules && Array.isArray(data.schedules)) {
            const foundInSession = data.schedules.find(s => s.scheduleId === scheduleId)
            if (foundInSession) {
              console.log('在会话存储中找到日程:', scheduleId)
              return { success: true, schedule: foundInSession }
            }
          }
        }
      } catch (sessionError) {
        console.error('读取会话存储失败:', sessionError)
      }
      
      // 如果未找到日程，返回失败，建议返回日程模块主页
      console.error('未找到对应日程:', scheduleId)
      return { success: false, message: '未找到对应日程，请返回日程列表页' }
    } catch (error) {
      console.error('获取日程详情失败:', error)
      return { success: false, message: '获取日程详情失败' }
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

  // 将通知标记为已查看
  function markNotificationAsViewed() {
    todayNotificationViewed.value = true
    saveToSession()
  }

  // 修改保存到 session 的数据
  function saveToSession() {
    try {
      // 先尝试获取已有的数据
      let existingData = {}
      const savedData = sessionStorage.getItem('scheduleData')
      if (savedData) {
        try {
          existingData = JSON.parse(savedData)
        } catch (e) {
          console.error('解析会话存储中的日程数据失败:', e)
          existingData = {}
        }
      }
      
      // 准备要保存的数据
      const data = {
        schedules: schedules.value,
        importantCount: importantCount.value,
        lastUpdated: new Date().toISOString(),
        todaySchedules: todaySchedules.value,
        todayNotificationViewed: todayNotificationViewed.value
      }
      
      // 如果存在已有数据，尝试合并数组
      if (existingData.schedules && Array.isArray(existingData.schedules)) {
        // 合并日程列表，去除重复项
        const mergedSchedules = [...data.schedules]
        
        existingData.schedules.forEach(existingSchedule => {
          if (!mergedSchedules.some(s => s.scheduleId === existingSchedule.scheduleId)) {
            mergedSchedules.push(existingSchedule)
          }
        })
        
        data.schedules = mergedSchedules
      }
      
      // 保存到会话存储
      sessionStorage.setItem('scheduleData', JSON.stringify(data))
      console.log('日程数据已保存到会话存储，共', data.schedules.length, '条')
    } catch (error) {
      console.error('保存日程数据到会话存储失败:', error)
    }
  }
  
  // 修改从 session 恢复数据的方法
  function restoreFromSession() {
    try {
      const savedData = sessionStorage.getItem('scheduleData')
      if (savedData) {
        const data = JSON.parse(savedData)
        
        // 恢复日程列表
        if (data.schedules && Array.isArray(data.schedules)) {
          schedules.value = data.schedules
        }
        
        // 恢复其他数据
        importantCount.value = data.importantCount || 0
        lastUpdated.value = data.lastUpdated || null
        
        if (data.todaySchedules && Array.isArray(data.todaySchedules)) {
          todaySchedules.value = data.todaySchedules
        }
        
        todayNotificationViewed.value = data.todayNotificationViewed || false
        
        console.log('从会话存储恢复日程数据，共', schedules.value.length, '条')
        return true
      }
      return false
    } catch (error) {
      console.error('从会话存储恢复日程数据失败:', error)
      return false
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
    markNotificationAsViewed,
    
    // 日程模块内部使用的方法
    fetchSchedulesByDate,
    fetchScheduleById,
    createSchedule: createNewSchedule,
    updateSchedule: updateExistingSchedule,
    deleteSchedule: deleteExistingSchedule
  }
}) 