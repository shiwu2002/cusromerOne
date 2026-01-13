import request from '@/utils/request'

// 管理员登录
export const login = (data) => {
  return request({
    url: '/api/user/login',
    method: 'post',
    data
  })
}

// 用户注册
export const register = (data) => {
  return request({
    url: '/api/user/register',
    method: 'post',
    data
  })
}

// 查询单个用户
export const getUserById = (id) => {
  return request({
    url: `/api/user/${id}`,
    method: 'get'
  })
}

// 查询所有用户
export const getUserList = (params) => {
  return request({
    url: '/api/user/list',
    method: 'get',
    params
  })
}

// 按类型查询用户
export const getUsersByType = (userType) => {
  return request({
    url: `/api/user/type/${userType}`,
    method: 'get'
  })
}

// 搜索用户
export const searchUsers = (params) => {
  return request({
    url: '/api/user/search',
    method: 'get',
    params
  })
}

// 更新用户信息
export const updateUser = (id, data) => {
  return request({
    url: `/api/user/${id}`,
    method: 'put',
    data
  })
}

// 更新用户状态
export const updateUserStatus = (userId, status) => {
  return request({
    url: '/api/user/status',
    method: 'put',
    data: {
      userId,
      status
    }
  })
}

// 修改密码
export const updatePassword = (data) => {
  return request({
    url: '/api/user/password',
    method: 'put',
    data
  })
}

// 重置用户密码
export const resetPassword = (id) => {
  return request({
    url: '/api/user/reset-password',
    method: 'put',
    data: {
      id,
      newPassword: '123456'
    }
  })
}

// 删除用户
export const deleteUser = (id) => {
  return request({
    url: `/api/user/${id}`,
    method: 'delete'
  })
}

// 用户统计
export const getUserStatistics = () => {
  return request({
    url: '/api/user/statistics',
    method: 'get'
  })
}

// 发送注册验证邮件
export const sendRegisterEmail = (data) => {
  return request({
    url: '/api/user/send-register-email',
    method: 'post',
    data
  })
}

// 验证邮箱
export const verifyEmail = (token) => {
  return request({
    url: '/api/user/verify-email',
    method: 'get',
    params: { token }
  })
}

// 发送验证码
export const sendCode = (data) => {
  return request({
    url: '/api/user/send-code',
    method: 'post',
    data
  })
}

// 验证验证码
export const verifyCode = (data) => {
  return request({
    url: '/api/user/verify-code',
    method: 'post',
    data
  })
}

// 通过邮箱重置密码
export const resetPasswordByEmail = (data) => {
  return request({
    url: '/api/user/reset-password-by-email',
    method: 'post',
    data
  })
}

// 绑定邮箱
export const bindEmail = (data) => {
  return request({
    url: '/api/user/bind-email',
    method: 'post',
    data
  })
}

// 重新发送验证邮件
export const resendVerifyEmail = (data) => {
  return request({
    url: '/api/user/resend-verify-email',
    method: 'post',
    data
  })
}
