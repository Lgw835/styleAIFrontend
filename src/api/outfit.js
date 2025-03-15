import request from '@/utils/request'
import { OUTFIT_API } from './config'

/**
 * 获取穿搭推荐
 * @param {Object} data - 推荐参数
 * @returns {Promise}
 */
export function getOutfitRecommend(data) {
  return request({
    url: '/style-ai-dress-aggregation-service/outfitApi/recommend',
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
 * @param {Object} params - 包含图片的参数
 * @returns {Promise}
 */
export async function uploadOutfitImage(params) {
  const formData = new FormData()
  formData.append('file', params.image)
  formData.append('userId', params.userId)
  
  return request({
    url: '/style-ai-user-aggregation-service/fileApi/upload',
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

/**
 * 保存穿搭
 * @param {Object} data - 穿搭信息
 * @returns {Promise}
 */
export function saveOutfit(data) {
  return request({
    url: OUTFIT_API.SAVE,
    method: 'post',
    data
  })
}

/**
 * 保存穿搭评论
 * @param {Object} data - 评论信息
 * @returns {Promise}
 */
export function saveOutfitComment(data) {
  return request({
    url: OUTFIT_API.SAVE_COMMENT,
    method: 'post',
    data
  })
}

/**
 * 生成穿搭图片
 * @param {Object} data - 图片生成参数
 * @returns {Promise}
 */
export function generateOutfitImage(data) {
  return request({
    url: OUTFIT_API.GENERATE_IMAGE,
    method: 'post',
    data
  })
}

/**
 * 穿搭对话修改
 * @param {Object} data - 修改参数
 * @returns {Promise}
 */
export function followUpOutfit(data) {
  return request({
    url: OUTFIT_API.FOLLOW_UP,
    method: 'post',
    data
  })
}

/**
 * AI评论穿搭
 * @param {Object} params - 评价参数
 * @returns {Promise}
 */
export async function evaluateOutfit(params) {
  return request({
    url: '/style-ai-dress-aggregation-service/outfitApi/evaluateOutfit',
    method: 'post',
    data: {
      userId: params.userId,
      ipAddress: params.ipAddress,
      url: params.url
    }
  })
}

/**
 * 获取用户穿搭推荐记录
 * @param {string} userId - 用户ID
 * @returns {Promise}
 */
export function getOutfitRecommends(userId) {
  return request({
    url: OUTFIT_API.GET_RECOMMENDS,
    method: 'get',
    params: { userId }
  })
}

/**
 * 获取AI穿搭评论
 * @param {string} userId - 用户ID
 * @returns {Promise}
 */
export function getFashionEvaluations(userId) {
  return request({
    url: OUTFIT_API.GET_EVALUATIONS,
    method: 'get',
    params: { userId }
  })
} 