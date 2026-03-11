<template>
  <div class="dashboard-charts">
    <!-- 第一行：预约趋势图 + 实验室利用率 TOP10 -->
    <el-row :gutter="20">
      <!-- 预约趋势图 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              <span>预约趋势（近 30 天）</span>
            </div>
          </template>
          <div ref="reservationTrendChart" class="chart" v-loading="loading"></div>
        </el-card>
      </el-col>

      <!-- 实验室利用率 TOP10 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><DataLine /></el-icon>
              <span>实验室利用率 TOP10</span>
            </div>
          </template>
          <div ref="labUtilizationChart" class="chart" v-loading="loading"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行：用户类型分布 + 预约状态分布 + 信用等级分布 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 用户类型分布 -->
      <el-col :xs="24" :md="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><PieChart /></el-icon>
              <span>用户类型分布</span>
            </div>
          </template>
          <div ref="userTypeChart" class="chart-small" v-loading="loading"></div>
        </el-card>
      </el-col>

      <!-- 预约状态分布 -->
      <el-col :xs="24" :md="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><PieChart /></el-icon>
              <span>预约状态分布</span>
            </div>
          </template>
          <div ref="statusChart" class="chart-small" v-loading="loading"></div>
        </el-card>
      </el-col>

      <!-- 信用等级分布 -->
      <el-col :xs="24" :md="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><Star /></el-icon>
              <span>信用等级分布</span>
            </div>
          </template>
          <div ref="creditChart" class="chart-small" v-loading="loading"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第三行：时间段热度 + 周几分布 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 时间段热度分布 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><Calendar /></el-icon>
              <span>时间段热度分布</span>
            </div>
          </template>
          <div ref="timeSlotHeatmapChart" class="chart" v-loading="loading"></div>
        </el-card>
      </el-col>

      <!-- 周几预约分布 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><Calendar /></el-icon>
              <span>周几预约分布</span>
            </div>
          </template>
          <div ref="weekdayChart" class="chart" v-loading="loading"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第四行：学院排行 + 容量使用率 + 实时动态 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 学院预约排行 -->
      <el-col :xs="24" :md="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><DataLine /></el-icon>
              <span>学院预约排行 TOP10</span>
            </div>
          </template>
          <div ref="collegeRankChart" class="chart" v-loading="loading"></div>
        </el-card>
      </el-col>

      <!-- 容量使用率 -->
      <el-col :xs="24" :md="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><DataLine /></el-icon>
              <span>实验室容量使用率</span>
            </div>
          </template>
          <div ref="capacityUsageChart" class="chart" v-loading="loading"></div>
        </el-card>
      </el-col>

      <!-- 实时动态 -->
      <el-col :xs="24" :md="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><Bell /></el-icon>
              <span>实时动态</span>
              <el-tag size="small" type="success" style="margin-left: auto;">
                <el-icon><Refresh /></el-icon>
                每 30 秒更新
              </el-tag>
            </div>
          </template>
          <div class="activity-list" v-loading="loading">
            <div 
              v-for="(activity, index) in recentActivities" 
              :key="index" 
              class="activity-item"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="activity-dot"></div>
              <div class="activity-content">
                <div class="activity-user">{{ activity.userName }}</div>
                <div class="activity-lab">{{ activity.labName }}</div>
                <div class="activity-meta">
                  <el-tag :type="getStatusTagType(activity.status)" size="small">
                    {{ activity.statusText }}
                  </el-tag>
                  <span class="activity-time">{{ activity.time }}</span>
                </div>
              </div>
            </div>
            <div v-if="recentActivities.length === 0" class="empty-data">
              暂无实时动态
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { 
  TrendCharts, 
  DataLine, 
  PieChart, 
  Star, 
  Bell,
  Calendar,
  Refresh
} from '@element-plus/icons-vue'
import { getDashboardData, getRecentActivities } from '@/api/dashboard'

const loading = ref(false)
const recentActivities = ref([])

// 图表实例
const reservationTrendChart = ref(null)
const labUtilizationChart = ref(null)
const userTypeChart = ref(null)
const statusChart = ref(null)
const creditChart = ref(null)
const timeSlotHeatmapChart = ref(null)
const weekdayChart = ref(null)
const collegeRankChart = ref(null)
const capacityUsageChart = ref(null)

let charts = []
let refreshTimer = null

