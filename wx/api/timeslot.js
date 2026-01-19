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

/**
 * 查询可用时间段
 * @param {number} labId 实验室ID
 * @param {string} date 日期 (格式: YYYY-MM-DD)
 * @returns {Promise}
 */
function getAvailableTimeslots(labId, date) {
  return request.get(`/timeslot/available`, {
    labId: labId,
    date: date
  });
}

module.exports = {
  getAllTimeSlots,
  getEnabledTimeSlots,
  getTimeSlotsByStatus,
  getTimeSlotDetail,
  getAvailableTimeslots
};
