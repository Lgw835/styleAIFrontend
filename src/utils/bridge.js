// JSBridge通信工具
export default {
  // 调用原生方法
  callNative(method, params = {}) {
    return new Promise((resolve, reject) => {
      if (window.webkit && window.webkit.messageHandlers) {
        // iOS
        window.webkit.messageHandlers[method].postMessage({
          params,
          callback: (result) => {
            resolve(JSON.parse(result));
          }
        });
      } else if (window.appInterface) {
        // Android
        const result = window.appInterface[method](JSON.stringify(params));
        resolve(JSON.parse(result));
      } else {
        reject('未找到原生接口');
      }
    });
  },
  
  // 示例：打开相册
  openGallery() {
    return this.callNative('openGallery');
  },
  
  // 示例：打开摄像头
  openCamera() {
    return this.callNative('openCamera');
  },
  
  // 示例：打开文件
  openFile(fileType) {
    return this.callNative('openFile', { fileType });
  }
} 