// 初始化所有图表
const initCharts = async () => {
  loading.value = true
  try {
    const res = await getDashboardData()
    const data = res.data || {}
    
    // 实时动态
    recentActivities.value = (data.recentActivities || []).slice(0, 10)
    
    await nextTick()
    
    // 预约趋势图
    initReservationTrendChart(data.reservationTrend || [])
    
    // 实验室利用率
    initLabUtilizationChart(data.labUtilization || [])
    
    // 用户类型分布
    initUserTypeChart(data.userTypeDistribution || [])
    
    // 预约状态分布
    initStatusChart(data.statusDistribution || [])
    
    // 信用等级分布
    initCreditChart(data.creditLevelDistribution || [])
    
    // 时间段热度分布
    initTimeSlotHeatmapChart(data.timeSlotHeatmap || [])
    
    // 周几分布
    initWeekdayChart(data.weekdayDistribution || [])
    
    // 学院排行
    initCollegeRankChart(data.collegeRank || [])
    
    // 容量使用率
    initCapacityUsageChart(data.capacityUsage || [])
    
  } catch (error) {
    console.error('加载图表数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 刷新实时动态
const refreshRecentActivities = async () => {
  try {
    const res = await getRecentActivities()
    recentActivities.value = (res.data || []).slice(0, 10)
  } catch (error) {
    console.error('刷新实时动态失败:', error)
  }
}

// 启动定时刷新（30 秒）
const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    refreshRecentActivities()
  }, 30000)
}

// 停止定时刷新
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
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

// 预约趋势图
const initReservationTrendChart = (data) => {
  if (!reservationTrendChart.value) return
  
  const chart = echarts.init(reservationTrendChart.value)
  const dates = data.map(item => item.date)
  const counts = data.map(item => item.count)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      textStyle: { color: '#606266' }
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
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { 
        color: '#909399',
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f2f6fc', type: 'dashed' } },
      axisLabel: { color: '#909399' }
    },
    series: [{
      name: '预约数',
      type: 'line',
      smooth: true,
      data: counts,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#409EFF' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
        ])
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.01)' }
        ])
      },
      lineStyle: { width: 3 }
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 实验室利用率
const initLabUtilizationChart = (data) => {
  if (!labUtilizationChart.value) return
  
  const chart = echarts.init(labUtilizationChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      textStyle: { color: '#606266' }
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
      splitLine: { lineStyle: { color: '#f2f6fc', type: 'dashed' } },
      axisLabel: { color: '#909399' }
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.lab_name).reverse(),
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#909399' }
    },
    series: [{
      name: '预约次数',
      type: 'bar',
      data: data.map(item => item.reservation_count).reverse(),
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

// 用户类型分布
const initUserTypeChart = (data) => {
  if (!userTypeChart.value) return
  
  const chart = echarts.init(userTypeChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      textStyle: { color: '#606266' }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#606266' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      data: data.map(item => ({
        name: item.type_name,
        value: item.count
      })),
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: '14', fontWeight: 'bold' }
      },
      itemStyle: {
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 2
      },
      color: ['#409EFF', '#67C23A', '#E6A23C']
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 预约状态分布
const initStatusChart = (data) => {
  if (!statusChart.value) return
  
  const chart = echarts.init(statusChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      textStyle: { color: '#606266' }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#606266' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      data: data.map(item => ({
        name: item.status_name,
        value: item.count
      })),
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: '14', fontWeight: 'bold' }
      },
      itemStyle: {
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 2
      },
      color: ['#ffa500', '#00ff88', '#ff4444', '#888', '#00d4ff']
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 信用等级分布
const initCreditChart = (data) => {
  if (!creditChart.value) return
  
  const chart = echarts.init(creditChart.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      textStyle: { color: '#606266' }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#606266' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      data: data.map(item => ({
        name: item.level_name,
        value: item.count
      })),
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: '14', fontWeight: 'bold' }
      },
      itemStyle: {
        borderRadius: 5,
        borderColor: '#fff',
        borderWidth: 2
      },
      color: ['#F56C6C', '#E6A23C', '#409EFF', '#67C23A', '#95D47A']
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 时间段热度分布
const initTimeSlotHeatmapChart = (data) => {
  if (!timeSlotHeatmapChart.value) return
  
  const chart = echarts.init(timeSlotHeatmapChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      textStyle: { color: '#606266' }
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
      data: data.map(item => item.time_slot),
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { 
        color: '#909399',
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f2f6fc', type: 'dashed' } },
      axisLabel: { color: '#909399' }
    },
    series: [{
      name: '预约次数',
      type: 'bar',
      data: data.map(item => item.usage_count),
      barWidth: '60%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#FF6B6B' },
          { offset: 1, color: '#FFA07A' }
        ]),
        borderRadius: [4, 4, 0, 0]
      }
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 周几分布
const initWeekdayChart = (data) => {
  if (!weekdayChart.value) return
  
  const chart = echarts.init(weekdayChart.value)
  
  // 按 DAYOFWEEK 排序（周日到周六）
  const weekdayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const sortedData = [...data].sort((a, b) => {
    return weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday)
  })
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      textStyle: { color: '#606266' }
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
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#909399' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f2f6fc', type: 'dashed' } },
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

