import request from '@/utils/request'
import { OUTFIT_API } from './config'

// 获取用户穿搭记录列表
export function getOutfitRecords(userId) {
  return request({
    url: OUTFIT_API.RECORDS,
    method: 'get',
    params: { userId }
  })
}

// 获取穿搭记录详情
export function getOutfitDetail(outfitId) {
  return request({
    url: OUTFIT_API.DETAIL + outfitId,
    method: 'get'
  })
}

// 保存穿搭方案
export function saveOutfit(data) {
  return request({
    url: OUTFIT_API.SAVE,
    method: 'post',
    data
  })
}

// 保存穿搭评论
export function saveOutfitComment(data) {
  return request({
    url: OUTFIT_API.SAVE_COMMENT,
    method: 'post',
    data
  })
}

// 删除穿搭记录
export function deleteOutfitRecord(outfitId) {
  return request({
    url: OUTFIT_API.DELETE + outfitId,
    method: 'delete'
  })
} 