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
      skipAuth: true, // 此接口无需携带 token
      noRedirectOn401: true
    }).then(response => {
      // 响应格式：{code: 200, msg: "微信登录成功（已绑定）", data: {needBind, token, userId, username, userType, realName, openid, unionid}}
      const data = response.data;
        
      // 若已绑定（needBind=false）且有 token，则直接保存 token 与用户信息
      if (data && data.needBind === false && data.token) {
        req.setToken(data.token);
        wx.setStorageSync('userInfo', {
          userId: data.userId,
          username: data.username,
          userType: data.userType,
          realName: data.realName,
          openid: data.openid,
          unionid: data.unionid
        });
      }
      return response;
    });
  },

  /**
   * 绑定 openid 到指定用户
   * @param {Object} data - 绑定信息
   * @param {number} data.userId - 用户 ID
   * @param {string} data.openid - 微信 openid
   * @param {string} data.unionid - 微信 unionid（可选）
   * @param {string} data.sessionKey - 微信 session_key（从登录接口获取）
   * @param {string} data.platform - 平台类型，默认 mini_program
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
        sessionKey: data.sessionKey,
        platform: data.platform || 'mini_program'
      },
      skipAuth: true // 绑定时可能还未登录
    }).then(response => {
      // 响应格式：{code: 200, msg: "绑定成功", data: {userId, platform, openid, unionid, bindStatus, token}}
      // 绑定成功后返回 token，直接保存
      const res = response.data;
      if (res && res.data && res.data.token) {
        req.setToken(res.data.token);
        wx.setStorageSync('userInfo', {
          userId: res.data.userId,
          openid: res.data.openid,
          unionid: res.data.unionid
        });
      }
      return response;
    });
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
