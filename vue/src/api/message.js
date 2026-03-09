import request from '@/utils/request'

// 获取我的消息列表
export const getMessageList = (params) => {
  return request({
    url: '/api/messages/list',
    method: 'get',
    params
  })
}

// 获取未读消息
export const getUnreadMessages = (params) => {
  return request({
    url: '/api/messages/unread',
    method: 'get',
    params
  })
}

// 获取未读消息数量
export const getUnreadCount = () => {
  return request({
    url: '/api/messages/unread-count',
    method: 'get'
  })
}

// 获取消息详情
export const getMessageDetail = (messageId) => {
  return request({
    url: `/api/messages/detail/${messageId}`,
    method: 'get'
  })
}

// 标记消息已读
export const markAsRead = (messageId) => {
  return request({
    url: `/api/messages/mark-read/${messageId}`,
    method: 'put'
  })
}

// 批量标记已读
export const batchMarkAsRead = (messageIds) => {
  return request({
    url: '/api/messages/batch-mark-read',
    method: 'put',
    data: { messageIds }
  })
}

// 全部标记已读
export const markAllAsRead = () => {
  return request({
    url: '/api/messages/mark-all-read',
    method: 'put'
  })
}

// 删除消息
export const deleteMessage = (messageId) => {
  return request({
    url: `/api/messages/${messageId}`,
    method: 'delete'
  })
}

// 批量删除消息
export const batchDeleteMessages = (messageIds) => {
  return request({
    url: '/api/messages/batch-delete',
    method: 'delete',
    data: { messageIds }
  })
}

// 发送系统消息（广播）
export const sendSystemMessage = (data) => {
  return request({
    url: '/api/messages/system',
    method: 'post',
    data
  })
}

// 发送用户消息
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
    url: '/api/messages/batch-send',
    method: 'post',
    data
  })
}
