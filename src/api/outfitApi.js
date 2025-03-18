import axios from 'axios'

// 基础 API 地址
const API_BASE_URL = '/api/v1'

// 获取用户穿搭记录列表
export const getUserOutfitRecords = async (userId, page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/outfit-records`, {
      params: { 
        userId, 
        page, 
        size 
      }
    })
    return response.data
  } catch (error) {
    console.error('获取穿搭记录失败', error)
    throw error
  }
}

// 获取穿搭详情
export const getOutfitDetail = async (outfitId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/outfit-records/${outfitId}`)
    return response.data
  } catch (error) {
    console.error('获取穿搭详情失败', error)
    throw error
  }
}

// 删除穿搭记录
export const deleteOutfitRecord = async (outfitId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/outfit-records/${outfitId}`)
    return response.data
  } catch (error) {
    console.error('删除穿搭记录失败', error)
    throw error
  }
}

// 获取穿搭评价
export const getOutfitEvaluation = async (outfitId, userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/outfit-evaluations/${outfitId}`, {
      params: { userId }
    })
    return response.data
  } catch (error) {
    console.error('获取穿搭评价失败', error)
    throw error
  }
}

// 提交穿搭评价
export const submitOutfitEvaluation = async (evaluationData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/outfit-evaluations`, evaluationData)
    return response.data
  } catch (error) {
    console.error('提交穿搭评价失败', error)
    throw error
  }
} 