import request from '@/utils/request'

// 查询所有预约
export const getReservationList = (params) => {
  return request({
    url: '/api/reservation/list',
    method: 'get',
    params
  })
}

// 查询单个预约详情
export const getReservationDetail = (id) => {
  return request({
    url: `/api/reservation/${id}`,
    method: 'get'
  })
}

// 查询用户的预约
export const getReservationsByUser = (userId) => {
  return request({
    url: `/api/reservation/user/${userId}`,
    method: 'get'
  })
}

// 查询实验室的预约
export const getReservationsByLab = (labId) => {
  return request({
    url: `/api/reservation/lab/${labId}`,
    method: 'get'
  })
}

// 按状态查询
export const getReservationsByStatus = (status) => {
  return request({
    url: `/api/reservation/status/${status}`,
    method: 'get'
  })
}

// 查询待审核预约
export const getPendingReservations = () => {
  return request({
    url: '/api/reservation/pending',
    method: 'get'
  })
}

// 审核通过
export const approveReservation = (id, approvalNote) => {
  return request({
    url: `/api/reservation/approve/${id}`,
    method: 'put',
    params: { approvalNote }
  })
}

// 审核拒绝
export const rejectReservation = (id, approvalNote) => {
  return request({
    url: `/api/reservation/reject/${id}`,
    method: 'put',
    params: { approvalNote }
  })
}

// 创建预约
export const createReservation = (data) => {
  return request({
    url: '/api/reservation',
    method: 'post',
    data
  })
}

// 更新预约
export const updateReservation = (data) => {
  return request({
    url: '/api/reservation',
    method: 'put',
    data
  })
}

// 取消预约
export const cancelReservation = (id) => {
  return request({
    url: `/api/reservation/cancel/${id}`,
    method: 'put'
  })
}

// 标记预约完成
export const completeReservation = (id, feedback) => {
  return request({
    url: `/api/reservation/complete/${id}`,
    method: 'put',
    params: { feedback }
  })
}

// 删除预约
export const deleteReservation = (id) => {
  return request({
    url: `/api/reservation/${id}`,
    method: 'delete'
  })
}

// 检查时间冲突
export const checkConflict = (params) => {
  return request({
    url: '/api/reservation/check-conflict',
    method: 'get',
    params
  })
}

// 日期范围查询
export const getReservationsByDateRange = (params) => {
  return request({
    url: '/api/reservation/date-range',
    method: 'get',
    params
  })
}

// 搜索预约
export const searchReservations = (params) => {
  return request({
    url: '/api/reservation/search',
    method: 'get',
    params
  })
}

// 实验室预约情况
export const getLabSchedule = (params) => {
  return request({
    url: '/api/reservation/lab-schedule',
    method: 'get',
    params
  })
}

// 预约统计
export const getReservationStatistics = (userId) => {
  return request({
    url: '/api/reservation/statistics',
    method: 'get',
    params: { userId }
  })
}
