import request from '@/utils/request'
import { SCHEDULE_API } from './config'

/**
 * 获取天气信息
 * @param {string} city - 城市名称
 * @returns {Promise}
 */
export function getWeather(city) {
  return request({
    url: '/style-ai-user-aggregation-service/otherApi/weather',
    method: 'get',
    params: { city }
  })
}

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