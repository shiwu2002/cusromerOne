// 文件上传API
const request = require('../utils/request.js');

/**
 * 单文件上传
 * @param {string} filePath 文件路径
 * @param {string} type 文件类型: avatar | lab | document
 * @returns {Promise}
 */
function uploadFile(filePath, type = 'document') {
  return request.upload(filePath, type);
}

/**
 * 选择并上传图片
 * @param {string} type 文件类型: avatar | lab
 * @param {number} count 选择图片数量（默认1张）
 * @returns {Promise}
 */
function chooseAndUploadImage(type = 'avatar', count = 1) {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count: count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        if (tempFilePaths.length === 1) {
          // 单张上传
          uploadFile(tempFilePaths[0], type)
            .then(resolve)
            .catch(reject);
        } else {
          // 多张上传
          const uploadPromises = tempFilePaths.map(path => uploadFile(path, type));
          Promise.all(uploadPromises)
            .then(resolve)
            .catch(reject);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

/**
 * 选择并上传文件（仅支持特定格式）
 * @param {string} type 文件类型: document
 * @returns {Promise}
 */
function chooseAndUploadFile(type = 'document') {
  return new Promise((resolve, reject) => {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
      success: (res) => {
        const tempFile = res.tempFiles[0];
        uploadFile(tempFile.path, type)
          .then(resolve)
          .catch(reject);
      },
      fail: (err) => {
        wx.showToast({
          title: '选择文件失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

/**
 * 删除文件（需要管理员权限）
 * @param {string} path 服务器文件路径
 * @returns {Promise}
 */
function deleteFile(path) {
  return request.del('/file/delete', { path });
}

/**
 * 上传头像（专用方法）
 * @param {string} filePath 文件路径
 * @returns {Promise}
 */
async function uploadAvatar(filePath) {
  try {
    const response = await uploadFile(filePath, 'avatar');
    
    // 根据后端返回的数据结构处理
    // 后端返回格式：{ code: 200, message: "操作成功", data: { originalName, path, fileName, size, uploadTime, url }, success: true }
    let avatarData;
    
    if (response && typeof response === 'object') {
      // 如果response已经是对象，直接使用
      if (response.success || response.code === 200) {
        // 标准格式：response.data包含上传信息
        avatarData = response.data || response;
      } else {
        // 非标准格式，直接使用response
        avatarData = response;
      }
    } else {
      // 如果response是字符串或其他类型，包装成对象
      avatarData = response;
    }
    
    // 返回标准化格式
    return {
      success: true,
      code: 200,
      message: '上传成功',
      data: avatarData
    };
  } catch (error) {
    console.error('头像上传失败:', error);
    // 返回错误格式
    return {
      success: false,
      code: error.code || 500,
      message: error.message || '上传失败',
      data: null
    };
  }
}

module.exports = {
  uploadFile,
  uploadAvatar,
  chooseAndUploadImage,
  chooseAndUploadFile,
  deleteFile
};
