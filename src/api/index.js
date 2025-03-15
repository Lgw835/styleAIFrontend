/**
 * API统一导出文件
 */

// 修改API基础URL
const baseURL = "http://localhost:7001"; // 而不是 192.168.199.1:9010 或 9011

// 或者使用环境变量
// const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:7001";

// 导出所有用户相关API
export * from './user'

// 导出所有穿搭相关API
export * from './outfit'

// 导出所有衣物相关API
export * from './wardrobe'

// 导出所有虚拟试穿相关API
export * from './virtualTry'

// 导出所有API URLs配置
export * from './config'

// 可以继续添加其他API模块的导出 