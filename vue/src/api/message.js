import request from '@/utils/request'

// 消息管理API

// 发送系统消息
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

// 批量发送系统消息
export const sendBatchMessages = async (data) => {
  // data格式: { title, content, receiver_ids: [] }
  const { title, content, receiver_ids } = data
  
  // 循环发送给每个用户
  const promises = receiver_ids.map(receiverId => 
    sendSystemMessage({
      receiverId,
      title,
      content,
      priority: 1
    })
  )
  
  return Promise.all(promises)
}

// 查询用户消息列表
export const getMessageList = (userId) => {
  return request({
    url: `/api/messages/list/${userId}`,
    method: 'get'
  })
}

// 查询未读消息
export const getUnreadMessages = (userId) => {
  return request({
    url: `/api/messages/unread/${userId}`,
    method: 'get'
  })
}

// 按类型查询
export const getMessagesByType = (userId, messageType) => {
  return request({
    url: `/api/messages/list/${userId}/type/${messageType}`,
    method: 'get'
  })
}

// 查询已发送的消息
export const getSentMessages = (userId) => {
  return request({
    url: `/api/messages/sent/${userId}`,
    method: 'get'
  })
}

// 消息详情
export const getMessageDetail = (messageId, userId) => {
  return request({
    url: `/api/messages/detail/${messageId}`,
    method: 'get',
    params: { userId }
  })
}

// 未读消息总数
export const getUnreadCount = (userId) => {
  return request({
    url: `/api/messages/unread-count/${userId}`,
    method: 'get'
  })
}

// 各类型未读统计
export const getUnreadCountByTypes = (userId) => {
  return request({
    url: `/api/messages/unread-count-by-types/${userId}`,
    method: 'get'
  })
}

// 标记单条已读
export const markAsRead = (messageId, userId) => {
  return request({
    url: `/api/messages/mark-read/${messageId}`,
    method: 'put',
    params: { userId }
  })
}

// 批量标记已读
export const batchMarkAsRead = (data) => {
  return request({
    url: '/api/messages/batch-mark-read',
    method: 'put',
    data
  })
}

// 全部标记已读
export const markAllAsRead = (userId) => {
  return request({
    url: `/api/messages/mark-all-read/${userId}`,
    method: 'put'
  })
}

// 删除单条消息
export const deleteMessage = (messageId, userId) => {
  return request({
    url: `/api/messages/${messageId}`,
    method: 'delete',
    params: { userId }
  })
}

// 批量删除消息
export const batchDeleteMessages = (data) => {
  return request({
    url: '/api/messages/batch',
    method: 'delete',
    data
  })
}

// 分页查询
export const getMessagePage = (userId, params) => {
  return request({
    url: `/api/messages/page/${userId}`,
    method: 'get',
    params
  })
}

// 按优先级查询
export const getMessagesByPriority = (userId, priority) => {
  return request({
    url: `/api/messages/priority/${userId}/${priority}`,
    method: 'get'
  })
}

// 高优先级未读消息
export const getHighPriorityUnread = (userId) => {
  return request({
    url: `/api/messages/high-priority-unread/${userId}`,
    method: 'get'
  })
}
