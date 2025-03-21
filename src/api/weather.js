import request from '@/utils/request'
import { SCHEDULE_API } from './config'

/**
 * 保存天气记录
 * @param {Object} data - 天气数据 {userId, location, temperature, weatherType, date}
 * @returns {Promise}
 */
export function saveWeatherRecord(data) {
  return request({
    url: SCHEDULE_API.RECORD_WEATHER,
    method: 'post',
    data
  })
} 