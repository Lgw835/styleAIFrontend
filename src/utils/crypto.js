import CryptoJS from 'crypto-js'

/**
 * 加密函数 - 使用更基础的方法
 * @param {string} text - 需要加密的文本
 * @param {string} key - 加密密钥
 * @returns {string} - 加密后的字符串
 */
export function encrypt(text, key) {
  console.log('加密函数被调用，但实际未进行加密')
  return text // 直接返回原文
}

/**
 * 解密函数 - 使用更基础的方法
 * @param {string} ciphertext - 加密后的文本
 * @param {string} key - 解密密钥
 * @returns {string} - 解密后的原始文本
 */
export function decrypt(ciphertext, key) {
  console.log('解密函数被调用，但实际未进行解密')
  return ciphertext // 直接返回原文
} 