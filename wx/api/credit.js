// 信誉分系统 API
const request = require('../utils/request.js');

/**
 * 获取当前用户的信誉分
 * @returns {Promise}
 */
function getMyCredit() {
  return request.get('/credit/my');
}

/**
 * 获取当前用户的信誉分记录（分页）
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @returns {Promise}
 */
function getMyCreditLogs(params = {}) {
  return request.get('/credit/my/logs', {
    page: params.page || 1,
    pageSize: params.pageSize || 10
  });
}

/**
 * 参加培训恢复信誉分
 * @returns {Promise}
 */
function trainingRecover() {
  return request.post('/credit/training/recover');
}

/**
 * 获取信誉分规则
 * @returns {Promise}
 */
function getCreditRules() {
  return request.get('/credit/rules');
}

module.exports = {
  getMyCredit,
  getMyCreditLogs,
  trainingRecover,
  getCreditRules
};
