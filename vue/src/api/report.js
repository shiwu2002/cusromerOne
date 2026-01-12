import request from '@/utils/request'

// 报表导出API

// 导出预约报表
export const exportReservations = (params) => {
  return request({
    url: '/api/report/export-reservations',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 导出统计报表
export const exportStatistics = (params) => {
  return request({
    url: '/api/report/export-statistics',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
