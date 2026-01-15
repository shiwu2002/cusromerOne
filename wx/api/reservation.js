// 预约API
const request = require('../utils/request.js');

/**
 * 创建预约
 * @param {Object} reservationData 预约数据
 * @param {number} reservationData.userId 用户ID
 * @param {number} reservationData.labId 实验室ID
 * @param {string} reservationData.reserveDate 预约日期 (yyyy-MM-dd)
 * @param {string} reservationData.timeSlot 时间段
 * @returns {Promise}
 */
function createReservation(reservationData) {
  return request.post('/reservation', reservationData);
}

/**
 * 查询预约详情
 * @param {number} id 预约ID
 * @returns {Promise}
 */
function getReservationDetail(id) {
  return request.get(`/reservation/${id}`);
}

/**
 * 查询所有预约
 * @returns {Promise}
 */
function getAllReservations() {
  return request.get('/reservation/list');
}

/**
 * 查询某用户的预约列表
 * @param {number} userId 用户ID
 * @returns {Promise}
 */
function getUserReservations(userId) {
  return request.get(`/reservation/user/${userId}`);
}

/**
 * 查询某实验室的预约列表
 * @param {number} labId 实验室ID
 * @returns {Promise}
 */
function getLabReservations(labId) {
  return request.get(`/reservation/lab/${labId}`);
}

/**
 * 按状态查询预约
 * @param {number} status 状态: 0-待审核, 1-已通过, 2-已拒绝, 3-已取消, 4-已完成
 * @returns {Promise}
 */
function getReservationsByStatus(status) {
  return request.get(`/reservation/status/${status}`);
}

/**
 * 查询待审核预约
 * @returns {Promise}
 */
function getPendingReservations() {
  return request.get('/reservation/pending');
}

/**
 * 取消预约
 * @param {number} id 预约ID
 * @returns {Promise}
 */
function cancelReservation(id) {
  return request.put(`/reservation/cancel/${id}`);
}

/**
 * 完成预约
 * @param {number} id 预约ID
 * @param {string} feedback 反馈内容（可选）
 * @returns {Promise}
 */
function completeReservation(id, feedback) {
  const params = feedback ? { feedback } : {};
  return request.put(`/reservation/complete/${id}`, params);
}

/**
 * 检查时间冲突
 * @param {number} labId 实验室ID
 * @param {string} reserveDate 预约日期 (yyyy-MM-dd)
 * @param {string} timeSlot 时间段
 * @returns {Promise}
 */
function checkConflict(labId, reserveDate, timeSlot) {
  return request.get('/reservation/check-conflict', {
    labId,
    reserveDate,
    timeSlot
  });
}

/**
 * 预约统计
 * @param {number} userId 用户ID（可选，不传则返回全局统计）
 * @returns {Promise}
 */
function getReservationStatistics(userId) {
  const params = userId ? { userId } : {};
  return request.get('/reservation/statistics', params);
}

/**
 * 按日期范围查询预约
 * @param {string} startDate 开始日期 (yyyy-MM-dd)
 * @param {string} endDate 结束日期 (yyyy-MM-dd)
 * @returns {Promise}
 */
function getReservationsByDateRange(startDate, endDate) {
  return request.get('/reservation/date-range', {
    startDate,
    endDate
  });
}

/**
 * 查询指定日期的实验室预约情况
 * @param {number} labId 实验室ID
 * @param {string} date 日期 (yyyy-MM-dd)
 * @returns {Promise}
 */
function getLabSchedule(labId, date) {
  return request.get('/reservation/lab-schedule', {
    labId,
    date
  });
}

module.exports = {
  createReservation,
  getReservationDetail,
  getAllReservations,
  getUserReservations,
  getLabReservations,
  getReservationsByStatus,
  getPendingReservations,
  cancelReservation,
  completeReservation,
  checkConflict,
  getReservationStatistics,
  getReservationsByDateRange,
  getLabSchedule
};
