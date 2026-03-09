<template>
  <div class="dashboard-charts">
    <el-row :gutter="20">
      <!-- 预约趋势图 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              <span>预约趋势</span>
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

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 实时动态 -->
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <el-icon><Bell /></el-icon>
              <span>实时动态</span>
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
                <div class="activity-text">{{ activity.content }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </div>
            <div v-if="recentActivities.length === 0" class="empty-data">
              暂无实时动态
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 时间段热度 -->
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
  Calendar 
} from '@element-plus/icons-vue'
import { getDashboardData } from '@/api/dashboard'

const loading = ref(false)
const recentActivities = ref([])

// 图表实例
const reservationTrendChart = ref(null)
const labUtilizationChart = ref(null)
const userTypeChart = ref(null)
const statusChart = ref(null)
const creditChart = ref(null)
const weekdayChart = ref(null)

let charts = []

// 初始化所有图表
const initCharts = async () => {
  loading.value = true
  try {
    const res = await getDashboardData()
    const data = res.data || {}
    
    // 实时动态
    recentActivities.value = (data.recentActivities || []).slice(0, 8)
    
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
    
    // 周几分布
    initWeekdayChart(data.weekdayDistribution || [])
    
  } catch (error) {
    console.error('加载图表数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 预约趋势图
const initReservationTrendChart = (data) => {
  if (!reservationTrendChart.value) return
  
  const chart = echarts.init(reservationTrendChart.value)
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
      data: data.map(item => item.date),
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
      type: 'line',
      smooth: true,
      data: data.map(item => item.count),
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
      data: data.map(item => item.labName),
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#909399' }
    },
    series: [{
      name: '使用次数',
      type: 'bar',
      data: data.map(item => item.usageCount),
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
        name: item.type,
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
      color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
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
        name: item.status,
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
      color: ['#F56C6C', '#67C23A', '#909399', '#E6A23C']
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
        name: item.level,
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
      color: ['#F56C6C', '#E6A23C', '#409EFF', '#67C23A']
    }]
  }
  chart.setOption(option)
  charts.push(chart)
}

// 周几分布
const initWeekdayChart = (data) => {
  if (!weekdayChart.value) return
  
  const chart = echarts.init(weekdayChart.value)
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
      data: data.map(item => item.weekday),
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
      data: data.map(item => item.count),
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
  initCharts()
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

.activity-text {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 4px;
}

.activity-time {
  color: #909399;
  font-size: 12px;
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
