# API 更新日志

## 📋 更新日期
2026-03-09

## 🎯 更新目标
根据后端 API 文档 v2.0，完善前端用户界面的 API接口实现（不包含数据大屏接口）。

---

## ✅ 已完成的功能

### 1. 新增信誉分系统 API (`api/credit.js`)

新增了完整的信誉分系统功能模块：

```javascript
// 获取当前用户的信誉分
API.credit.getMyCredit()

// 获取信誉分记录（分页）
API.credit.getMyCreditLogs({ page: 1, pageSize: 10 })

// 参加培训恢复信誉分
API.credit.trainingRecover()

// 获取信誉分规则
API.credit.getCreditRules()
```

**对应后端接口**：
- `GET /api/credit/my` - 我的信誉分
- `GET /api/credit/my/logs` - 信誉分记录
- `POST /api/credit/training/recover` - 培训恢复分数
- `GET /api/credit/rules` - 信誉分规则

---

### 2. 补充实验室统计接口 (`api/laboratory.js`)

新增方法：
```javascript
// 获取实验室统计信息
API.laboratory.getStatistics()
```

**对应后端接口**：
- `GET /api/laboratory/statistics` - 实验室统计

---

### 3. 补充时间段统计接口 (`api/timeslot.js`)

新增方法：
```javascript
// 获取时间段统计信息
API.timeslot.getStatistics()
```

**对应后端接口**：
- `GET /api/timeslot/statistics` - 时间段统计

---

### 4. 优化邮箱验证码默认用途 (`api/email.js`)

修改了 `sendCode` 方法的默认 purpose 参数：
- 从 `'verify'` 改为 `'reset-password'`
- 更符合实际使用场景

---

### 5. 统一 API 导出 (`api/index.js`)

在 API 总入口中添加了信誉分模块：

```javascript
module.exports = {
  user: userApi,      // 用户管理
  email: emailApi,    // 邮箱验证
  laboratory: laboratoryApi,  // 实验室查询
  timeslot: timeslotApi,      // 时间段查询
  reservation: reservationApi, // 预约管理
  message: messageApi,         // 消息中心
  file: fileApi,               // 文件上传
  wechat: wechatApi,           // 微信登录
  credit: creditApi            // 信誉分系统 ⭐ 新增
};
```

---

## 📊 完整接口清单

### 用户管理 (user.js) - 12 个方法 ✅
- ✅ `login()` - 用户登录
- ✅ `register()` - 用户注册
- ✅ `logout()` - 退出登录
- ✅ `getUserInfo()` - 获取用户信息
- ✅ `updateUserInfo()` - 更新用户信息
- ✅ `changeAdminPassword()` - 修改密码
- ✅ `resetPasswordByEmail()` - 邮箱重置密码
- ✅ `getProfile()` - 获取当前用户信息
- ✅ `updateProfile()` - 更新当前用户信息
- ✅ `changePassword()` - 修改密码（当前用户）
- ✅ `getUserStatistics()` - 用户预约统计
- ✅ `getCurrentUser()` - 获取当前登录用户信息
- ✅ `isLoggedIn()` - 检查是否已登录

### 邮箱验证 (email.js) - 5 个方法 ✅
- ✅ `sendRegisterEmail()` - 发送注册验证邮件
- ✅ `verifyEmail()` - 验证邮箱注册 token
- ✅ `sendCode()` - 发送验证码邮件
- ✅ `verifyCode()` - 验证验证码
- ✅ `bindEmail()` - 绑定邮箱

### 实验室查询 (laboratory.js) - 8 个方法 ✅
- ✅ `getLaboratoryDetail()` - 查询实验室详情
- ✅ `getAllLaboratories()` - 查询所有实验室
- ✅ `getAvailableLaboratories()` - 查询可用实验室
- ✅ `getLaboratoriesByType()` - 按类型查询
- ✅ `getLaboratoriesByStatus()` - 按状态查询
- ✅ `searchLaboratories()` - 搜索实验室
- ✅ `getLaboratoriesByCapacity()` - 按容量查询
- ✅ `getStatistics()` - 实验室统计 ⭐ 新增

### 时间段查询 (timeslot.js) - 6 个方法 ✅
- ✅ `getAllTimeSlots()` - 查询所有时间段
- ✅ `getEnabledTimeSlots()` - 查询启用的时间段
- ✅ `getTimeSlotsByStatus()` - 按状态查询
- ✅ `getTimeSlotDetail()` - 查询时间段详情
- ✅ `getAvailableTimeslots()` - 查询可用时间段
- ✅ `getStatistics()` - 时间段统计 ⭐ 新增

