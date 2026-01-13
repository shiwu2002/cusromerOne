import request from '@/utils/request'

// 消息管理API（所有接口的 userId 都从 JWT token 自动获取）

// 发送系统消息（管理员功能）
export const sendSystemMessage = (data) => {
  return request({
    url: '/api/messages/system',
    method: 'post',
    data
  })
}

// 发送用户消息（senderId 从 token 获取）
export const sendUserMessage = (data) => {
  return request({
    url: '/api/messages/user',
    method: 'post',
    data
  })
}

// 批量发送消息
export const sendBatchMessages = (data) => {
  return request({
    url: '/api/messages/batch',
    method: 'post',
    data
  })
}

// 获取用户消息列表（支持分页和筛选，userId 从 token 获取）
export const getMessageList = (params) => {
  return request({
    url: '/api/messages/list',
    method: 'get',
    params
  })
}

// 获取未读消息（userId 从 token 获取）
export const getUnreadMessages = () => {
  return request({
    url: '/api/messages/unread',
    method: 'get'
  })
}

// 按类型查询消息（userId 从 token 获取）
export const getMessagesByType = (messageType) => {
  return request({
    url: `/api/messages/list/type/${messageType}`,
    method: 'get'
  })
}

// 获取用户发送的消息（userId 从 token 获取）
export const getSentMessages = () => {
  return request({
    url: '/api/messages/sent',
    method: 'get'
  })
}

// 获取消息详情（userId 从 token 获取）
export const getMessageDetail = (messageId) => {
  return request({
    url: `/api/messages/detail/${messageId}`,
    method: 'get'
  })
}

// 获取未读消息总数（userId 从 token 获取）
export const getUnreadCount = () => {
  return request({
    url: '/api/messages/unread-count',
    method: 'get'
  })
}

// 获取各类型未读消息统计（userId 从 token 获取）
export const getUnreadCountByTypes = () => {
  return request({
    url: '/api/messages/unread-count-by-types',
    method: 'get'
  })
}

// 标记单条消息为已读（userId 从 token 获取）
export const markAsRead = (messageId) => {
  return request({
    url: `/api/messages/mark-read/${messageId}`,
    method: 'put'
  })
}

// 批量标记消息为已读（userId 从 token 获取）
export const batchMarkAsRead = (messageIds) => {
  return request({
    url: '/api/messages/batch-mark-read',
    method: 'put',
    data: { messageIds }
  })
}

// 标记所有消息为已读（userId 从 token 获取）
export const markAllAsRead = () => {
  return request({
    url: '/api/messages/mark-all-read',
    method: 'put'
  })
}

// 删除单条消息（userId 从 token 获取）
export const deleteMessage = (messageId) => {
  return request({
    url: `/api/messages/${messageId}`,
    method: 'delete'
  })
}

// 批量删除消息（userId 从 token 获取）
export const batchDeleteMessages = (messageIds) => {
  return request({
    url: '/api/messages/batch',
    method: 'delete',
    data: { messageIds }
  })
}

// 分页查询用户消息（userId 从 token 获取）
export const getMessagePage = (params) => {
  return request({
    url: '/api/messages/page',
    method: 'get',
    params
  })
}

// 按优先级查询消息（userId 从 token 获取）
export const getMessagesByPriority = (priority) => {
  return request({
    url: `/api/messages/priority/${priority}`,
    method: 'get'
  })
}

// 获取高优先级未读消息（userId 从 token 获取）
export const getHighPriorityUnread = () => {
  return request({
    url: '/api/messages/high-priority-unread',
    method: 'get'
  })
}
