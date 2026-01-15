// 统一请求封装工具
const BASE_URL = 'http://localhost:8080/api'; // 开发环境地址，生产环境需修改

// 存储token的key
const TOKEN_KEY = 'auth_token';

/**
 * 统一请求方法
 * @param {Object} options 请求配置
 * @returns {Promise}
 */
function request(options) {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = wx.getStorageSync(TOKEN_KEY);
    
    // 构建完整的URL
    const url = options.url.startsWith('http') ? options.url : BASE_URL + options.url;
    
    // 构建请求头
    const header = {
      'content-type': options.contentType || 'application/json',
      ...options.header
    };
    
    // 如果有token，添加到请求头
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }
    
    // 发起请求
    wx.request({
      url: url,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      success: (res) => {
        // 统一处理响应
        if (res.statusCode === 200) {
          const data = res.data;
          if (data.success) {
            resolve(data.data);
          } else {
            // 业务失败
            wx.showToast({
              title: data.message || '请求失败',
              icon: 'none',
              duration: 2000
            });
            reject(data);
          }
        } else if (res.statusCode === 401) {
          // token过期或未登录
          wx.showToast({
            title: '请先登录',
            icon: 'none',
            duration: 2000
          });
          // 清除token
          wx.removeStorageSync(TOKEN_KEY);
          // 跳转到登录页
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/login/login'
            });
          }, 2000);
          reject(res);
        } else {
          // 其他错误
          wx.showToast({
            title: `请求失败(${res.statusCode})`,
            icon: 'none',
            duration: 2000
          });
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
        reject(err);
      }
    });
  });
}

/**
 * GET请求
 */
function get(url, data = {}) {
  return request({
    url: url,
    method: 'GET',
    data: data
  });
}

/**
 * POST请求
 */
function post(url, data = {}) {
  return request({
    url: url,
    method: 'POST',
    data: data
  });
}

/**
 * PUT请求
 */
function put(url, data = {}) {
  return request({
    url: url,
    method: 'PUT',
    data: data
  });
}

/**
 * DELETE请求
 */
function del(url, data = {}) {
  return request({
    url: url,
    method: 'DELETE',
    data: data
  });
}

/**
 * 上传文件
 */
function upload(filePath, type = 'document') {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync(TOKEN_KEY);
    
    wx.uploadFile({
      url: BASE_URL + '/file/upload',
      filePath: filePath,
      name: 'file',
      formData: {
        type: type
      },
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data);
          if (data.success) {
            resolve(data.data);
          } else {
            wx.showToast({
              title: data.message || '上传失败',
              icon: 'none',
              duration: 2000
            });
            reject(data);
          }
        } else {
          wx.showToast({
            title: `上传失败(${res.statusCode})`,
            icon: 'none',
            duration: 2000
          });
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '上传失败',
          icon: 'none',
          duration: 2000
        });
        reject(err);
      }
    });
  });
}

/**
 * 保存token
 */
function setToken(token) {
  wx.setStorageSync(TOKEN_KEY, token);
}

/**
 * 获取token
 */
function getToken() {
  return wx.getStorageSync(TOKEN_KEY);
}

/**
 * 清除token
 */
function removeToken() {
  wx.removeStorageSync(TOKEN_KEY);
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  upload,
  setToken,
  getToken,
  removeToken,
  BASE_URL
};
