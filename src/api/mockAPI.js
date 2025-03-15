/**
 * 动态模拟穿搭评价接口服务
 */

// 模拟网络延迟
const simulateNetworkDelay = (minMs = 800, maxMs = 2500) => {
  const delay = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// 生成随机分数，限制在5-9.5之间，保留一位小数
const generateRandomScore = () => {
  return (Math.floor(Math.random() * 45) + 50) / 10;
};

// 生成随机文本段落
const generateRandomDescription = () => {
  const descriptions = [
    '这套穿搭整体风格协调，色彩搭配自然和谐。上衣选择得当，与下装形成良好的视觉比例，整体给人清爽利落的感觉。',
    '整体风格统一，色彩搭配大方得体，展现了不错的时尚感。衣物的版型和身材匹配度高，营造出和谐的整体效果。',
    '这套服装搭配展现了简约而不简单的风格特点，干净利落的线条与柔和的色调相得益彰，彰显个人气质。',
    '穿搭整体色调统一，层次感丰富，单品之间的搭配比例恰当，展现出协调的整体观感和不错的审美品位。'
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

// 生成随机优点
const generateRandomAdvantages = () => {
  const advantagesList = [
    '色彩搭配和谐，整体风格统一',
    '服装尺寸合适，展现良好的身材比例',
    '造型简洁利落，展现活力',
    '单品选择得当，整体协调自然',
    '材质搭配考究，质感表现突出'
  ];
  
  // 随机选择2-3个优点
  const count = Math.floor(Math.random() * 2) + 2;
  const shuffled = [...advantagesList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).join('；');
};

// 生成随机缺点
const generateRandomDisadvantages = () => {
  const disadvantagesList = [
    '配饰缺乏亮点，层次感不足',
    '整体风格较为安全，个性不足',
    '颜色偏暗沉，缺少亮点',
    '造型略显刻板，个性表达不足',
    '单色系搭配略显单调，缺乏变化'
  ];
  
  // 随机选择1-2个缺点
  const count = Math.floor(Math.random() * 2) + 1;
  const shuffled = [...disadvantagesList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).join('；');
};

// 生成随机建议
const generateRandomSuggestions = () => {
  const suggestionsList = [
    '可以添加一些亮色点缀，如鲜艳的领带或口袋巾',
    '尝试搭配质感配饰，提升整体档次',
    '可以考虑在单品上选择更有设计感的款式',
    '建议增加一些配饰，如项链或胸针增加亮点',
    '可以尝试戴一顶棒球帽或选择亮色系的运动鞋来增加层次感'
  ];
  
  // 随机选择2-3个建议
  const count = Math.floor(Math.random() * 2) + 2;
  const shuffled = [...suggestionsList].sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, count).join('；');
};

// 生成随机概要
const generateRandomSummary = (score) => {
  if (score >= 9) {
    return '穿搭风格突出，整体效果优秀，细节处理精致';
  } else if (score >= 8) {
    return '整体搭配时尚有型，色彩搭配和谐，但细节处理可以更精致';
  } else if (score >= 7) {
    return '基本款式搭配合理，整体协调，但风格略显保守';
  } else {
    return '搭配基础合理，但缺乏亮点，风格有提升空间';
  }
};

// 模拟穿搭API服务
export const mockOutfitAPI = {
  // 模拟上传图片
  async uploadImage(file, params = {}) {
    console.log('模拟上传图片', file, params);
    
    // 模拟网络延迟
    await simulateNetworkDelay(1000, 2000);
    
    // 从文件中获取图片URL或使用mock URL
    let imageUrl = '';
    if (file instanceof File) {
      imageUrl = URL.createObjectURL(file);
    } else if (typeof file === 'string') {
      imageUrl = file;
    } else {
      imageUrl = 'https://via.placeholder.com/400x600?text=Outfit';
    }
    
    // 模拟上传响应
    return {
      success: true,
      code: 200,
      message: '上传成功',
      imageUrl: imageUrl,
      uploadTime: new Date().toISOString()
    };
  },
  
  // 模拟评价穿搭
  async evaluateOutfit(params = {}) {
    console.log('模拟评价穿搭', params);
    
    // 模拟网络延迟
    await simulateNetworkDelay(2000, 4000);
    
    // 生成随机评分
    const score = generateRandomScore();
    
    // 生成动态评价数据
    return {
      success: true,
      code: 200,
      message: '评价成功',
      score: score,
      description: generateRandomDescription(),
      advantages: generateRandomAdvantages(),
      disadvantages: generateRandomDisadvantages(),
      suggestions: generateRandomSuggestions(),
      summary: generateRandomSummary(score),
      evaluationTime: new Date().toISOString()
    };
  }
}; 