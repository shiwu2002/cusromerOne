// api/wechat.js - 微信登录相关API
const { request } = require('../utils/request')

/**
 * 微信登录相关API
 */
const wechatApi = {
  /**
   * 通过code登录（换取openid/session_key）
   * @param {string} code - wx.login返回的code
   * @returns {Promise}
   */
  login(code) {
    return request({
      url: '/wx/login',
      method: 'POST',
      data: { code },
      skipAuth: true // 此接口无需携带token
    })
  },

  /**
   * 绑定openid到指定用户
   * @param {Object} data - 绑定信息
   * @param {number} data.userId - 用户ID
   * @param {string} data.openid - 微信openid
   * @param {string} data.unionid - 微信unionid（可选）
   * @param {string} data.sessionKey - 微信session_key
   * @param {string} data.platform - 平台类型，默认mini_program
   * @returns {Promise}
   */
  bind(data) {
    return request({
      url: '/wx/bind',
      method: 'POST',
      data: {
        userId: data.userId,
        openid: data.openid,
        unionid: data.unionid || null,
        sessionKey: data.sessionKey,
        platform: data.platform || 'mini_program'
      },
      skipAuth: true // 绑定时可能还未登录
    })
  },

  /**
   * 解绑微信
   * @returns {Promise}
   */
  unbind() {
    return request({
      url: '/wx/unbind',
      method: 'POST'
    })
  },

  /**
   * 获取用户绑定状态
   * @returns {Promise}
   */
  getBindStatus() {
    return request({
      url: '/wx/bind-status',
      method: 'GET'
    })
  }
}

module.exports = wechatApi
