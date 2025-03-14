import request from '@/utils/request'
import { OUTFIT_API } from './config'

/**
 * 获取穿搭推荐
 * @param {Object} data - 推荐参数
 * @returns {Promise}
 */
export function getOutfitRecommend(data) {
  return request({
    url: OUTFIT_API.RECOMMEND,
    method: 'post',
    data
  })
}

/**
 * 获取每日一搭
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getDailyMatch(params) {
  return request({
    url: OUTFIT_API.DAILY_MATCH,
    method: 'get',
    params
  })
}

/**
 * 上传穿搭照片
 * @param {FormData} formData - 包含图片的表单数据
 * @returns {Promise}
 */
export function uploadOutfitImage(formData) {
  return request({
    url: OUTFIT_API.UPLOAD,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取穿搭记录列表
 * @param {Object} params - 查询参数 {page, size}
 * @returns {Promise}
 */
export function getOutfitRecords(params) {
  return request({
    url: OUTFIT_API.RECORD_LIST,
    method: 'get',
    params
  })
}

/**
 * 获取穿搭记录详情
 * @param {string|number} id - 记录ID
 * @returns {Promise}
 */
export function getOutfitRecordDetail(id) {
  return request({
    url: OUTFIT_API.RECORD_DETAIL + id,
    method: 'get'
  })
} 