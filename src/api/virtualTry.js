import request from '@/utils/request'
import { VIRTUAL_TRY_API } from './config'

/**
 * 虚拟试穿
 * @param {Object} data - 试穿参数 {userId, userImageUrl, clothesImageUrl, tryOnType}
 * @returns {Promise}
 */
export function tryOnClothes(data) {
  return request({
    url: VIRTUAL_TRY_API.TRY_ON,
    method: 'post',
    data
  })
}

/**
 * 获取试穿记录
 * @param {number} userId - 用户ID
 * @param {Object} params - 分页参数 {page, size}
 * @returns {Promise}
 */
export function getTryOnRecords(userId, params) {
  return request({
    url: VIRTUAL_TRY_API.RECORDS + userId,
    method: 'get',
    params
  })
}

/**
 * 删除试穿记录
 * @param {number} id - 记录ID
 * @returns {Promise}
 */
export function deleteTryOnRecord(id) {
  return request({
    url: VIRTUAL_TRY_API.DELETE_RECORD + id,
    method: 'delete'
  })
} 