/**
 * API URL配置常量
 * 集中管理所有接口地址
 */

// API 服务路径配置
import { ref } from 'vue'

// 从环境变量获取基础 URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001'

// 服务前缀
export const SERVICE_PREFIX = {
  DRESS: '/style-ai-dress-aggregation-service',
  USER: '/style-ai-user-aggregation-service'
}

// 微服务名称常量
const USER_SERVICE = 'style-ai-user-aggregation-service'
const DRESS_SERVICE = 'style-ai-dress-aggregation-service'

// 用户相关接口
export const USER_API = {
  SMS_CODE: `/${USER_SERVICE}/userApi/sms/code`,          // 获取短信验证码
  REGISTER: `/${USER_SERVICE}/userApi/register`,          // 用户注册
  LOGIN: `/${USER_SERVICE}/userApi/login`,                // 用户登录
  LOGIN_PHONE: `/${USER_SERVICE}/userApi/login/sms`,      // 手机验证码登录
  PROFILE: `/${USER_SERVICE}/userApi/profile`,            // 提交用户信息/用户画像
  UPDATE_PASSWORD: `/${USER_SERVICE}/userApi/password/update`, // 修改密码
  RESET_PASSWORD: `/${USER_SERVICE}/userApi/password/reset`,   // 重置密码
  LOGIN_SMS: `/${USER_SERVICE}/userApi/login/sms`,        // 短信登录
  INFO_UPDATE: `/${USER_SERVICE}/userApi/info/update`,     // 修改用户信息
  RECORD_WEATHER: `${SERVICE_PREFIX.USER}/scheduleApi/recordWeather`
  // 注意：用户画像使用 PROFILE 接口
}

// 穿搭相关接口
export const OUTFIT_API = {
  RECOMMEND: `${SERVICE_PREFIX.DRESS}/outfitApi/recommend`,      // 穿搭推荐
  DAILY_MATCH: `/${DRESS_SERVICE}/outfitApi/daily`,        // 每日一搭
  UPLOAD: `/${DRESS_SERVICE}/outfitApi/upload`,            // 上传穿搭照片
  RECORD_LIST: `/${DRESS_SERVICE}/outfitApi/records`,      // 获取穿搭记录列表
  RECORD_DETAIL: `/${DRESS_SERVICE}/outfitApi/record/`,    // 获取穿搭记录详情，使用时需要拼接ID
  SAVE: `${SERVICE_PREFIX.DRESS}/outfitApi/save`,                // 保存穿搭
  SAVE_COMMENT: `${SERVICE_PREFIX.DRESS}/outfitApi/saveOutfitComment`,     // 保存穿搭评论
  GENERATE_IMAGE: `${SERVICE_PREFIX.DRESS}/outfitApi/generateImage`,  // 生成图片
  FOLLOW_UP: `${SERVICE_PREFIX.DRESS}/outfitApi/followUp`,       // 穿搭对话修改
  EVALUATE: `${SERVICE_PREFIX.DRESS}/outfitApi/evaluate`,
  GET_RECOMMENDS: `/${DRESS_SERVICE}/outfitApi/recommends`, // 查看用户的穿搭推荐记录
  GET_EVALUATIONS: `/${DRESS_SERVICE}/outfitApi/getFashionEvaluations`, // 获取AI评论
  HISTORY: `${SERVICE_PREFIX.DRESS}/outfitApi/history`,
  RECORDS: `${SERVICE_PREFIX.DRESS}/outfitApi/records`,
  DETAIL: `${SERVICE_PREFIX.DRESS}/outfitApi/detail/`,
  DELETE: `${SERVICE_PREFIX.DRESS}/outfitApi/delete/`
}