### 预约管理 (reservation.js) - 15 个方法 ✅
- ✅ `createReservation()` - 创建预约
- ✅ `getReservationDetail()` - 查询预约详情
- ✅ `getAllReservations()` - 查询所有预约
- ✅ `getUserReservations()` - 查询某用户的预约
- ✅ `getMyReservations()` - 我的预约列表
- ✅ `getLabReservations()` - 某实验室的预约
- ✅ `getReservationsByStatus()` - 按状态查询
- ✅ `getPendingReservations()` - 待审核预约
- ✅ `cancelReservation()` - 取消预约
- ✅ `completeReservation()` - 完成预约
- ✅ `checkConflict()` - 检查时间冲突
- ✅ `getReservationStatistics()` - 预约统计
- ✅ `getReservationsByDateRange()` - 日期范围查询
- ✅ `getLabSchedule()` - 实验室日程

### 消息中心 (message.js) - 17 个方法 ✅
- ✅ `sendMessage()` - 发送用户消息
- ✅ `getAllMessages()` - 获取所有消息
- ✅ `getUnreadMessages()` - 获取未读消息
- ✅ `getUnreadCount()` - 获取未读消息数量
- ✅ `getMessagesByType()` - 按类型获取消息
- ✅ `getUnreadCountByTypes()` - 各类型未读数量
- ✅ `getMessageDetail()` - 消息详情
- ✅ `markAsRead()` - 标记单条已读
- ✅ `batchMarkAsRead()` - 批量标记已读
- ✅ `markAllAsRead()` - 全部标记已读
- ✅ `deleteMessage()` - 删除消息
- ✅ `batchDeleteMessages()` - 批量删除
- ✅ `getSentMessages()` - 我发送的消息
- ✅ `getMessagesByPage()` - 分页获取消息
- ✅ `getMessages()` - 消息列表（兼容接口）
- ✅ `getMessagesByPriority()` - 按优先级获取
- ✅ `getHighPriorityUnreadMessages()` - 高优先级未读

### 信誉分系统 (credit.js) - 4 个方法 ⭐ 新增
- ✅ `getMyCredit()` - 我的信誉分
- ✅ `getMyCreditLogs()` - 信誉分记录
- ✅ `trainingRecover()` - 培训恢复分数
- ✅ `getCreditRules()` - 信誉分规则

### 文件上传 (file.js) - 2 个方法 ✅
- ✅ `upload()` - 上传单个文件
- ✅ `uploadBatch()` - 批量上传（管理员）

### 微信登录 (wechat.js) - 2 个方法 ✅
- ✅ `wxLogin()` - 微信小程序登录
- ✅ `getWxAccessToken()` - 获取微信 access_token

---

## 📈 统计信息

| 模块 | 方法数 | 状态 |
|------|--------|------|
| 用户管理 | 13 | ✅ 完整 |
| 邮箱验证 | 5 | ✅ 完整 |
| 实验室查询 | 8 | ✅ 完整 |
| 时间段查询 | 6 | ✅ 完整 |
| 预约管理 | 15 | ✅ 完整 |
| 消息中心 | 17 | ✅ 完整 |
| 信誉分系统 | 4 | ✅ 新增 |
| 文件上传 | 2 | ✅ 完整 |
| 微信登录 | 2 | ✅ 完整 |
| **总计** | **72** | **✅ 用户界面接口全覆盖** |

---

## 🎯 使用说明

### 在页面中使用示例

```javascript
const API = require('../../api/index.js');

// 1. 获取用户信誉分
API.credit.getMyCredit().then(res => {
  console.log('信誉分:', res.data);
});

// 2. 获取实验室统计
API.laboratory.getStatistics().then(res => {
  console.log('实验室统计:', res.data);
});

// 3. 获取时间段统计
API.timeslot.getStatistics().then(res => {
  console.log('时间段统计:', res.data);
});

// 4. 参加培训恢复分数
API.credit.trainingRecover().then(res => {
  console.log('恢复成功:', res.data);
});
```

---

## ⚠️ 注意事项

1. **数据大屏接口未实现**：按照要求，`/api/dashboard/*` 系列接口未在用户界面实现
2. **管理员专用接口未实现**：管理后台专用接口未在用户端实现
3. **token 自动管理**：所有需要登录的接口会自动携带 JWT Token
4. **错误统一处理**：请求失败时会自动显示 toast 提示
5. **401 自动跳转**：未登录或 token 过期会自动跳转到登录页

---

## 🔄 后续计划

如需实现以下功能，请参考 API 文档添加：

1. **数据大屏展示**（如需要面向公众展示）
   - 核心指标、预约趋势、实验室利用率等 12 个接口
   
2. **管理员功能**（如需要管理后台）
   - 用户管理、实验室管理、预约审核等 26 个接口

---

**更新完成时间**: 2026-03-09  
**版本**: v2.0  
**状态**: ✅ 用户界面接口已全部实现
