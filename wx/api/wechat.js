// api/wechat.js - 微信登录相关API
const req = require('../utils/request')

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
    return req.request({
      url: '/wx/login',
      method: 'POST',
      data: { code },
      skipAuth: true, // 此接口无需携带token
      noRedirectOn401: true
    }).then(response => {
      // 响应格式：{code: 200, message: "操作成功", data: {needBind, token, userId, username, userType, realName, openid, unionid}, success: true}
      // 实际数据在response.data字段中
      const data = response.data;
      
      // 若已绑定（needBind=false）且有token，则直接保存token与用户信息
      if (data && data.needBind === false && data.token) {
        req.setToken(data.token);
        wx.setStorageSync('userInfo', {
          userId: data.userId,
          username: data.username,
          userType: data.userType,
          realName: data.realName
        });
      }
      return response;
    });
  },

  /**
   * 绑定openid到指定用户
   * @param {Object} data - 绑定信息
   * @param {number} data.userId - 用户ID
   * @param {string} data.openid - 微信openid
   * @param {string} data.unionid - 微信unionid（可选）
   * @param {string} data.platform - 平台类型，默认mini_program
   * @returns {Promise}
   */
  bind(data) {
    return req.request({
      url: '/wx/bind',
      method: 'POST',
      data: {
        userId: data.userId,
        openid: data.openid,
        unionid: data.unionid || null,
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
    return req.request({
      url: '/wx/unbind',
      method: 'POST'
    })
  },

  /**
   * 获取用户绑定状态
   * @returns {Promise}
   */
  getBindStatus() {
    return req.request({
      url: '/wx/bind-status',
      method: 'GET'
    })
  }
}

module.exports = wechatApi
