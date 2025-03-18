import request from '@/utils/request'
import { SCHEDULE_API } from './config'

/**
 * 创建日程
 * @param {Object} data - 日程数据 
 * {
 *   userId: string,
 *   date: string,
 *   eventDescribe: string,
 *   notes: string,
 *   reminder: number
 * }
 * @returns {Promise}
 */
export function createSchedule(data) {
  return request({
    url: SCHEDULE_API.CREATE,
    method: 'post',
    data
  })
}

/**
 * 更新日程
 * @param {Object} data - 日程数据
 * {
 *   scheduleId: string,
 *   userId: string,
 *   date: string,
 *   eventDescribe: string,
 *   notes: string,
 *   reminder: number
 * }
 * @returns {Promise}
 */
export function updateSchedule(data) {
  return request({
    url: SCHEDULE_API.UPDATE,
    method: 'post',
    data
  })
}

/**
 * 删除日程
 * @param {string} scheduleId - 日程ID
 * @returns {Promise}
 */
export function deleteSchedule(scheduleId) {
  return request({
    url: SCHEDULE_API.DELETE + scheduleId,
    method: 'delete'
  })
}

/**
 * 获取今日日程
 * @param {string} userId - 用户ID
 * @returns {Promise<{scheduleList: Array<Schedule>, importantCount: number}>}
 */
export function getTodaySchedules(userId) {
  return request({
    url: SCHEDULE_API.TODAY,
    method: 'get',
    params: { userId }
  })
}

/**
 * 获取指定日期的日程
 * @param {Object} params - 查询参数 {userId: string, date: string}
 * @returns {Promise<{scheduleList: Array<Schedule>, importantCount: number}>}
 */
export function getSchedulesByDate(params) {
  return request({
    url: SCHEDULE_API.DATE,
    method: 'get',
    params
  })
}

/**
 * 记录天气信息
 * @param {Object} data - 天气数据 {userId, location, temperature, weatherType, date}
 * @returns {Promise}
 */
export function recordWeather(data) {
  return request({
    url: SCHEDULE_API.RECORD_WEATHER,
    method: 'post',
    data
  })
}

/**
 * @typedef {Object} Schedule
 * @property {string} scheduleId - 日程ID
 * @property {string} userId - 用户ID
 * @property {string} date - 日期
 * @property {string} eventDescribe - 事件描述
 * @property {string} notes - 备注
 * @property {number} reminder - 提醒状态(1:开启,0:关闭)
 */ 