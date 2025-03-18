import request from '@/utils/request'
import { SQUARE_API } from './config'

/**
 * 获取广场帖子列表
 * @param {Object} data - 请求参数
 * @param {string} data.userId - 用户ID（必传）
 * @param {number} data.mode - 模式（1=推荐模式，2=关注模式）
 * @param {string} [data.keyword] - 搜索关键词（可选）
 * @param {string} [data.tag] - 标签筛选（可选）
 * @param {number} data.page - 页码，从0开始
 * @param {number} data.size - 每页条数，默认5
 * @returns {Promise}
 */
export function getPosts(data) {
  return request({
    url: SQUARE_API.POSTS,
    method: 'post',
    data: {
      userId: data.userId,
      mode: data.mode,
      keyword: data.keyword || '',
      tag: data.tag || '',
      page: data.page || 0,
      size: data.size || 5
    }
  })
}

/**
 * 获取帖子详情
 * @param {string} postId - 帖子ID
 * @param {string} userId - 用户ID
 * @returns {Promise}
 */
export function getPostDetail(postId, userId) {
  return request({
    url: SQUARE_API.POST_DETAIL + postId,
    method: 'get',
    params: { userId }
  })
}

/**
 * 添加帖子浏览记录
 * @param {string} postId - 帖子ID
 * @param {string} userId - 用户ID
 * @returns {Promise}
 */
export function addPostView(postId, userId) {
  return request({
    url: SQUARE_API.POST_VIEW + postId,
    method: 'post',
    data: { userId }
  })
}

/**
 * 点赞帖子
 * @param {Object} data - 请求参数 {userId, postId}
 * @returns {Promise}
 */
export function likePost(data) {
  return request({
    url: SQUARE_API.LIKE,
    method: 'post',
    data
  })
}

/**
 * 取消点赞帖子
 * @param {Object} data - 请求参数 {userId, postId}
 * @returns {Promise}
 */
export function unlikePost(data) {
  return request({
    url: SQUARE_API.UNLIKE,
    method: 'post',
    data
  })
}

/**
 * 发布帖子
 * @param {Object} data - 帖子数据 {userId, content, hardLabel, softLabel, resourceUrls}
 * @returns {Promise}
 */
export function createPost(data) {
  return request({
    url: SQUARE_API.POST_CREATE,
    method: 'post',
    data
  })
}

/**
 * 获取帖子评论列表
 * @param {string} articleId - 帖子ID
 * @param {string} userId - 用户ID
 * @param {number} commentPage - 评论页码
 * @returns {Promise}
 */
export function getPostComments(articleId, userId, commentPage) {
  return request({
    url: SQUARE_API.POST_COMMENTS.replace('{articleId}', articleId),
    method: 'get',
    params: {
      userId: userId,
      commentPage: commentPage
    }
  })
}

/**
 * 发表评论
 * @param {Object} data - 评论数据 {userId, postId, content, parentCommentId}
 * @returns {Promise}
 */
export function createComment(data) {
  return request({
    url: SQUARE_API.COMMENT_CREATE,
    method: 'post',
    data
  })
}

/**
 * 获取用户所有帖子
 * @param {string} userId - 用户ID
 * @returns {Promise}
 */
export function getUserPosts(userId) {
  return request({
    url: SQUARE_API.MY_POSTS + userId,
    method: 'get'
  })
}

/**
 * 删除帖子
 * @param {string} postId - 帖子ID
 * @returns {Promise}
 */
export function deletePost(postId) {
  return request({
    url: SQUARE_API.POST_DELETE + postId,
    method: 'delete'
  })
}

/**
 * 删除评论
 * @param {string} commentId - 评论ID
 * @returns {Promise}
 */
export function deleteComment(commentId) {
  return request({
    url: SQUARE_API.COMMENT_DELETE + commentId,
    method: 'delete'
  })
}

/**
 * 获取单个帖子详情
 * @param {Object} params - 参数对象
 * @param {string} params.postId - 帖子ID
 * @param {string} params.userId - 用户ID
 * @returns {Promise}
 */
export const getPostById = (params) => {
  return request({
    url: SQUARE_API.GET_POST_DETAIL,
    method: 'get',
    params
  });
}; 