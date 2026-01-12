import request from '@/utils/request'

// 文件管理API

// 上传文件
export const uploadFile = (formData) => {
  return request({
    url: '/api/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 批量上传
export const uploadBatch = (formData) => {
  return request({
    url: '/api/file/upload-batch',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除文件
export const deleteFile = (path) => {
  return request({
    url: '/api/file/delete',
    method: 'delete',
    params: { path }
  })
}