// 衣物相关接口
export const WARDROBE_API = {
  LIST: `/${DRESS_SERVICE}/wardrobeApi/clothes`,           // 获取衣物列表
  ALL_CLOTHES: `/${DRESS_SERVICE}/wardrobeApi/clothes/`,   // 获取用户全部衣物，使用时需要拼接userId
  DETAIL: `/${DRESS_SERVICE}/wardrobeApi/clothes/`,        // 获取衣物详情，使用时需要拼接ID
  ADD: `/${DRESS_SERVICE}/wardrobeApi/clothes`,            // 添加衣物
  UPDATE: `/${DRESS_SERVICE}/wardrobeApi/clothes`,         // 更新衣物
  DELETE: `/${DRESS_SERVICE}/wardrobeApi/clothes/`,        // 删除衣物，使用时需要拼接ID
  UPLOAD_IMAGE: `/${DRESS_SERVICE}/wardrobeApi/upload`     // 上传衣物图片
}

// 社区相关接口
export const COMMUNITY_API = {
  POSTS: `/${USER_SERVICE}/communityApi/posts`,           // 获取帖子列表
  POST_DETAIL: `/${USER_SERVICE}/communityApi/posts/`,    // 获取帖子详情，使用时需要拼接ID
  CREATE_POST: `/${USER_SERVICE}/communityApi/posts`,     // 创建帖子
  COMMENTS: `/${USER_SERVICE}/communityApi/comments`,     // 获取评论列表
  ADD_COMMENT: `/${USER_SERVICE}/communityApi/comments`   // 添加评论
}

// 虚拟试穿相关接口
export const VIRTUAL_TRY_API = {
  TRY_ON: `/${DRESS_SERVICE}/virtualTryApi/try-on`,       // 虚拟试穿
  RECORDS: `/${DRESS_SERVICE}/virtualTryApi/records/`,    // 获取试穿记录，使用时需要拼接userId
  DELETE_RECORD: `/${DRESS_SERVICE}/virtualTryApi/records/` // 删除试穿记录，使用时需要拼接id
}

// 其他接口...
export const OTHER_API = {
  WEATHER: `/${USER_SERVICE}/otherApi/weather`,           // 获取天气信息
  UPLOAD_FILE: `/${USER_SERVICE}/otherApi/upload`         // 通用文件上传
}

// 需要新增的社区广场接口配置
export const SQUARE_API = {
  POSTS: `/${USER_SERVICE}/squareApi/posts`,                   // 获取帖子列表
  POST_VIEW: `/${USER_SERVICE}/squareApi/post/view/`,          // 添加访问记录，使用时需要拼接postId
  POST_CREATE: `/${USER_SERVICE}/squareApi/post/create`,       // 发布帖子
  LIKE: `/${USER_SERVICE}/squareApi/like`,                     // 点赞帖子
  UNLIKE: `/${USER_SERVICE}/squareApi/unlike`,                 // 取消点赞
  COMMENT_CREATE: `/${USER_SERVICE}/squareApi/comment/create`, // 发布评论
  POST_COMMENTS: `/${USER_SERVICE}/squareApi/post/getComments/`, // 获取评论列表，使用时需要拼接articleId
  MY_POSTS: `/${USER_SERVICE}/squareApi/myPosts/`,             // 获取用户帖子列表，使用时需要拼接userId
  POST_DELETE: `/${USER_SERVICE}/squareApi/post/`,             // 删除帖子，使用时需要拼接postId
  COMMENT_DELETE: `/${USER_SERVICE}/squareApi/comment/`        // 删除评论，使用时需要拼接commentId
}

// 需要新增的日程接口配置
export const SCHEDULE_API = {
  CREATE: `/${USER_SERVICE}/scheduleApi/create`,               // 创建日程
  UPDATE: `/${USER_SERVICE}/scheduleApi/update`,               // 更新日程
  RECORD_WEATHER: `/${USER_SERVICE}/scheduleApi/recordWeather`,// 记录天气信息
  TODAY: `/${USER_SERVICE}/scheduleApi/today`,                 // 获取今日日程
  DATE: `/${USER_SERVICE}/scheduleApi/date`,                   // 获取指定日期的日程
  DELETE: `/${USER_SERVICE}/scheduleApi/delete/`               // 删除日程，使用时需要拼接scheduleId
}

// 检查API配置是否正确
export const OUTFIT_API_CHECKED = API_BASE_URL + '/style-ai-dress-aggregation-service/outfitApi';
// 或者固定路径
// export const OUTFIT_API = 'http://localhost:7001/style-ai-dress-aggregation-service/outfitApi'; 