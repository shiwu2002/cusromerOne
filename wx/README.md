# 微信小程序实验室预约系统 - API接口实现

本项目基于接口文档完整实现了微信小程序端的所有API调用功能。

## 📋 项目概述

这是一个完整的微信小程序API封装库，实现了实验室预约管理系统的所有前端接口调用功能，包括：

- ✅ 用户认证与管理
- ✅ 邮箱验证
- ✅ 实验室查询
- ✅ 时间段管理
- ✅ 预约管理
- ✅ 站内消息
- ✅ 文件上传

## 🚀 快速开始

### 1. 配置后端地址

修改 `utils/request.js` 中的 `BASE_URL`：

```javascript
const BASE_URL = 'https://your-domain.com/api'; // 修改为你的后端地址
```

### 2. 在页面中使用

```javascript
const { user, laboratory, reservation } = require('../../api/index.js');

Page({
  async onLoad() {
    // 获取实验室列表
    const labs = await laboratory.getAvailableLaboratories();
    this.setData({ labs });
  }
});
```

## 📂 项目结构

```
├── api/                          # API接口目录
│   ├── index.js                 # 统一导出（使用此文件导入所有API）
│   ├── user.js                  # 用户认证API (11个方法)
│   ├── email.js                 # 邮箱验证API (5个方法)
│   ├── laboratory.js            # 实验室API (7个方法)
│   ├── timeslot.js              # 时间段API (4个方法)
│   ├── reservation.js           # 预约API (13个方法)
│   ├── message.js               # 消息API (15个方法)
│   └── file.js                  # 文件上传API (4个方法)
├── utils/
│   └── request.js               # 统一请求封装工具
├── API_USAGE.md                 # 详细使用文档
├── MINI_PROGRAM_API.md          # 后端接口文档
└── README.md                    # 本文件
```

## 🔧 核心功能

### 1. 统一请求封装 (`utils/request.js`)

- ✅ 自动添加Authorization头
- ✅ 统一错误处理
- ✅ 自动token管理
- ✅ 401自动跳转登录
- ✅ 支持GET/POST/PUT/DELETE/文件上传

### 2. 用户模块 (`api/user.js`)

```javascript
const { user } = require('../../api/index.js');

// 登录
await user.login('username', 'password');

// 注册
await user.register({ username, password, realName, email });

// 退出
user.logout();

// 获取当前用户
const currentUser = user.getCurrentUser();

// 检查登录状态
if (user.isLoggedIn()) { ... }
```

### 3. 实验室模块 (`api/laboratory.js`)

```javascript
const { laboratory } = require('../../api/index.js');

// 获取可用实验室
const labs = await laboratory.getAvailableLaboratories();

// 搜索实验室
const results = await laboratory.searchLaboratories({
  keyword: '计算机',
  labType: 'computer',
  status: 1
});
```

### 4. 预约模块 (`api/reservation.js`)

```javascript
const { reservation } = require('../../api/index.js');

// 检查时间冲突
await reservation.checkConflict(labId, date, timeSlot);

// 创建预约
await reservation.createReservation({
  userId, labId, reserveDate, timeSlot
});

// 取消预约
await reservation.cancelReservation(reservationId);

// 完成预约
await reservation.completeReservation(reservationId, feedback);
```

### 5. 消息模块 (`api/message.js`)

```javascript
const { message } = require('../../api/index.js');

// 获取未读数量
const count = await message.getUnreadCount();

// 获取消息列表
const messages = await message.getAllMessages();

// 标记已读
await message.markAsRead(messageId);
```

### 6. 文件上传 (`api/file.js`)

```javascript
const { file } = require('../../api/index.js');

// 选择并上传头像
const result = await file.chooseAndUploadImage('avatar', 1);

// 上传文档
const doc = await file.chooseAndUploadFile('document');
```

## 📖 接口统计

| 模块 | 接口数量 | 说明 |
|------|---------|------|
| 用户认证 | 11 | 登录、注册、修改密码等 |
| 邮箱验证 | 5 | 发送验证码、验证、绑定邮箱 |
| 实验室 | 7 | 查询、搜索、按条件过滤 |
| 时间段 | 4 | 查询所有、启用的时间段 |
| 预约 | 13 | 创建、查询、取消、完成、统计 |
| 消息 | 15 | 发送、接收、标记已读、删除 |
| 文件上传 | 4 | 上传头像、实验室图片、文档 |
| **合计** | **59** | **完整覆盖所有后端接口** |

