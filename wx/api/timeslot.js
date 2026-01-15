// 时间段API
const request = require('../utils/request.js');

/**
 * 查询所有时间段
 * @returns {Promise}
 */
function getAllTimeSlots() {
  return request.get('/timeslot/list');
}

/**
 * 查询启用的时间段
 * @returns {Promise}
 */
function getEnabledTimeSlots() {
  return request.get('/timeslot/enabled');
}

/**
 * 按状态查询时间段
 * @param {number} status 状态: 0-禁用, 1-启用
 * @returns {Promise}
 */
function getTimeSlotsByStatus(status) {
  return request.get(`/timeslot/status/${status}`);
}

/**
 * 查询时间段详情
 * @param {number} id 时间段ID
 * @returns {Promise}
 */
function getTimeSlotDetail(id) {
  return request.get(`/timeslot/${id}`);
}

module.exports = {
  getAllTimeSlots,
  getEnabledTimeSlots,
  getTimeSlotsByStatus,
  getTimeSlotDetail
};
