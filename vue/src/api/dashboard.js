import request from '@/utils/request'

// 获取核心指标数据
export const getCoreMetrics = () => {
  return request({
    url: '/api/dashboard/core-metrics',
    method: 'get'
  })
}

// 获取预约趋势数据
export const getReservationTrend = () => {
  return request({
    url: '/api/dashboard/reservation-trend',
    method: 'get'
  })
}

// 获取实验室利用率数据
export const getLabUtilization = () => {
  return request({
    url: '/api/dashboard/lab-utilization',
    method: 'get'
  })
}

// 获取时间段热度数据
export const getTimeSlotHeatmap = () => {
  return request({
    url: '/api/dashboard/time-slot-heatmap',
    method: 'get'
  })
}

// 获取用户类型分布数据
export const getUserTypeDistribution = () => {
  return request({
    url: '/api/dashboard/user-type-distribution',
    method: 'get'
  })
}

// 获取预约状态分布数据
export const getStatusDistribution = () => {
  return request({
    url: '/api/dashboard/status-distribution',
    method: 'get'
  })
}

// 获取信用等级分布数据
export const getCreditLevelDistribution = () => {
  return request({
    url: '/api/dashboard/credit-level-distribution',
    method: 'get'
  })
}

// 获取周几分布数据
export const getWeekdayDistribution = () => {
  return request({
    url: '/api/dashboard/weekday-distribution',
    method: 'get'
  })
}

// 获取学院排行数据
export const getCollegeRank = () => {
  return request({
    url: '/api/dashboard/college-rank',
    method: 'get'
  })
}

// 获取实时动态数据
export const getRecentActivities = () => {
  return request({
    url: '/api/dashboard/recent-activities',
    method: 'get'
  })
}

// 获取容量使用率数据
export const getCapacityUsage = () => {
  return request({
    url: '/api/dashboard/capacity-usage',
    method: 'get'
  })
}

// 一次性获取所有仪表板数据（推荐）
export const getDashboardData = () => {
  return request({
    url: '/api/dashboard/all',
    method: 'get'
  })
}
