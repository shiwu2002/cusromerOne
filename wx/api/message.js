// 站内消息API
const request = require('../utils/request.js');

/**
 * 发送用户消息
 * @param {number} receiverId 接收者ID
 * @param {string} title 标题
 * @param {string} content 内容
 * @returns {Promise}
 */
function sendMessage(receiverId, title, content) {
  return request.post('/messages/user', {
    receiverId,
    title,
    content
  });
}

/**
 * 获取当前用户的所有消息
 * @returns {Promise}
 */
function getAllMessages() {
  return request.get('/messages/list');
}

/**
 * 获取未读消息
 * @returns {Promise}
 */
function getUnreadMessages() {
  return request.get('/messages/unread');
}

/**
 * 获取未读消息数量
 * @returns {Promise}
 */
function getUnreadCount() {
  return request.get('/messages/unread-count');
}

/**
 * 按类型获取消息
 * @param {string} messageType 消息类型
 * @returns {Promise}
 */
function getMessagesByType(messageType) {
  return request.get(`/messages/list/type/${messageType}`);
}

/**
 * 获取各类型未读数量统计
 * @returns {Promise}
 */
function getUnreadCountByTypes() {
  return request.get('/messages/unread-count-by-types');
}

/**
 * 获取消息详情（自动标记已读）
 * @param {number} messageId 消息ID
 * @returns {Promise}
 */
function getMessageDetail(messageId) {
  return request.get(`/messages/detail/${messageId}`);
}

/**
 * 标记单条消息为已读
 * @param {number} messageId 消息ID
 * @returns {Promise}
 */
function markAsRead(messageId) {
  return request.put(`/messages/mark-read/${messageId}`);
}

/**
 * 批量标记为已读
 * @param {Array<number>} messageIds 消息ID数组
 * @returns {Promise}
 */
function batchMarkAsRead(messageIds) {
  return request.put('/messages/batch-mark-read', {
    messageIds
  });
}

/**
 * 标记所有消息为已读
 * @returns {Promise}
 */
function markAllAsRead() {
  return request.put('/messages/mark-all-read');
}

/**
 * 删除消息
 * @param {number} messageId 消息ID
 * @returns {Promise}
 */
function deleteMessage(messageId) {
  return request.del(`/messages/${messageId}`);
}

/**
 * 批量删除消息
 * @param {Array<number>} messageIds 消息ID数组
 * @returns {Promise}
 */
function batchDeleteMessages(messageIds) {
  return request.del('/messages/batch', {
    messageIds
  });
}

/**
 * 获取我发送的消息
 * @returns {Promise}
 */
function getSentMessages() {
  return request.get('/messages/sent');
}

/**
 * 分页获取消息
 * @param {number} page 页码
 * @param {number} pageSize 每页数量
 * @returns {Promise}
 */
function getMessagesByPage(page = 1, pageSize = 20) {
  return request.get('/messages/page', {
    page,
    pageSize
  });
}

module.exports = {
  sendMessage,
  getAllMessages,
  getUnreadMessages,
  getUnreadCount,
  getMessagesByType,
  getUnreadCountByTypes,
  getMessageDetail,
  markAsRead,
  batchMarkAsRead,
  markAllAsRead,
  deleteMessage,
  batchDeleteMessages,
  getSentMessages,
  getMessagesByPage
};
