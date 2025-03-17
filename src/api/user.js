import request from '@/utils/request'
import { USER_API } from './config'

/**
 * 获取短信验证码
 * @param {Object} data - 请求参数 {phone: string}
 * @returns {Promise}
 */
export function getSmsCode(data) {
  return request({
    url: '/style-ai-user-aggregation-service/userApi/sms/code',
    method: 'post',
    data
  })
}

/**
 * 用户注册
 * @param {Object} data - 注册信息 {phone, password, smsCode, smsId}
 * @returns {Promise}
 */
export function register(data) {
  return request({
    url: '/style-ai-user-aggregation-service/userApi/register',
    method: 'post',
    data
  })
}

/**
 * 用户登录
 * @param {Object} data - 登录信息 {username/phone, password}
 * @returns {Promise}
 */
export function login(data) {
  return request({
    url: '/style-ai-user-aggregation-service/userApi/login',
    method: 'post',
    data
  })
}

/**
 * 手机验证码登录
 * @param {Object} data - 包含手机号和验证码的对象
 * @returns {Promise}
 */
export function loginWithPhone(data) {
  return request({
    url: USER_API.LOGIN_PHONE,
    method: 'post',
    data
  })
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息 {id, username, nickname, avatar, gender, birthday}
 * @returns {Promise}
 */
export function updateProfile(data) {
  return request({
    url: USER_API.PROFILE,
    method: 'post',
    data
  })
}

/**
 * 修改密码
 * @param {Object} data - 密码信息 {userId, oldPassword, newPassword}
 * @returns {Promise}
 */
export function updatePassword(data) {
  return request({
    url: USER_API.UPDATE_PASSWORD,
    method: 'post',
    data
  })
}

/**
 * 重置密码
 * @param {Object} data - 重置信息 {phone, newPassword, smsCode, smsId}
 * @returns {Promise}
 */
export function resetPassword(data) {
  return request({
    url: USER_API.RESET_PASSWORD,
    method: 'post',
    data
  })
} 