const { createProxyMiddleware } = require('http-proxy-middleware');

// 创建一个Express应用
const express = require('express');
const app = express();

// 设置代理
const proxy = createProxyMiddleware({
  target: 'http://192.168.10.158:7001',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '' // 移除 /api 前缀
  },
  timeout: 60000, // 60秒超时
  proxyTimeout: 60000,
  onError: (err, req, res) => {
    console.error('代理错误:', err);
    res.writeHead(500, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
      error: {
        message: err.message,
        code: err.code
      }
    }));
  }
});

// 使用代理中间件
app.use('*', proxy);

// 导出处理函数
module.exports = (req, res) => {
  return app(req, res);
}; 