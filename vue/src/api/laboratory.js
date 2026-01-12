import request from '@/utils/request'

// 添加实验室
export const addLaboratory = (data) => {
  return request({
    url: '/api/laboratory',
    method: 'post',
    data
  })
}

// 查询单个实验室
export const getLaboratoryById = (id) => {
  return request({
    url: `/api/laboratory/${id}`,
    method: 'get'
  })
}

// 查询所有实验室
export const getLaboratoryList = (params) => {
  return request({
    url: '/api/laboratory/list',
    method: 'get',
    params
  })
}

// 按类型查询
export const getLaboratoriesByType = (labType) => {
  return request({
    url: `/api/laboratory/type/${labType}`,
    method: 'get'
  })
}

// 按状态查询
export const getLaboratoriesByStatus = (status) => {
  return request({
    url: `/api/laboratory/status/${status}`,
    method: 'get'
  })
}

// 查询可用实验室
export const getAvailableLaboratories = () => {
  return request({
    url: '/api/laboratory/available',
    method: 'get'
  })
}

// 搜索实验室
export const searchLaboratories = (params) => {
  return request({
    url: '/api/laboratory/search',
    method: 'get',
    params
  })
}

// 按容量查询
export const getLaboratoriesByCapacity = (params) => {
  return request({
    url: '/api/laboratory/capacity',
    method: 'get',
    params
  })
}

// 更新实验室信息
export const updateLaboratory = (data) => {
  return request({
    url: '/api/laboratory',
    method: 'put',
    data
  })
}

// 删除实验室
export const deleteLaboratory = (id) => {
  return request({
    url: `/laboratories/${id}`,
    method: 'delete'
  })
}

// 更新实验室状态
export const updateLaboratoryStatus = (id, data) => {
  return request({
    url: `/laboratories/${id}/status`,
    method: 'put',
    data
  })
}

// 实验室统计
export const getLaboratoryStatistics = () => {
  return request({
    url: '/api/laboratory/statistics',
    method: 'get'
  })
}