## ✨ 特性

1. **完整的接口覆盖**：实现了接口文档中的所有59个接口
2. **统一的错误处理**：网络错误和业务错误自动提示
3. **自动token管理**：登录后自动保存和携带token
4. **类型安全**：完整的JSDoc注释
5. **便捷的文件上传**：封装了选择和上传的完整流程
6. **模块化设计**：按功能模块组织，易于维护
7. **详细的文档**：提供完整的使用示例和业务流程

## 📚 文档

- [API使用文档](./API_USAGE.md) - 包含所有接口的详细使用示例
- [后端接口文档](./MINI_PROGRAM_API.md) - 后端接口规范

## 💡 使用示例

### 完整的登录流程

```javascript
const { user } = require('../../api/index.js');

Page({
  data: {
    username: '',
    password: ''
  },
  
  async handleLogin() {
    const { username, password } = this.data;
    
    try {
      const result = await user.login(username, password);
      console.log('登录成功', result);
      
      wx.switchTab({
        url: '/pages/index/index'
      });
    } catch (error) {
      // 错误已自动提示
      console.error('登录失败', error);
    }
  }
});
```

### 完整的预约流程

```javascript
const { user, laboratory, timeslot, reservation } = require('../../api/index.js');

Page({
  data: {
    laboratories: [],
    timeSlots: [],
    selectedLab: null,
    selectedDate: '',
    selectedTimeSlot: ''
  },
  
  async onLoad() {
    // 检查登录
    if (!user.isLoggedIn()) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    
    // 加载数据
    const labs = await laboratory.getAvailableLaboratories();
    const slots = await timeslot.getEnabledTimeSlots();
    
    this.setData({ 
      laboratories: labs,
      timeSlots: slots 
    });
  },
  
  async handleSubmit() {
    const { selectedLab, selectedDate, selectedTimeSlot } = this.data;
    const currentUser = user.getCurrentUser();
    
    // 检查冲突
    await reservation.checkConflict(
      selectedLab.id,
      selectedDate,
      selectedTimeSlot
    );
    
    // 创建预约
    await reservation.createReservation({
      userId: currentUser.userId,
      labId: selectedLab.id,
      reserveDate: selectedDate,
      timeSlot: selectedTimeSlot
    });
    
    wx.showToast({ title: '预约成功', icon: 'success' });
  }
});
```

## 🔐 权限说明

- 大部分接口需要登录后才能调用（自动携带token）
- 部分管理接口需要管理员权限（userType >= 2）
- 文件删除等操作需要管理员权限

## ⚙️ 配置项

### 请求超时时间

微信小程序默认超时时间为60秒，如需修改可在 `utils/request.js` 中的 `wx.request` 配置中添加 `timeout` 参数。

### 环境切换

建议创建 `utils/config.js` 管理不同环境：

```javascript
const env = 'production'; // 'development' | 'production'

const config = {
  development: {
    baseURL: 'http://localhost:8080/api'
  },
  production: {
    baseURL: 'https://api.yourdomain.com/api'
  }
};

module.exports = config[env];
```

## 🐛 错误处理

所有接口调用建议使用 try-catch：

```javascript
try {
  const result = await api.someMethod();
  // 处理成功
} catch (error) {
  // 错误已自动toast提示
  console.error('操作失败', error);
}
```

## 📝 注意事项

1. **日期格式**：所有日期必须使用 `yyyy-MM-dd` 格式
2. **文件大小**：单文件最大10MB
3. **登录状态**：需要登录的页面应在 `onLoad` 检查登录状态
4. **Token管理**：登录后token自动保存，退出自动清除
5. **域名配置**：生产环境需在微信公众平台配置合法域名

## 🚀 部署清单

- [ ] 修改 `utils/request.js` 中的 `BASE_URL` 为生产环境地址
- [ ] 在微信公众平台配置后端域名为合法域名
- [ ] 确保后端服务器已开启HTTPS
- [ ] 测试所有关键业务流程
- [ ] 配置小程序版本号

## 📄 许可证

本项目仅供学习和参考使用。

## 👨‍💻 开发者

本API封装库基于后端接口文档完整实现，涵盖所有功能模块。

---

**最后更新时间**: 2026-01-14

如有问题，请查阅 [API_USAGE.md](./API_USAGE.md) 获取详细使用说明。
