// 实验室API
const request = require('../utils/request.js');

/**
 * 查询实验室详情
 * @param {number} id 实验室ID
 * @returns {Promise}
 */
function getLaboratoryDetail(id) {
  return request.get(`/laboratory/${id}`);
}

/**
 * 查询所有实验室
 * @returns {Promise}
 */
function getAllLaboratories() {
  return request.get('/laboratory/list');
}

/**
 * 查询可用实验室
 * @returns {Promise}
 */
function getAvailableLaboratories() {
  return request.get('/laboratory/available');
}

/**
 * 按类型查询实验室
 * @param {string} labType 实验室类型
 * @returns {Promise}
 */
function getLaboratoriesByType(labType) {
  return request.get(`/laboratory/type/${labType}`);
}

/**
 * 按状态查询实验室
 * @param {number} status 状态: 0-维护中, 1-可用, 2-停用
 * @returns {Promise}
 */
function getLaboratoriesByStatus(status) {
  return request.get(`/laboratory/status/${status}`);
}

/**
 * 搜索实验室
 * @param {Object} params 搜索参数
 * @param {string} params.keyword 关键词
 * @param {string} params.labType 类型
 * @param {number} params.status 状态
 * @returns {Promise}
 */
function searchLaboratories(params = {}) {
  return request.get('/laboratory/search', params);
}

/**
 * 按容量范围查询实验室
 * @param {number} minCapacity 最小容量
 * @param {number} maxCapacity 最大容量
 * @returns {Promise}
 */
function getLaboratoriesByCapacity(minCapacity, maxCapacity) {
  const params = {};
  if (minCapacity !== undefined) params.minCapacity = minCapacity;
  if (maxCapacity !== undefined) params.maxCapacity = maxCapacity;
  return request.get('/laboratory/capacity', params);
}

module.exports = {
  getLaboratoryDetail,
  getAllLaboratories,
  getAvailableLaboratories,
  getLaboratoriesByType,
  getLaboratoriesByStatus,
  searchLaboratories,
  getLaboratoriesByCapacity
};
