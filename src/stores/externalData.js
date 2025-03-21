import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import axios from 'axios'

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
    lastUpdated: null
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
      // 使用高德地图 IP 定位服务
      const response = await axios.get(`https://restapi.amap.com/v3/ip`, {
        params: {
          key: AMAP_KEY
        }
      })
      
      if (response.data.status === '1') {
        ipInfo.value = {
          ip: response.data.ip,
          province: response.data.province,
          city: response.data.city,
          adcode: response.data.adcode,
          rectangle: response.data.rectangle // 所在城市范围的经纬度
        }
        return ipInfo.value
      } else {
        throw new Error('IP定位失败')
      }
    } catch (error) {
      console.error('获取 IP 信息失败:', error)
      return null
    } finally {
      loading.value.ipInfo = false
    }
  }

  // 获取用户位置
  async function getLocationData() {
    if (locationData.value.latitude && locationData.value.longitude) {
      return locationData.value
    }

    try {
      loading.value.location = true
      
      // 仅当开启浏览器地理定位时才尝试使用
      if (useBrowserGeolocation.value && navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            })
          })
          
          locationData.value.latitude = position.coords.latitude
          locationData.value.longitude = position.coords.longitude
          
          // 使用高德地图逆地理编码获取详细位置信息
          const response = await axios.get('https://restapi.amap.com/v3/geocode/regeo', {
            params: {
              key: AMAP_KEY,
              location: `${position.coords.longitude},${position.coords.latitude}`,
              extensions: 'base'
            }
          })
          
          if (response.data.status === '1' && response.data.regeocode) {
            const addressComponent = response.data.regeocode.addressComponent
            locationData.value.city = addressComponent.city || addressComponent.district
            locationData.value.province = addressComponent.province
            locationData.value.adcode = addressComponent.adcode
          }
          
          return locationData.value
        } catch (error) {
          console.error('浏览器定位失败，尝试IP定位:', error)
          // 浏览器地理位置API失败，回退到IP定位
        }
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
      
      // 检查是否已有天气数据且数据较新（不超过30分钟）
      const now = new Date()
      if (weatherData.value.lastUpdated) {
        const lastUpdate = new Date(weatherData.value.lastUpdated)
        const timeDiff = now - lastUpdate
        // 如果不到30分钟，直接返回现有数据
        if (timeDiff < 30 * 60 * 1000) {
          return weatherData.value
        }
      }
      
      // 获取位置信息
      const location = await getLocationData()
      if (!location?.adcode) {
        throw new Error('无法获取位置信息')
      }
      
      // 使用高德天气API
      const weatherResponse = await axios.get('https://restapi.amap.com/v3/weather/weatherInfo', {
        params: {
          key: AMAP_KEY,
          city: location.adcode,
          extensions: 'all' // 获取预报
        }
      })
      
      // 获取实时天气数据
      const liveWeatherResponse = await axios.get('https://restapi.amap.com/v3/weather/weatherInfo', {
        params: {
          key: AMAP_KEY,
          city: location.adcode,
          extensions: 'base' // 获取实时
        }
      })
      
      // 处理天气数据
      if (weatherResponse.data.status === '1' && liveWeatherResponse.data.status === '1') {
        const forecasts = weatherResponse.data.forecasts[0]
        const casts = forecasts.casts
        const live = liveWeatherResponse.data.lives[0]
        const today = casts[0] // 今天的预报
        
        // 获取空气质量数据（高德API需要单独请求）
        let airQuality = '未知'
        try {
          const airResponse = await axios.get('https://restapi.amap.com/v3/air/quality', {
            params: {
              key: "ff213d3a230f61fd33a26cd19a22f5e2",
              city: location.adcode
            }
          })
          if (airResponse.data.status === '1' && airResponse.data.lives.length > 0) {
            const airLive = airResponse.data.lives[0]
            airQuality = getAirQualityText(airLive.quality)
          }
        } catch (error) {
          console.error('获取空气质量数据失败:', error)
        }
        
        weatherData.value = {
          city: forecasts.city || location.city,
          temp: live.temperature,
          tempMin: today.nighttemp,
          tempMax: today.daytemp,
          text: live.weather,
          airQuality: airQuality,
          humidity: live.humidity,
          windDirection: live.winddirection,
          windPower: live.windpower,
          lastUpdated: now.toISOString()
        }
      } else {
        throw new Error('获取天气数据失败')
      }
      
      return weatherData.value
    } catch (error) {
      console.error('获取天气数据失败:', error)
      // 设置默认数据，但保留上次更新时间
      weatherData.value = {
        ...weatherData.value,
        city: weatherData.value.city !== '正在定位...' ? weatherData.value.city : '北京',
        temp: '23',
        tempMin: '15',
        tempMax: '26',
        text: '晴朗',
        airQuality: '空气优'
      }
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
    saveToSession
  }
}) 