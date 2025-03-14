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
  RESET_PASSWORD: '/userApi/password/reset',    // 重置密码
  LOGIN_SMS: '/userApi/login/sms',      // 短信登录
  INFO_UPDATE: '/userApi/info/update'  // 修改用户信息
}

// 穿搭相关接口
export const OUTFIT_API = {
  RECOMMEND: '/outfitApi/recommend',      // 穿搭推荐
  DAILY_MATCH: '/outfitApi/daily-match',  // 每日一搭
  UPLOAD: '/outfitApi/upload',            // 上传穿搭照片
  RECORD_LIST: '/outfitApi/records',      // 获取穿搭记录列表
  RECORD_DETAIL: '/outfitApi/record/',    // 获取穿搭记录详情，使用时需要拼接ID
  SAVE: '/outfitApi/save',                // 保存穿搭
  SAVE_COMMENT: '/outfitApi/saveOutfitComment', // 保存穿搭评论
  GENERATE_IMAGE: '/outfitApi/generateImage',   // 生成图片
  FOLLOW_UP: '/outfitApi/followUp',       // 穿搭对话修改
  EVALUATE: '/outfitApi/evaluateOutfit',  // AI评论穿搭
  GET_RECOMMENDS: '/outfitApi/getOutfitRecommends', // 查看用户的穿搭推荐记录
  GET_EVALUATIONS: '/outfitApi/getFashionEvaluations' // 获取AI评论
}

// 衣物相关接口
export const WARDROBE_API = {
  LIST: '/wardrobeApi/clothes',           // 获取衣物列表
  ALL_CLOTHES: '/wardrobeApi/clothes/',   // 获取用户全部衣物，使用时需要拼接userId
  DETAIL: '/wardrobeApi/clothes/',        // 获取衣物详情，使用时需要拼接ID
  ADD: '/wardrobeApi/clothes',            // 添加衣物
  UPDATE: '/wardrobeApi/clothes',         // 更新衣物
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

// 虚拟试穿相关接口
export const VIRTUAL_TRY_API = {
  TRY_ON: '/virtualTryApi/try-on',        // 虚拟试穿
  RECORDS: '/virtualTryApi/records/',     // 获取试穿记录，使用时需要拼接userId
  DELETE_RECORD: '/virtualTryApi/records/' // 删除试穿记录，使用时需要拼接id
}

// 其他接口...
export const OTHER_API = {
  WEATHER: '/otherApi/weather',           // 获取天气信息
  UPLOAD_FILE: '/otherApi/upload'         // 通用文件上传
}

// 需要新增的社区广场接口配置
export const SQUARE_API = {
  POSTS: '/squareApi/posts',                   // 获取帖子列表
  POST_VIEW: '/squareApi/post/view/',          // 添加访问记录，使用时需要拼接postId
  POST_CREATE: '/squareApi/post/create',       // 发布帖子
  LIKE: '/squareApi/like',                     // 点赞帖子
  UNLIKE: '/squareApi/unlike',                 // 取消点赞
  COMMENT_CREATE: '/squareApi/comment/create', // 发布评论
  POST_COMMENTS: '/squareApi/post/getComments/', // 获取评论列表，使用时需要拼接articleId
  MY_POSTS: '/squareApi/myPosts/',             // 获取用户帖子列表，使用时需要拼接userId
  POST_DELETE: '/squareApi/post/',             // 删除帖子，使用时需要拼接postId
  COMMENT_DELETE: '/squareApi/comment/'        // 删除评论，使用时需要拼接commentId
}

// 需要新增的日程接口配置
export const SCHEDULE_API = {
  CREATE: '/scheduleApi/create',               // 创建日程
  UPDATE: '/scheduleApi/update',               // 更新日程
  RECORD_WEATHER: '/scheduleApi/recordWeather',// 记录天气信息
  TODAY: '/scheduleApi/today',                 // 获取今日日程
  DATE: '/scheduleApi/date',                   // 获取指定日期的日程
  DELETE: '/scheduleApi/delete/'               // 删除日程，使用时需要拼接scheduleId
} 