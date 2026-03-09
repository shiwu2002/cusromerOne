import request from '@/utils/request'

// 导出预约报表
export const exportReservationReport = (params) => {
  return request({
    url: '/api/report/export-reservations',
    method: 'get',
    params,
    responseType: 'blob' // 重要：接收二进制数据
  })
}

// 导出统计报表
export const exportStatisticsReport = (params) => {
  return request({
    url: '/api/report/export-statistics',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 获取报表预览数据（可选）
export const getReportPreview = (params) => {
  return request({
    url: '/api/report/preview',
    method: 'get',
    params
  })
}
