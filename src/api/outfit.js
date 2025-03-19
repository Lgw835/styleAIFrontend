import request from '@/utils/request'
import { OUTFIT_API } from './config'

/**
 * ==================== 穿搭推荐相关 ====================
 */

/**
 * 智能穿搭推荐生成
 * @param {Object} data - 推荐参数
 * @returns {Promise}
 */
export function recommendOutfit(data) {
  return request({
    url: '/style-ai-dress-aggregation-service/outfitApi/recommend',
    method: 'post',
    data
  })
}

/**
 * 生成穿搭图片
 * @param {Object} data - 包含prompt和userId等信息
 * @returns {Promise}
 */
export function generateOutfitImage(data) {
  return request({
    url: '/style-ai-dress-aggregation-service/outfitApi/generateImage',
    method: 'post',
    data
  })
}

/**
 * 发送穿搭方案跟进请求 (修改方案)
 * @param {Object} data - 包含穿搭方案和用户修改意见
 * @returns {Promise}
 */
export function followUpOutfit(data) {
  return request({
    url: '/style-ai-dress-aggregation-service/outfitApi/followUp',
    method: 'post',
    data
  })
}

/**
 * 保存穿搭方案
 * @param {Object} data - 保存的穿搭方案数据
 * @returns {Promise}
 */
export function saveOutfit(params) {
  return request({
    url: '/style-ai-dress-aggregation-service/outfitApi/save',
    method: 'post',
    data: params
  })
}

/**
 * ==================== 穿搭记录相关 ====================
 */

/**
 * 获取用户穿搭记录列表 - 修正为正确的API路径
 * @param {string} userId - 用户ID
 * @returns {Promise}
 */
export function getOutfitRecords(userId) {
  return request({
    url: '/style-ai-dress-aggregation-service/outfitApi/getOutfitRecommends',
    method: 'get',
    params: { userId }
  })
}

/**
 * 获取穿搭记录详情 - 暂时使用本地数据，不发起实际请求
 * @param {string|number} id - 记录ID
 * @returns {Promise}
 */
export function getOutfitDetail(id) {
  // 由于没有详情API，我们返回一个模拟的成功响应
  return Promise.resolve({
    success: true,
    data: null // 返回null，后续由store中的本地数据处理
  })
}

/**
 * 保存穿搭评论
 * @param {Object} data - 评论信息
 * @returns {Promise}
 */
export const saveOutfitComment = (data) => {
  return request({
    url: '/style-ai-dress-aggregation-service/outfitApi/saveOutfitComment',
    method: 'post',
    data
  })
}

/**
 * 删除穿搭记录 - 暂时不实际发起请求
 * @param {string|number} outfitId - 穿搭记录ID
 * @returns {Promise}
 */
export function deleteOutfitRecord(outfitId) {
  // 由于没有删除API，我们返回一个模拟的成功响应
  console.log('模拟删除记录:', outfitId)
  return Promise.resolve({ success: true })
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
 * ==================== 每日一搭相关 ====================
 */

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
 * ==================== 穿搭图片相关 ====================
 */

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
 * ==================== AI评价相关（不要修改） ====================
 */

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
 * 获取AI穿搭评论
 * @param {string} userId - 用户ID
 * @returns {Promise}
 */
export function getFashionEvaluations(userId) {
  return request({
    url: '/style-ai-dress-aggregation-service/outfitApi/getFashionEvaluations',
    method: 'get',
    params: { userId }
  })
} 