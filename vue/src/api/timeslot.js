import request from '@/utils/request'

// 获取所有时间段列表
export const getTimeslotList = (params) => {
  return request({
    url: '/api/timeslot/list',
    method: 'get',
    params
  })
}

// 获取可用时间段
export const getAvailableTimeslots = (params) => {
  return request({
    url: '/api/timeslot/available',
    method: 'get',
    params
  })
}

// 获取启用的时间段
export const getEnabledTimeslots = () => {
  return request({
    url: '/api/timeslot/enabled',
    method: 'get'
  })
}

// 按状态查询时间段
export const getTimeslotsByStatus = (status) => {
  return request({
    url: `/api/timeslot/status/${status}`,
    method: 'get'
  })
}

// 添加时间段
export const addTimeslot = (data) => {
  return request({
    url: '/api/timeslot',
    method: 'post',
    data
  })
}

// 更新时间段信息
export const updateTimeslot = (id, data) => {
  return request({
    url: `/api/timeslot/${id}`,
    method: 'put',
    data
  })
}

// 更新时间段状态
export const updateTimeslotStatus = (id, status) => {
  return request({
    url: '/api/timeslot/status',
    method: 'put',
    params: { id, status }
  })
}

// 删除时间段
export const deleteTimeslot = (id) => {
  return request({
    url: `/api/timeslot/${id}`,
    method: 'delete'
  })
}

// 批量更新排序
export const batchUpdateSortOrder = (data) => {
  return request({
    url: '/api/timeslot/batch-sort',
    method: 'put',
    data
  })
}

// 时间段统计
export const getTimeslotStatistics = () => {
  return request({
    url: '/api/timeslot/statistics',
    method: 'get'
  })
}
