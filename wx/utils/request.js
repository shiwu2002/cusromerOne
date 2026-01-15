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
    
    // 如果未显式跳过认证且有token，添加到请求头
    if (!options.skipAuth && token) {
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
          // 兼容两种响应格式：
          // 1) { success: true, data: {...} }
          // 2) { code: 200, message: 'xxx', data: {...} }
          const ok = data && (data.success === true || data.code === 200);
          if (ok) {
            resolve(data.data !== undefined ? data.data : data);
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
          // 401处理：支持在登录流程中禁止跳转，避免登录页自我重定向形成死循环
          // 无论如何先清除token
          wx.removeStorageSync(TOKEN_KEY);

          const noRedirect = options.noRedirectOn401 || options.skipAuth;
          const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
          const currentRoute = pages && pages.length ? pages[pages.length - 1].route : '';

          // 在以下场景，不进行重定向：显式禁止重定向、当前已在登录页
          if (noRedirect || currentRoute === 'pages/login/login') {
            reject(res);
            return;
          }

          // 其余场景按原逻辑提示并跳登录页
          wx.showToast({
            title: '请先登录',
            icon: 'none',
            duration: 2000
          });
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
function get(url, data = {}, extra = {}) {
  return request({
    url: url,
    method: 'GET',
    data: data,
    ...extra
  });
}

/**
 * POST请求
 */
function post(url, data = {}, extra = {}) {
  return request({
    url: url,
    method: 'POST',
    data: data,
    ...extra
  });
}

/**
 * PUT请求
 */
function put(url, data = {}, extra = {}) {
  return request({
    url: url,
    method: 'PUT',
    data: data,
    ...extra
  });
}

/**
 * DELETE请求
 */
function del(url, data = {}, extra = {}) {
  return request({
    url: url,
    method: 'DELETE',
    data: data,
    ...extra
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
