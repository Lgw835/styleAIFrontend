import request from '@/utils/request'
import { WARDROBE_API } from './config'

/**
 * 获取衣物列表
 * @param {Object} params - 查询参数 {category, color, season, page, size}
 * @returns {Promise}
 */
export function getClothingList(params) {
  return request({
    url: WARDROBE_API.LIST,
    method: 'get',
    params
  })
}

/**
 * 获取用户全部衣物
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export function getAllUserClothes(userId) {
  return request({
    url: WARDROBE_API.ALL_CLOTHES + userId,
    method: 'get'
  })
}

/**
 * 获取衣物详情
 * @param {string|number} id - 衣物ID
 * @returns {Promise}
 */
export function getClothingDetail(id) {
  return request({
    url: WARDROBE_API.DETAIL + id,
    method: 'get'
  })
}

/**
 * 添加衣物
 * @param {Object} data - 衣物信息
 * @returns {Promise}
 */
export function addClothing(data) {
  return request({
    url: WARDROBE_API.ADD,
    method: 'post',
    data
  })
}

/**
 * 更新衣物
 * @param {Object} data - 衣物信息
 * @returns {Promise}
 */
export function updateClothing(data) {
  return request({
    url: WARDROBE_API.UPDATE,
    method: 'put',
    data
  })
}

/**
 * 删除衣物
 * @param {string|number} id - 衣物ID
 * @returns {Promise}
 */
export function deleteClothing(id) {
  return request({
    url: WARDROBE_API.DELETE + id,
    method: 'delete'
  })
}

/**
 * 上传衣物图片
 * @param {FormData} formData - 包含图片的表单数据
 * @returns {Promise}
 */
export function uploadClothingImage(formData) {
  return request({
    url: WARDROBE_API.UPLOAD_IMAGE,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 