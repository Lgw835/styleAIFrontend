import request from '@/utils/request'
import { OUTFIT_API } from './config'

// 智能穿搭推荐生成
export function recommendOutfit(data) {
  return request({
    url: OUTFIT_API.RECOMMEND,
    method: 'post',
    data
  })
}

// 生成穿搭图片
export function generateOutfitImage(data) {
  return request({
    url: OUTFIT_API.GENERATE_IMAGE,
    method: 'post',
    data
  })
}

// 获取穿搭方案细节补充
export function followUpOutfit(data) {
  return request({
    url: OUTFIT_API.FOLLOW_UP,
    method: 'post',
    data
  })
}

// 评价穿搭
export function evaluateOutfit(data) {
  return request({
    url: OUTFIT_API.EVALUATE,
    method: 'post',
    data
  })
}

// 获取穿搭历史记录
export function getOutfitHistory(userId) {
  return request({
    url: OUTFIT_API.HISTORY,
    method: 'get',
    params: { userId }
  })
} 