<template>
  <div class="data-screen">
    <!-- 顶部标题栏 -->
    <div class="screen-header">
      <div class="header-left">
        <div class="time-display">{{ currentTime }}</div>
      </div>
      <div class="header-center">
        <h1 class="screen-title">
          <el-icon class="title-icon"><DataLine /></el-icon>
          实验室预约管理平台 - 数据可视化大屏
        </h1>
      </div>
      <div class="header-right">
        <el-button type="info" size="small" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 核心指标数字翻牌器 -->
    <el-row :gutter="20" class="metrics-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="metric-card metric-purple">
          <div class="metric-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">用户总数</div>
            <div class="metric-value">
              <count-to 
                :start-val="0" 
                :end-val="statistics.totalUsers" 
                :duration="2000"
                class="count-number"
              />
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="metric-card metric-blue">
          <div class="metric-icon">
            <el-icon><OfficeBuilding /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">实验室总数</div>
            <div class="metric-value">
              <count-to 
                :start-val="0" 
                :end-val="statistics.totalLaboratories" 
                :duration="2000"
                class="count-number"
              />
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="metric-card metric-green">
          <div class="metric-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">预约总数</div>
            <div class="metric-value">
              <count-to 
                :start-val="0" 
                :end-val="statistics.totalReservations" 
                :duration="2000"
                class="count-number"
              />
            </div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <div class="metric-card metric-orange">
          <div class="metric-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="metric-content">
            <div class="metric-label">待审核预约</div>
            <div class="metric-value">
              <count-to 
                :start-val="0" 
                :end-val="statistics.pendingApprovals" 
                :duration="2000"
                class="count-number"
              />
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 主要图表区域 -->
    <el-row :gutter="20" class="charts-main-row">
      <!-- 左侧：预约趋势 + 实时动态 -->
      <el-col :xs="24" :md="16">
        <div class="chart-container large-chart">
          <div class="chart-box">
            <div class="box-header">
              <el-icon><TrendCharts /></el-icon>
              <span>预约趋势分析</span>
            </div>
            <div ref="reservationTrendChart" class="chart-body"></div>
          </div>
        </div>
        
        <div class="chart-container activity-chart">
          <div class="chart-box">
            <div class="box-header">
              <el-icon><Bell /></el-icon>
              <span>实时动态</span>
            </div>
            <div class="activity-list">
              <div 
                v-for="(activity, index) in recentActivities" 
                :key="index" 
                class="activity-item"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="activity-dot"></div>
                <div class="activity-content">
                  <div class="activity-text">
                    <span class="activity-user">{{ activity.user_name }}</span>
                    预约了 
                    <span class="activity-lab">{{ activity.lab_name }}</span>
                  </div>
                  <div class="activity-meta">
                    <el-tag :type="getStatusTagType(activity.status)" size="small">
                      {{ activity.status_text }}
                    </el-tag>
                    <span class="activity-time">{{ formatTime(activity.create_time) }}</span>
                  </div>
                </div>
              </div>
              <div v-if="recentActivities.length === 0" class="empty-data">
                暂无实时动态
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧：雷达图 + 实验室利用率 -->
      <el-col :xs="24" :md="8">
        <div class="chart-container radar-chart">
          <div class="chart-box">
            <div class="box-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>多维度分析</span>
            </div>
            <div ref="radarChart" class="chart-body"></div>
          </div>
        </div>

        <div class="chart-container top-labs-chart">
          <div class="chart-box">
            <div class="box-header">
              <el-icon><Trophy /></el-icon>
              <span>实验室 TOP5</span>
            </div>
            <div ref="topLabsChart" class="chart-body"></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 底部图表行 -->
    <el-row :gutter="20" class="charts-bottom-row">
      <el-col :xs="24" :md="12">
        <div class="chart-container">
          <div class="chart-box">
            <div class="box-header">
              <el-icon><PieChart /></el-icon>
              <span>预约状态分布</span>
            </div>
            <div ref="statusChart" class="chart-body"></div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :md="12">
        <div class="chart-container">
          <div class="chart-box">
            <div class="box-header">
              <el-icon><Calendar /></el-icon>
              <span>周几预约分布</span>
            </div>
            <div ref="weekdayChart" class="chart-body"></div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { 
  User, 
  OfficeBuilding, 
  Calendar, 
  Warning,
  TrendCharts,
  DataLine,
  Bell,
  DataAnalysis,
  Trophy,
  PieChart,
  Refresh
} from '@element-plus/icons-vue'
import { getDashboardData } from '@/api/dashboard'
import * as echarts from 'echarts'
import 'echarts/theme/dark'

