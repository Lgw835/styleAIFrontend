import request from '@/utils/request'
import { USER_API } from './config'

/**
 * 保存/更新用户画像
 * @param {Object} data - 用户画像数据
 * @returns {Promise}
 */
export function saveUserPortrait(data) {
  return request({
    url: USER_API.PROFILE,
    method: 'post',
    data
  })
} 