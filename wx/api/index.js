// API统一导出文件
const userApi = require('./user.js');
const emailApi = require('./email.js');
const laboratoryApi = require('./laboratory.js');
const timeslotApi = require('./timeslot.js');
const reservationApi = require('./reservation.js');
const messageApi = require('./message.js');
const fileApi = require('./file.js');
const wechatApi = require('./wechat.js');

module.exports = {
  // 用户相关
  user: userApi,
  
  // 邮箱验证相关
  email: emailApi,
  
  // 实验室相关
  laboratory: laboratoryApi,
  
  // 时间段相关
  timeslot: timeslotApi,
  
  // 预约相关
  reservation: reservationApi,
  
  // 消息相关
  message: messageApi,
  
  // 文件上传相关
  file: fileApi,
  
  // 微信登录相关
  wechat: wechatApi
};