// 数字翻牌器组件（简化版）
const CountTo = {
  props: ['startVal', 'endVal', 'duration'],
  data() {
    return {
      currentVal: this.startVal
    }
  },
  mounted() {
    this.animate()
  },
  methods: {
    animate() {
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / this.duration, 1)
        // 缓动函数
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        this.currentVal = Math.floor(this.startVal + (this.endVal - this.startVal) * easeOutQuart)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }
  },
  render() {
    return this.$slots.default ? this.$slots.default() : this.currentVal
  }
}

const currentTime = ref('')
const statistics = ref({
  totalUsers: 0,
  totalLaboratories: 0,
  totalReservations: 0,
  pendingApprovals: 0
})
const recentActivities = ref([])
const loading = ref(false)

// 图表实例
const reservationTrendChart = ref(null)
const radarChart = ref(null)
const topLabsChart = ref(null)
const statusChart = ref(null)
const weekdayChart = ref(null)

let charts = []
let timer = null

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getDashboardData()
    const data = res.data || {}
    
    console.log('=== 后端返回的完整数据 ===', data)
    console.log('预约趋势数据:', data.reservationTrend)
    console.log('实验室利用率:', data.labUtilization)
    console.log('预约状态分布:', data.statusDistribution)
    console.log('周几分布:', data.weekdayDistribution)
    
    // 更新统计数据 - 根据后端文档字段映射
    const metrics = data.coreMetrics || {}
    statistics.value.totalUsers = metrics.totalUsers || 0
    statistics.value.totalLaboratories = metrics.totalLabs || 0  // 后端返回 totalLabs
    statistics.value.totalReservations = metrics.totalReservations || 0
    statistics.value.pendingApprovals = metrics.pendingReservations || 0  // 后端返回 pendingReservations
    
    // 实时动态
    recentActivities.value = (data.recentActivities || []).slice(0, 8)
    
    // 初始化所有图表
    initCharts(data)
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  loadData()
}

// 初始化所有图表
const initCharts = (data) => {
  nextTick(() => {
    initReservationTrendChart(data.reservationTrend || [])
    initRadarChart(data)
    initTopLabsChart(data.labUtilization || [])
    initStatusChart(data.statusDistribution || [])
    initWeekdayChart(data.weekdayDistribution || [])
  })
}

