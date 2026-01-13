import request from '@/utils/request'

// 添加时间段
export const addTimeslot = (data) => {
  return request({
    url: '/api/timeslot',
    method: 'post',
    data
  })
}

// 查询单个时间段
export const getTimeslotById = (id) => {
  return request({
    url: `/api/timeslot/${id}`,
    method: 'get'
  })
}

// 查询所有时间段
export const getTimeslotList = () => {
  return request({
    url: '/api/timeslot/list',
    method: 'get'
  })
}

// 查询启用的时间段
export const getEnabledTimeslots = () => {
  return request({
    url: '/api/timeslot/enabled',
    method: 'get'
  })
}

// 按状态查询
export const getTimeslotsByStatus = (status) => {
  return request({
    url: `/api/timeslot/status/${status}`,
    method: 'get'
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
    params: {
      id,
      status
    }
  })
}

// 批量更新排序
export const batchUpdateSort = (data) => {
  return request({
    url: '/api/timeslot/batch-sort',
    method: 'put',
    data
  })
}

// 删除时间段
export const deleteTimeslot = (id) => {
  return request({
    url: `/api/timeslot/${id}`,
    method: 'delete'
  })
}

// 时间段统计
export const getTimeslotStatistics = () => {
  return request({
    url: '/api/timeslot/statistics',
    method: 'get'
  })
}