// 学院排行
const initCollegeRankChart = (data) => {
  if (!collegeRankChart.value) return
  
  const chart = echarts.init(collegeRankChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      textStyle: { color: '#606266' },
      formatter: (params) => {
        const item = data[params.dataIndex]
        return `${item.college}<br/>预约次数：${item.reservation_count}<br/>用户数：${item.user_count}`
      }
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
      splitLine: { lineStyle: { color: '#f2f6fc', type: 'dashed' } },
      axisLabel: { color: '#909399' }
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.college).reverse(),
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { 
        color: '#909399',
        interval: 0
      }
    },
    series: [{
      name: '预约次数',
      type: 'bar',
      data: data.map(item => item.reservation_count).reverse(),
      barWidth: '60%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#9C27B0' },
          { offset: 1, color: '#BA68C8' }
        ]),
        borderRadius: [0, 4, 4, 0]
      }
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 容量使用率
const initCapacityUsageChart = (data) => {
  if (!capacityUsageChart.value) return
  
  const chart = echarts.init(capacityUsageChart.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      textStyle: { color: '#606266' },
      formatter: (params) => {
        const item = data[params.dataIndex]
        return `${item.lab_name}<br/>容量：${item.capacity}人<br/>累计人数：${item.total_people}<br/>使用率：${item.usage_rate}%`
      }
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
      name: '使用率 (%)',
      splitLine: { lineStyle: { color: '#f2f6fc', type: 'dashed' } },
      axisLabel: { 
        color: '#909399',
        formatter: '{value}%'
      }
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.lab_name).reverse(),
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { 
        color: '#909399',
        interval: 0
      }
    },
    series: [{
      name: '使用率',
      type: 'bar',
      data: data.map(item => item.usage_rate).reverse(),
      barWidth: '60%',
      itemStyle: {
        color: (params) => {
          const rate = params.value
          if (rate >= 80) {
            return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#F56C6C' },
              { offset: 1, color: '#F89898' }
            ])
          } else if (rate >= 50) {
            return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#E6A23C' },
              { offset: 1, color: '#F5D082' }
            ])
          } else {
            return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#67C23A' },
              { offset: 1, color: '#95D47A' }
            ])
          }
        },
        borderRadius: [0, 4, 4, 0]
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        color: '#606266'
      }
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 清理图表
const disposeCharts = () => {
  stopAutoRefresh()
  charts.forEach(chart => chart.dispose())
  charts = []
}

onMounted(() => {
  initCharts()
  startAutoRefresh()
  window.addEventListener('resize', () => {
    charts.forEach(chart => chart.resize())
  })
})

defineExpose({ disposeCharts })
</script>

<style scoped>
.dashboard-charts {
  padding: 10px;
}

.chart-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #303133;
}

.card-header .el-icon {
  color: #409EFF;
  font-size: 18px;
}

.chart {
  height: 300px;
  width: 100%;
}

.chart-small {
  height: 250px;
  width: 100%;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  animation: slideIn 0.5s ease-out both;
}

.activity-dot {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  margin-top: 6px;
  margin-right: 12px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-user {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-lab {
  color: #606266;
  font-size: 13px;
  margin-bottom: 6px;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-time {
  color: #909399;
  font-size: 12px;
  margin-left: auto;
}

.empty-data {
  text-align: center;
  color: #c0c4cc;
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

/* 自定义滚动条 */
.activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background-color: #c0c4cc;
}
</style>