const nextTick = (fn) => {
  setTimeout(fn, 0)
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    0: 'warning',   // 待审核
    1: 'success',   // 已通过
    2: 'danger',    // 已拒绝
    3: 'info',      // 已取消
    4: ''           // 已完成
  }
  return typeMap[status] || 'info'
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// 预约趋势图（面积堆积图）
const initReservationTrendChart = (data) => {
  if (!reservationTrendChart.value) {
    console.error('预约趋势图容器未找到')
    return
  }
  
  console.log('预约趋势数据:', data)
  
  if (!data || data.length === 0) {
    console.warn('预约趋势数据为空')
    return
  }
  
  const chart = echarts.init(reservationTrendChart.value)
  const dates = data.map(item => item.date)
  const counts = data.map(item => item.count)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: '#409EFF',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: '#606266' } },
      axisLabel: { 
        color: '#909399',
        rotate: 45  // 旋转 45 度避免重叠
      }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#2c3e50', type: 'dashed' } },
      axisLabel: { color: '#909399' }
    },
    series: [{
      name: '预约数',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: counts,
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
      },
      lineStyle: { width: 4 }
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 雷达图
const initRadarChart = (data) => {
  if (!radarChart.value) {
    console.error('雷达图容器未找到')
    return
  }
  
  const metrics = data.coreMetrics || {}
  console.log('雷达图数据:', metrics)
  
  const chart = echarts.init(radarChart.value)
  const option = {
    backgroundColor: 'transparent',
    tooltip: {},
    radar: {
      indicator: [
        { name: '用户数', max: Math.max(metrics.totalUsers || 0, 1000) },
        { name: '实验室数', max: Math.max(metrics.totalLaboratories || 0, 100) },
        { name: '预约数', max: Math.max(metrics.totalReservations || 0, 5000) },
        { name: '待审核', max: Math.max(metrics.pendingApprovals || 0, 500) },
        { name: '完成率', max: 100 }
      ],
      shape: 'circle',
      splitNumber: 5,
      axisName: {
        color: '#409EFF',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(64, 158, 255, 0.3)'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(64, 158, 255, 0.1)', 'rgba(64, 158, 255, 0.05)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(64, 158, 255, 0.5)'
        }
      }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [
            metrics.totalUsers || 0,
            metrics.totalLaboratories || 0,
            metrics.totalReservations || 0,
            metrics.pendingApprovals || 0,
            85
          ],
          name: '平台数据',
          itemStyle: {
            color: '#409EFF'
          },
          areaStyle: {
            color: 'rgba(64, 158, 255, 0.3)'
          },
          lineStyle: {
            width: 2
          }
        }
      ]
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 实验室 TOP5
const initTopLabsChart = (data) => {
  if (!topLabsChart.value) {
    console.error('实验室 TOP5 图表容器未找到')
    return
  }
  
  console.log('实验室 TOP5 数据:', data)
  
  if (!data || data.length === 0) {
    console.warn('实验室 TOP5 数据为空')
    return
  }
  
  const chart = echarts.init(topLabsChart.value)
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: '#67C23A',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#2c3e50', type: 'dashed' } },
      axisLabel: { color: '#909399' }
    },
    yAxis: {
      type: 'category',
      data: data.slice(0, 5).map(item => item.lab_name),  // 后端字段：lab_name
      axisLine: { lineStyle: { color: '#606266' } },
      axisLabel: { color: '#909399' }
    },
    series: [{
      name: '预约次数',
      type: 'bar',
      data: data.slice(0, 5).map(item => item.reservation_count),  // 后端字段：reservation_count
      barWidth: '60%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#67C23A' },
          { offset: 1, color: '#95D47A' }
        ]),
        borderRadius: [0, 4, 4, 0]
      }
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 预约状态分布
const initStatusChart = (data) => {
  if (!statusChart.value) {
    console.error('预约状态分布图表容器未找到')
    return
  }
  
  console.log('预约状态分布数据:', data)
  
  if (!data || data.length === 0) {
    console.warn('预约状态分布数据为空')
    return
  }
  
  const chart = echarts.init(statusChart.value)
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: '#E6A23C',
      textStyle: { color: '#fff' }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#909399' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      data: data.map(item => ({
        name: item.status_name,  // 后端字段：status_name
        value: item.count
      })),
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: '14', fontWeight: 'bold', color: '#fff' }
      },
      itemStyle: {
        borderRadius: 5,
        borderColor: '#1e2832',
        borderWidth: 2
      },
      color: ['#ffa500', '#00ff88', '#ff4444', '#888', '#00d4ff']  // 根据文档颜色
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 周几分布
const initWeekdayChart = (data) => {
  if (!weekdayChart.value) {
    console.error('周几分布图表容器未找到')
    return
  }
  
  console.log('周几分布数据:', data)
  
  if (!data || data.length === 0) {
    console.warn('周几分布数据为空')
    return
  }
  
  const chart = echarts.init(weekdayChart.value)
  
  // 按 DAYOFWEEK 排序（周日到周六）
  const weekdayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const sortedData = [...data].sort((a, b) => {
    return weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday)
  })
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: '#E6A23C',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sortedData.map(item => {
        const map = {
          'Sunday': '周日',
          'Monday': '周一',
          'Tuesday': '周二',
          'Wednesday': '周三',
          'Thursday': '周四',
          'Friday': '周五',
          'Saturday': '周六'
        }
        return map[item.weekday] || item.weekday
      }),
      axisLine: { lineStyle: { color: '#606266' } },
      axisLabel: { color: '#909399' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#2c3e50', type: 'dashed' } },
      axisLabel: { color: '#909399' }
    },
    series: [{
      name: '预约数',
      type: 'bar',
      data: sortedData.map(item => item.count),
      barWidth: '60%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#E6A23C' },
          { offset: 1, color: '#F5D082' }
        ]),
        borderRadius: [4, 4, 0, 0]
      }
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 清理图表
const disposeCharts = () => {
  charts.forEach(chart => chart.dispose())
  charts = []
}

