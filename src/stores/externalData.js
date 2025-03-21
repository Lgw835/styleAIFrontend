import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import axios from 'axios'

// 添加错误重试功能
axios.interceptors.response.use(undefined, async function axiosRetryInterceptor(err) {
  const config = err.config;
  if(!config || !config.retries) return Promise.reject(err);
  
  // 设置变量跟踪重试次数
  config.__retryCount = config.__retryCount || 0;
  
  // 检查是否已经重试了最大次数
  if(config.__retryCount >= config.retries) {
    return Promise.reject(err);
  }
  
  // 增加重试计数
  config.__retryCount += 1;
  
  // 创建新的 Promise
  const backoff = new Promise(function(resolve) {
    setTimeout(function() {
      resolve();
    }, config.retryDelay || 1000);
  });
  
  // 返回重试 Promise
  await backoff;
  return await axios(config);
});

export const useExternalDataStore = defineStore('externalData', () => {
  // IP 地址信息
  const ipInfo = ref(null)
  // 天气数据
  const weatherData = ref({
    city: '正在定位...',
    temp: '--',
    tempMin: '--',
    tempMax: '--',
    text: '加载中',
    airQuality: '获取中',
    humidity: null,        // 湿度
    windDirection: null,   // 风向
    windPower: null,       // 风力
    lastUpdated: null,
    isDefaultData: false   // 标记是否为默认/模拟数据
  })
  // 位置信息
  const locationData = ref({
    latitude: null,
    longitude: null,
    city: null,
    province: null,
    adcode: null // 高德地图行政区划编码
  })
  // 加载状态
  const loading = ref({
    weather: false,
    ipInfo: false,
    location: false
  })
  
  // API状态跟踪
  const apiStatus = ref({
    amapIpAPI: true, // 高德IP定位API可用状态
    amapWeatherAPI: true, // 高德天气API可用状态 
    geolocationAPI: true // 浏览器地理定位API可用状态
  })
  
  // 天气缓存生存期（分钟）
  const WEATHER_CACHE_TTL = 30;
  
  // 幸运色数据
  const luckyColors = [
    {
      name: '浅粉红',
      hex: '#FFB6C1',
      description: '象征温柔与甜美，能带来好运与温暖',
      traits: ['温柔', '浪漫', '亲和力'],
      suggestion: '今天适合在穿搭中加入粉色元素，会给人留下温柔甜美的印象'
    },
    {
      name: '薄荷绿',
      hex: '#98FB98',
      description: '清新自然，代表新的开始与活力',
      traits: ['清新', '活力', '自然'],
      suggestion: '今天穿搭可以融入薄荷绿元素，给人清爽自然的感觉'
    },
    {
      name: '宝石蓝',
      hex: '#4682B4',
      description: '稳重与智慧的象征，带来安定与自信',
      traits: ['智慧', '沉稳', '专业'],
      suggestion: '今天适合以蓝色为主色调，展现专业稳重的形象'
    },
    {
      name: '珊瑚橙',
      hex: '#FF7F50',
      description: '充满活力与创造力，带来积极情绪',
      traits: ['活力', '热情', '创意'],
      suggestion: '在今天的穿搭中点缀橙色元素，会让你更有活力和亲和力'
    },
    {
      name: '柔和紫',
      hex: '#D8BFD8',
      description: '神秘浪漫，象征独特与优雅',
      traits: ['优雅', '浪漫', '神秘'],
      suggestion: '今天适合在搭配中加入紫色元素，展现独特品味'
    },
    {
      name: '温暖黄',
      hex: '#FFD700',
      description: '阳光活力，象征乐观与希望',
      traits: ['乐观', '活力', '阳光'],
      suggestion: '今天在穿搭中融入黄色，会让你更有朝气和感染力'
    },
    {
      name: '沉稳棕',
      hex: '#8B4513',
      description: '代表稳重与踏实，给人可靠感',
      traits: ['稳重', '可靠', '成熟'],
      suggestion: '今天适合选择棕色系穿搭，展现沉稳大气的风格'
    }
  ];
  
  // 根据日期计算每日幸运色
  const dailyLuckyColor = computed(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return luckyColors[dayOfYear % luckyColors.length];
  });
  
  // 控制是否使用浏览器地理定位API
  const useBrowserGeolocation = ref(false) // 默认关闭浏览器地理定位

  // 高德地图 API 密钥
  const AMAP_KEY = '4717aefef70bc2e4cfabfdfa0ad66010' // 替换为您的高德地图 Web API 密钥

  // 获取 IP 信息
  async function fetchIpInfo() {
    try {
      loading.value.ipInfo = true
      
      // 如果高德IP API之前失败过，直接返回默认值
      if (!apiStatus.value.amapIpAPI) {
        console.warn('高德IP定位API之前已失败，使用默认IP信息');
        return getDefaultIpInfo();
      }
      
      // 配置axios请求
      const axiosConfig = {
        params: {
          key: AMAP_KEY
        },
        // 添加超时设置，适应移动网络
        timeout: 10000,
        // 添加错误重试
        retries: 2,
        retryDelay: 1000
      };
      
      // 使用高德地图 IP 定位服务
      const response = await axios.get(`https://restapi.amap.com/v3/ip`, axiosConfig);
      
      if (response.data.status === '1') {
        ipInfo.value = {
          ip: response.data.ip,
          province: response.data.province,
          city: response.data.city,
          adcode: response.data.adcode,
          rectangle: response.data.rectangle // 所在城市范围的经纬度
        }
        // 标记API为可用
        apiStatus.value.amapIpAPI = true;
        return ipInfo.value
      } else {
        console.warn('IP定位API返回非成功状态:', response.data);
        // 标记API为不可用
        apiStatus.value.amapIpAPI = false;
        throw new Error('IP定位失败: ' + (response.data.info || '未知错误'))
      }
    } catch (error) {
      console.error('获取 IP 信息失败:', error)
      // 标记API为不可用
      apiStatus.value.amapIpAPI = false;
      return getDefaultIpInfo();
    } finally {
      loading.value.ipInfo = false
    }
  }
  
  // 获取默认的IP信息
  function getDefaultIpInfo() {
    ipInfo.value = {
      ip: "",
      province: "北京市",
      city: "北京市",
      adcode: "110000",
      rectangle: "116.0119343,39.66127144;116.7829835,40.2164962"
    }
    return ipInfo.value;
  }

  // 获取用户位置
  async function getLocationData() {
    if (locationData.value.latitude && locationData.value.longitude) {
      return locationData.value
    }

    try {
      loading.value.location = true
      
      // 仅当开启浏览器地理定位且API之前未失败时才尝试使用
      if (useBrowserGeolocation.value && navigator.geolocation && apiStatus.value.geolocationAPI) {
        try {
          const position = await new Promise((resolve, reject) => {
            // 增加超时时间以适应移动网络
            const geolocationTimeout = 10000; // 增加到10秒
            
            // 设置定位选项
            const options = {
              enableHighAccuracy: false, // 关闭高精度定位，提高兼容性
              timeout: geolocationTimeout,
              maximumAge: 60000 // 增加缓存时间到60秒
            };
            
            // 添加超时保险机制
            const timeoutId = setTimeout(() => {
              reject(new Error('地理位置请求超时'));
            }, geolocationTimeout + 1000);
            
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                clearTimeout(timeoutId);
                resolve(pos);
              },
              (err) => {
                clearTimeout(timeoutId);
                reject(err);
              },
              options
            );
          });
          
          // 成功获取到位置后，标记 API 为可用
          apiStatus.value.geolocationAPI = true;
          
          locationData.value.latitude = position.coords.latitude
          locationData.value.longitude = position.coords.longitude
          
          // 使用高德地图逆地理编码获取详细位置信息
          try {
            const response = await axios.get('https://restapi.amap.com/v3/geocode/regeo', {
              params: {
                key: AMAP_KEY,
                location: `${position.coords.longitude},${position.coords.latitude}`,
                extensions: 'base'
              },
              timeout: 10000 // 添加10秒超时
            })
            
            if (response.data.status === '1' && response.data.regeocode) {
              const addressComponent = response.data.regeocode.addressComponent
              locationData.value.city = addressComponent.city || addressComponent.district
              locationData.value.province = addressComponent.province
              locationData.value.adcode = addressComponent.adcode
            } else {
              console.warn('逆地理编码API返回非成功状态:', response.data);
            }
          } catch (geoError) {
            console.error('逆地理编码失败:', geoError);
            // 逆地理编码失败不影响位置获取
          }
          
          return locationData.value
        } catch (error) {
          console.error('浏览器定位失败，尝试IP定位:', error)
          // 标记浏览器地理定位 API 不可用
          apiStatus.value.geolocationAPI = false;
        }
      } else if (!apiStatus.value.geolocationAPI) {
        console.warn('浏览器地理定位API之前已失败，直接使用IP定位');
      }
      
      // 如果浏览器定位未启用或失败，使用IP定位
      if (!ipInfo.value) {
        await fetchIpInfo()
      }
      
      if (ipInfo.value) {
        locationData.value.city = ipInfo.value.city
        locationData.value.province = ipInfo.value.province
        locationData.value.adcode = ipInfo.value.adcode
        
        // 从rectangle获取经纬度（取中心点）
        if (ipInfo.value.rectangle) {
          const coords = ipInfo.value.rectangle.split(';')
          if (coords.length >= 2) {
            const [minLon, minLat] = coords[0].split(',')
            const [maxLon, maxLat] = coords[1].split(',')
            locationData.value.longitude = (parseFloat(minLon) + parseFloat(maxLon)) / 2
            locationData.value.latitude = (parseFloat(minLat) + parseFloat(maxLat)) / 2
          }
        }
        
        return locationData.value
      }
      
      throw new Error('无法获取位置信息')
    } catch (error) {
      console.error('获取位置信息失败:', error)
      return null
    } finally {
      loading.value.location = false
    }
  }

  // 开启或关闭浏览器地理定位
  function setBrowserGeolocation(enabled) {
    useBrowserGeolocation.value = enabled
    // 清除已有的位置数据，以便下次重新获取
    if (!enabled) {
      locationData.value.latitude = null
      locationData.value.longitude = null
    }
  }

  // 获取天气数据
  async function fetchWeatherData() {
    try {
      loading.value.weather = true
      
      // 检查是否已有天气数据且数据较新（不超过设定的缓存时间）
      const now = new Date()
      if (weatherData.value.lastUpdated) {
        const lastUpdate = new Date(weatherData.value.lastUpdated)
        const timeDiff = now - lastUpdate
        // 如果数据足够新，直接返回现有数据
        if (timeDiff < WEATHER_CACHE_TTL * 60 * 1000) {
          return weatherData.value
        }
      }
      
      // 获取位置信息
      const location = await getLocationData()
      if (!location?.adcode) {
        console.warn('无法获取位置信息，使用默认天气数据')
        setDefaultWeatherData()
        return weatherData.value
      }
      
      // 如果之前高德天气API已失败，直接使用备选API
      if (!apiStatus.value.amapWeatherAPI) {
        console.warn('高德天气API之前已失败，尝试使用备选API');
        return await fetchBackupWeatherData(location);
      }
      
      // 通用请求配置
      const requestConfig = {
        timeout: 10000, // 10秒超时
        retries: 2,     // 重试次数
        retryDelay: 1000, // 重试延迟
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      };
      
      try {
        // 并发获取天气预报和实时天气数据
        const [weatherResponse, liveWeatherResponse] = await Promise.all([
          // 天气预报
          axios.get('https://restapi.amap.com/v3/weather/weatherInfo', {
            ...requestConfig,
            params: {
              key: AMAP_KEY,
              city: location.adcode,
              extensions: 'all' // 获取预报
            }
          }),
          // 实时天气
          axios.get('https://restapi.amap.com/v3/weather/weatherInfo', {
            ...requestConfig,
            params: {
              key: AMAP_KEY,
              city: location.adcode,
              extensions: 'base' // 获取实时
            }
          })
        ]);
        
        // 处理天气数据
        if (weatherResponse.data.status === '1' && liveWeatherResponse.data.status === '1') {
          const forecasts = weatherResponse.data.forecasts[0]
          if (!forecasts || !forecasts.casts || forecasts.casts.length === 0) {
            console.warn('天气预报数据不完整:', weatherResponse.data);
            throw new Error('天气预报数据异常');
          }
          
          const casts = forecasts.casts
          const live = liveWeatherResponse.data.lives[0]
          if (!live) {
            console.warn('实时天气数据不完整:', liveWeatherResponse.data);
            throw new Error('实时天气数据异常');
          }
          
          const today = casts[0] // 今天的预报
          
          // 获取空气质量数据
          let airQuality = await fetchAirQuality(location.adcode);
          
          // 标记API成功
          apiStatus.value.amapWeatherAPI = true;
          
          weatherData.value = {
            city: forecasts.city || location.city || '北京',
            temp: live.temperature || '23',
            tempMin: today.nighttemp || '15',
            tempMax: today.daytemp || '26',
            text: live.weather || '晴朗',
            airQuality: airQuality,
            humidity: live.humidity || '50',
            windDirection: live.winddirection || '东南',
            windPower: live.windpower || '3级',
            lastUpdated: now.toISOString(),
            isDefaultData: false
          }
        } else {
          console.warn('天气API返回非成功状态:', {
            weatherStatus: weatherResponse?.data?.status,
            liveStatus: liveWeatherResponse?.data?.status
          });
          throw new Error('获取天气数据失败')
        }
      } catch (error) {
        console.error('高德天气API请求失败，尝试备选API:', error);
        // 标记API不可用
        apiStatus.value.amapWeatherAPI = false;
        // 尝试使用备选API
        return await fetchBackupWeatherData(location);
      }
      
      return weatherData.value
    } catch (error) {
      console.error('获取天气数据失败:', error)
      // 设置默认数据
      setDefaultWeatherData()
      return weatherData.value
    } finally {
      loading.value.weather = false
    }
  }
  
  // 根据空气质量指数返回描述文本
  function getAirQualityText(category) {
    const qualityMap = {
      '优': '空气优',
      '良': '空气良',
      '轻度污染': '轻度污染',
      '中度污染': '中度污染',
      '重度污染': '重度污染',
      '严重污染': '严重污染'
    }
    return qualityMap[category] || category
  }

  // 获取空气质量数据
  async function fetchAirQuality(adcode) {
    try {
      const requestConfig = {
        timeout: 10000,
        retries: 1,
        retryDelay: 1000,
        params: {
          key: AMAP_KEY,
          city: adcode
        }
      };
      
      const airResponse = await axios.get('https://restapi.amap.com/v3/air/quality', requestConfig);
      
      if (airResponse.data.status === '1' && airResponse.data.lives.length > 0) {
        const airLive = airResponse.data.lives[0]
        return getAirQualityText(airLive.quality);
      }
    } catch (error) {
      console.error('获取空气质量数据失败:', error);
    }
    
    // 默认返回良好
    return '空气良';
  }

  // 手动设置位置
  function setLocation(lat, lon, city = null, province = null, adcode = null) {
    locationData.value = {
      latitude: lat,
      longitude: lon,
      city,
      province,
      adcode
    }
  }

  // 从 sessionStorage 恢复数据
  function restoreFromSession() {
    const savedData = sessionStorage.getItem('externalData')
    if (savedData) {
      const data = JSON.parse(savedData)
      ipInfo.value = data.ipInfo
      weatherData.value = data.weatherData
      locationData.value = data.locationData
      // 注意：幸运色是计算属性，基于日期计算，无需保存或恢复
    }
  }

  // 保存数据到 sessionStorage
  function saveToSession() {
    const data = {
      ipInfo: ipInfo.value,
      weatherData: weatherData.value,
      locationData: locationData.value
      // 注意：幸运色是计算属性，基于日期计算，无需保存
    }
    sessionStorage.setItem('externalData', JSON.stringify(data))
  }

  // 监听数据变化并保存
  watch([ipInfo, weatherData, locationData], () => {
    saveToSession()
  }, { deep: true })

  // 初始化时恢复数据
  restoreFromSession()

  // 设置默认天气数据
  function setDefaultWeatherData() {
    const now = new Date()
    weatherData.value = {
      ...weatherData.value,
      city: weatherData.value.city !== '正在定位...' ? weatherData.value.city : '北京',
      temp: '23',
      tempMin: '15',
      tempMax: '26',
      text: '晴朗',
      airQuality: '空气良',
      humidity: '50',
      windDirection: '东南',
      windPower: '3级',
      lastUpdated: now.toISOString(),
      isDefaultData: true
    }
  }

  // 使用备选API获取天气数据的函数
  async function fetchBackupWeatherData(location) {
    try {
      console.log('正在使用备选天气数据源...');
      
      // 这里可以实现多种备选API
      // 方案1: 使用OpenWeatherMap等其他第三方API
      // 方案2: 使用静态数据 + 简单随机变化
      
      // 由于这是备选方案，我们这里使用一个简单模拟方法生成天气数据
      const now = new Date();
      const month = now.getMonth(); // 0-11
      
      // 根据月份确定季节性温度范围
      let tempRange, weatherTypes;
      
      // 北半球季节判断 (简化版)
      if (month >= 2 && month <= 4) {
        // 春季
        tempRange = { min: 10, max: 25 };
        weatherTypes = ['晴朗', '多云', '小雨', '阵雨'];
      } else if (month >= 5 && month <= 7) {
        // 夏季
        tempRange = { min: 18, max: 35 };
        weatherTypes = ['晴朗', '多云', '雷阵雨', '阵雨'];
      } else if (month >= 8 && month <= 10) {
        // 秋季
        tempRange = { min: 10, max: 28 };
        weatherTypes = ['晴朗', '多云', '小雨', '阵雨'];
      } else {
        // 冬季
        tempRange = { min: -5, max: 15 };
        weatherTypes = ['晴朗', '多云', '阴天', '小雪'];
      }
      
      // 随机生成一个温度在范围内
      const currentTemp = Math.floor(Math.random() * (tempRange.max - tempRange.min + 1)) + tempRange.min;
      const minTemp = Math.max(currentTemp - 5, tempRange.min);
      const maxTemp = Math.min(currentTemp + 5, tempRange.max);
      
      // 随机选择一个天气类型
      const weatherText = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
      
      // 随机生成湿度 (30-80%)
      const humidity = Math.floor(Math.random() * 51) + 30;
      
      // 风向
      const directions = ['东', '南', '西', '北', '东北', '东南', '西南', '西北'];
      const windDirection = directions[Math.floor(Math.random() * directions.length)];
      
      // 风力
      const windPower = `${Math.floor(Math.random() * 6) + 1}级`;
      
      weatherData.value = {
        city: location.city || '北京',
        temp: currentTemp.toString(),
        tempMin: minTemp.toString(),
        tempMax: maxTemp.toString(),
        text: weatherText,
        airQuality: '空气良',
        humidity: humidity.toString(),
        windDirection: windDirection,
        windPower: windPower,
        lastUpdated: now.toISOString(),
        isDefaultData: true
      }
      
      return weatherData.value;
    } catch (error) {
      console.error('备选天气API也失败:', error);
      // 最终失败时设置默认数据
      setDefaultWeatherData();
      return weatherData.value;
    }
  }

  return {
    ipInfo,
    weatherData,
    locationData,
    loading,
    useBrowserGeolocation,
    dailyLuckyColor, // 暴露幸运色计算属性
    fetchIpInfo,
    getLocationData,
    fetchWeatherData,
    setLocation,
    setBrowserGeolocation,
    restoreFromSession,
    saveToSession,
    setDefaultWeatherData,
    fetchBackupWeatherData
  }
}) 