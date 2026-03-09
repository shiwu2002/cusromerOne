import request from '@/utils/request'

// 获取我的信誉分
export const getMyCredit = () => {
  return request({
    url: '/api/credit/my',
    method: 'get'
  })
}

// 获取我的信誉分记录
export const getMyCreditLogs = (params) => {
  return request({
    url: '/api/credit/my/logs',
    method: 'get',
    params
  })
}

// 培训恢复分数
export const trainingRecoverScore = () => {
  return request({
    url: '/api/credit/training/recover',
    method: 'post'
  })
}

// 获取信誉分规则
export const getCreditRules = () => {
  return request({
    url: '/api/credit/rules',
    method: 'get'
  })
}

// 查询用户信誉分（管理员）
export const getUserCredit = (userId) => {
  return request({
    url: `/api/credit/user/${userId}`,
    method: 'get'
  })
}

// 查询用户信誉分记录（管理员）
export const getUserCreditLogs = (userId, params) => {
  return request({
    url: `/api/credit/user/${userId}/logs`,
    method: 'get',
    params
  })
}

// 调整用户信誉分（超级管理员）
export const adjustUserCredit = (userId, data) => {
  return request({
    url: `/api/credit/user/${userId}/adjust`,
    method: 'post',
    data
  })
}