onMounted(() => {
  updateTime()
  loadData()
  timer = setInterval(updateTime, 1000)
  
  window.addEventListener('resize', () => {
    charts.forEach(chart => chart.resize())
  })
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  disposeCharts()
})
</script>

<style scoped>
/* 数据大屏容器 */
.data-screen {
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding: 20px;
  position: relative;
  overflow-x: hidden;
}

/* 背景动画 */
.data-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(64, 158, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(103, 194, 58, 0.1) 0%, transparent 50%);
  pointer-events: none;
  animation: bgPulse 8s ease-in-out infinite;
}

@keyframes bgPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* 顶部标题栏 */
.screen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.2) 0%, rgba(64, 158, 255, 0.05) 50%, rgba(64, 158, 255, 0.2) 100%);
  border-radius: 12px;
  border: 1px solid rgba(64, 158, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 10;
}

.header-left,
.header-right {
  flex: 1;
}

.header-center {
  text-align: center;
}

.time-display {
  font-size: 16px;
  color: #409EFF;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}

.screen-title {
  color: #fff;
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-shadow: 0 0 20px rgba(64, 158, 255, 0.8);
  letter-spacing: 2px;
}

.title-icon {
  font-size: 32px;
  color: #409EFF;
  animation: iconGlow 2s ease-in-out infinite;
}

@keyframes iconGlow {
  0%, 100% { filter: drop-shadow(0 0 5px #409EFF); }
  50% { filter: drop-shadow(0 0 20px #409EFF); }
}

/* 核心指标卡片 */
.metrics-row {
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
}

.metric-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.metric-card:hover::before {
  left: 100%;
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.metric-purple {
  border-left: 4px solid #409EFF;
}

.metric-blue {
  border-left: 4px solid #409EFF;
}

.metric-green {
  border-left: 4px solid #409EFF;
}

.metric-orange {
  border-left: 4px solid #409EFF;
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  flex-shrink: 0;
}

.metric-purple .metric-icon,
.metric-blue .metric-icon,
.metric-green .metric-icon,
.metric-orange .metric-icon {
  background: linear-gradient(135deg, #409EFF 0%, #0073e6 100%);
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.5);
}

.metric-content {
  flex: 1;
}

.metric-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 8px;
}

.metric-value {
  color: #fff;
  font-size: 32px;
  font-weight: bold;
  font-family: 'Arial Black', sans-serif;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.count-number {
  font-size: 32px;
  font-weight: bold;
}

/* 图表容器 */
.charts-main-row,
.charts-bottom-row {
  position: relative;
  z-index: 10;
}

.chart-container {
  margin-bottom: 20px;
}

.large-chart {
  min-height: 350px;
}

.activity-chart {
  min-height: 300px;
}

.radar-chart {
  min-height: 300px;  /* 增加高度 */
}

.top-labs-chart {
  min-height: 300px;  /* 增加高度 */
}

.charts-bottom-row .chart-container {
  min-height: 300px;  /* 底部图表也要保证高度 */
}

.chart-box {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  height: 100%;
}

.box-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.3);
}

.box-header .el-icon {
  color: #409EFF;
  font-size: 20px;
  filter: drop-shadow(0 0 5px #409EFF);
}

.chart-body {
  height: calc(100% - 60px);  /* 减去 header 的高度 */
  width: 100%;
  min-height: 240px;  /* 保证最小高度 */
}

/* 实时动态列表 */
.activity-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  animation: slideIn 0.5s ease-out both;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #409EFF 0%, #667eea 100%);
  border-radius: 50%;
  margin-top: 5px;
  margin-right: 12px;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.6);
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 6px;
}

.activity-user {
  color: #409EFF;
  font-weight: 500;
}

.activity-lab {
  color: #67C23A;
  font-weight: 500;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.empty-data {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  padding: 40px 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 滚动条样式 */
.activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-thumb {
  background: rgba(64, 158, 255, 0.3);
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 158, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-screen {
    padding: 10px;
  }
  
  .screen-header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  
  .screen-title {
    font-size: 18px;
  }
  
  .metric-card {
    padding: 15px;
    margin-bottom: 15px;
  }
  
  .metric-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
  
  .metric-value {
    font-size: 24px;
  }
  
  .large-chart,
  .activity-chart,
  .radar-chart,
  .top-labs-chart {
    min-height: 250px;
  }
}
</style>
