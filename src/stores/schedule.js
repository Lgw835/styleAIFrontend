import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import axios from 'axios'

export const useScheduleStore = defineStore('schedule', () => {
  // 今日日程列表
  const todaySchedules = ref([])
  // 重要日程数量
  const importantCount = ref(0)
  // 加载状态
  const loading = ref(false)
  // 最后更新时间
  const lastUpdated = ref(null)
  // 今日提醒是否已查看
  const todayNotificationViewed = ref(false)

  // TODO: 后端API开发中，暂时使用模拟数据
  const mockSchedules = [
    {
      schedule_id: "1", // 匹配数据库字段命名
      user_id: "mock_user_1", // 匹配数据库字段命名
      date: new Date().toISOString(),
      event_describe: "上午会议", // 匹配数据库字段命名
      notes: "准备项目演示文档",
      reminder: true, // 布尔值，匹配数据库字段类型
      if_delete: false // 匹配数据库字段命名
    },
    {
      schedule_id: "2", // 匹配数据库字段命名 
      user_id: "mock_user_1", // 匹配数据库字段命名
      date: new Date().toISOString(),
      event_describe: "下午健身", // 匹配数据库字段命名
      notes: "记得带运动装备",
      reminder: false, // 布尔值，匹配数据库字段类型
      if_delete: false // 匹配数据库字段命名
    }
  ]

  // 获取今日日程
  async function fetchTodaySchedules(userId) {
    if (!userId) return
    
    try {
      loading.value = true
      
      // TODO: 后端API开发中，暂时返回模拟数据
      // 实际会通过API请求获取
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 过滤掉已删除的日程
      const filteredSchedules = mockSchedules.filter(s => !s.if_delete)
      
      const mockResponse = {
        scheduleList: filteredSchedules,
        importantCount: filteredSchedules.filter(s => s.reminder).length
      }
      
      todaySchedules.value = mockResponse.scheduleList
      importantCount.value = mockResponse.importantCount
      lastUpdated.value = new Date().toISOString()
      
      return mockResponse
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
      
      // TODO: 后端API开发中，暂时返回模拟数据
      // const response = await axios.get('/scheduleApi/date', {
      //   params: { 
      //     userId,
      //     date: date.toISOString()
      //   }
      // })
      
      // 模拟API响应延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        scheduleList: mockSchedules,
        importantCount: 1
      }
    } catch (error) {
      console.error('获取日程失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 记录天气信息
  async function recordWeather(weatherInfo) {
    try {
      // TODO: 后端API开发中，暂时模拟成功响应
      // const response = await axios.post('/scheduleApi/recordWeather', weatherInfo)
      console.log('记录天气信息(模拟):', weatherInfo)
      return true
    } catch (error) {
      console.error('记录天气信息失败:', error)
      return false
    }
  }

  // 标记今日提醒为已查看
  function markNotificationAsViewed() {
    todayNotificationViewed.value = true
  }
  
  // 重置提醒查看状态（每天都应该提醒）
  function resetNotificationStatus() {
    const lastDate = lastUpdated.value ? new Date(lastUpdated.value).toDateString() : null
    const today = new Date().toDateString()
    
    // 如果最后更新日期不是今天，重置查看状态
    if (lastDate !== today) {
      todayNotificationViewed.value = false
    }
  }

  // 从 sessionStorage 恢复数据
  function restoreFromSession() {
    const savedData = sessionStorage.getItem('scheduleData')
    if (savedData) {
      const data = JSON.parse(savedData)
      todaySchedules.value = data.todaySchedules
      importantCount.value = data.importantCount
      lastUpdated.value = data.lastUpdated
      todayNotificationViewed.value = data.todayNotificationViewed || false
      
      // 检查是否需要重置提醒状态（每天都提醒）
      resetNotificationStatus()
    }
  }

  // 保存数据到 sessionStorage
  function saveToSession() {
    const data = {
      todaySchedules: todaySchedules.value,
      importantCount: importantCount.value,
      lastUpdated: lastUpdated.value,
      todayNotificationViewed: todayNotificationViewed.value
    }
    sessionStorage.setItem('scheduleData', JSON.stringify(data))
  }

  // 监听数据变化并保存
  watch(
    [todaySchedules, importantCount, lastUpdated, todayNotificationViewed],
    () => {
      saveToSession()
    },
    { deep: true }
  )

  // 初始化时恢复数据
  restoreFromSession()

  return {
    todaySchedules,
    importantCount,
    loading,
    lastUpdated,
    todayNotificationViewed,
    fetchTodaySchedules,
    fetchSchedulesByDate,
    recordWeather,
    restoreFromSession,
    saveToSession,
    markNotificationAsViewed,
    resetNotificationStatus
  }
}) 