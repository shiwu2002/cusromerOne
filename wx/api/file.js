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

module.exports = {
  uploadFile,
  chooseAndUploadImage,
  chooseAndUploadFile,
  deleteFile
};
