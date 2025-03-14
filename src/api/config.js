/**
 * API URL配置常量
 * 集中管理所有接口地址
 */

// 用户相关接口
export const USER_API = {
  SMS_CODE: '/userApi/sms/code',          // 获取短信验证码
  REGISTER: '/userApi/register',          // 用户注册
  LOGIN: '/userApi/login',                // 用户登录
  PROFILE: '/userApi/profile',            // 提交用户信息
  UPDATE_PASSWORD: '/userApi/password/update', // 修改密码
  RESET_PASSWORD: '/userApi/password/reset'    // 重置密码
}

// 穿搭相关接口
export const OUTFIT_API = {
  RECOMMEND: '/outfitApi/recommend',      // 穿搭推荐
  DAILY_MATCH: '/outfitApi/daily-match',  // 每日一搭
  UPLOAD: '/outfitApi/upload',            // 上传穿搭照片
  RECORD_LIST: '/outfitApi/records',      // 获取穿搭记录列表
  RECORD_DETAIL: '/outfitApi/record/'     // 获取穿搭记录详情，使用时需要拼接ID
}

// 衣物相关接口
export const WARDROBE_API = {
  LIST: '/wardrobeApi/clothes',           // 获取衣物列表
  DETAIL: '/wardrobeApi/clothes/',        // 获取衣物详情，使用时需要拼接ID
  ADD: '/wardrobeApi/clothes',            // 添加衣物
  UPDATE: '/wardrobeApi/clothes/',        // 更新衣物，使用时需要拼接ID
  DELETE: '/wardrobeApi/clothes/',        // 删除衣物，使用时需要拼接ID
  UPLOAD_IMAGE: '/wardrobeApi/upload'     // 上传衣物图片
}

// 社区相关接口
export const COMMUNITY_API = {
  POSTS: '/communityApi/posts',           // 获取帖子列表
  POST_DETAIL: '/communityApi/posts/',    // 获取帖子详情，使用时需要拼接ID
  CREATE_POST: '/communityApi/posts',     // 创建帖子
  COMMENTS: '/communityApi/comments',     // 获取评论列表
  ADD_COMMENT: '/communityApi/comments'   // 添加评论
}

// 其他接口...
export const OTHER_API = {
  WEATHER: '/otherApi/weather',           // 获取天气信息
  UPLOAD_FILE: '/otherApi/upload'         // 通用文件上传
} 