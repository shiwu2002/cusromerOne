# API 使用说明

本文档说明如何在微信小程序中使用已封装的API接口。

## 目录结构

```
├── api/                    # API接口目录
│   ├── index.js           # 统一导出文件
│   ├── user.js            # 用户认证API
│   ├── email.js           # 邮箱验证API
│   ├── laboratory.js      # 实验室API
│   ├── timeslot.js        # 时间段API
│   ├── reservation.js     # 预约API
│   ├── message.js         # 消息API
│   └── file.js            # 文件上传API
├── utils/
│   └── request.js         # 统一请求封装
└── API_USAGE.md           # 本文档
```

## 配置说明

### 1. 修改后端地址

在 `utils/request.js` 中修改 `BASE_URL`：

```javascript
const BASE_URL = 'https://your-domain.com/api'; // 修改为你的后端地址
```

### 2. 配置小程序合法域名

在微信公众平台的"开发"-"开发管理"-"开发设置"中，将后端服务器域名添加到 request 合法域名。

## 使用方法

### 方式一：按需引入（推荐）

```javascript
// 在页面或组件中引入需要的API模块
const { user, laboratory, reservation } = require('../../api/index.js');

// 使用API
Page({
  data: {},
  
  onLoad() {
    this.loadData();
  },
  
  async loadData() {
    try {
      // 获取实验室列表
      const labs = await laboratory.getAvailableLaboratories();
      this.setData({ labs });
    } catch (error) {
      console.error('加载失败', error);
    }
  }
});
```

### 方式二：全局引入

在 `app.js` 中：

```javascript
const api = require('./api/index.js');

App({
  globalData: {
    api: api
  }
});
```

在页面中使用：

```javascript
const app = getApp();

Page({
  data: {},
  
  async loadData() {
    const labs = await app.globalData.api.laboratory.getAvailableLaboratories();
  }
});
```

## API 使用示例

### 1. 用户认证模块

#### 登录

```javascript
const { user } = require('../../api/index.js');

// 登录
async function handleLogin() {
  try {
    const result = await user.login('username', 'password');
    console.log('登录成功', result);
    // token和用户信息已自动保存
    wx.switchTab({
      url: '/pages/index/index'
    });
  } catch (error) {
    console.error('登录失败', error);
  }
}
```

#### 注册

```javascript
async function handleRegister() {
  try {
    await user.register({
      username: 'testuser',
      password: 'password123',
      realName: '张三',
      email: 'test@example.com',
      userType: 0
    });
    wx.showToast({
      title: '注册成功',
      icon: 'success'
    });
  } catch (error) {
    console.error('注册失败', error);
  }
}
```

#### 修改密码

```javascript
async function handleChangePassword() {
  const currentUser = user.getCurrentUser();
  try {
    await user.changePassword(
      currentUser.userId,
      'oldPassword',
      'newPassword'
    );
    wx.showToast({
      title: '密码修改成功',
      icon: 'success'
    });
  } catch (error) {
    console.error('修改失败', error);
  }
}
```

#### 退出登录

```javascript
function handleLogout() {
  user.logout();
  wx.reLaunch({
    url: '/pages/login/login'
  });
}
```

### 2. 邮箱验证模块

#### 发送验证码

```javascript
const { email } = require('../../api/index.js');

async function sendVerificationCode() {
  try {
    await email.sendCode('user@example.com', 'register');
    wx.showToast({
      title: '验证码已发送',
      icon: 'success'
    });
    // 启动倒计时
    this.startCountDown();
  } catch (error) {
    console.error('发送失败', error);
  }
}
```

#### 验证验证码

```javascript
async function verifyCode() {
  try {
    await email.verifyCode('user@example.com', '123456');
    wx.showToast({
      title: '验证成功',
      icon: 'success'
    });
  } catch (error) {
    console.error('验证失败', error);
  }
}
```

### 3. 实验室模块

#### 获取可用实验室列表

```javascript
const { laboratory } = require('../../api/index.js');

Page({
  data: {
    laboratories: []
  },
  
  async onLoad() {
    try {
      const labs = await laboratory.getAvailableLaboratories();
      this.setData({ laboratories: labs });
    } catch (error) {
      console.error('加载失败', error);
    }
  }
});
```

#### 搜索实验室

```javascript
async function searchLabs() {
  try {
    const labs = await laboratory.searchLaboratories({
      keyword: '实验室',
      labType: 'computer',
      status: 1
    });
    this.setData({ laboratories: labs });
  } catch (error) {
    console.error('搜索失败', error);
  }
}
```

### 4. 预约模块

#### 创建预约

```javascript
const { reservation, user } = require('../../api/index.js');

async function createReservation() {
  const currentUser = user.getCurrentUser();
  
  // 先检查时间冲突
  try {
    await reservation.checkConflict(
      labId,
      '2026-01-15',
      '08:00-10:00'
    );
    
    // 无冲突，创建预约
    const result = await reservation.createReservation({
      userId: currentUser.userId,
      labId: labId,
      reserveDate: '2026-01-15',
      timeSlot: '08:00-10:00'
    });
    
    wx.showToast({
      title: '预约成功',
      icon: 'success'
    });
  } catch (error) {
    console.error('预约失败', error);
  }
}
```

#### 查询我的预约

```javascript
async function loadMyReservations() {
  const currentUser = user.getCurrentUser();
  try {
    const list = await reservation.getUserReservations(currentUser.userId);
    this.setData({ reservations: list });
  } catch (error) {
    console.error('加载失败', error);
  }
}
```

#### 取消预约

```javascript
async function cancelReservation(reservationId) {
  try {
    await reservation.cancelReservation(reservationId);
    wx.showToast({
      title: '已取消预约',
      icon: 'success'
    });
    // 刷新列表
    this.loadMyReservations();
  } catch (error) {
    console.error('取消失败', error);
  }
}
```

#### 完成预约

```javascript
async function completeReservation(reservationId) {
  try {
    await reservation.completeReservation(reservationId, '实验顺利完成');
    wx.showToast({
      title: '已完成',
      icon: 'success'
    });
  } catch (error) {
    console.error('操作失败', error);
  }
}
```

#### 查询实验室日程

```javascript
async function loadLabSchedule(labId, date) {
  try {
    const schedule = await reservation.getLabSchedule(labId, date);
    this.setData({ schedule });
  } catch (error) {
    console.error('加载失败', error);
  }
}
```

### 5. 消息模块

#### 获取未读消息数量

```javascript
const { message } = require('../../api/index.js');

Page({
  data: {
    unreadCount: 0
  },
  
  async onShow() {
    try {
      const count = await message.getUnreadCount();
      this.setData({ unreadCount: count });
    } catch (error) {
      console.error('获取失败', error);
    }
  }
});
```

#### 获取消息列表

```javascript
async function loadMessages() {
  try {
    const messages = await message.getAllMessages();
    this.setData({ messages });
  } catch (error) {
    console.error('加载失败', error);
  }
}
```

#### 查看消息详情

```javascript
async function viewMessage(messageId) {
  try {
    // 自动标记为已读
    const detail = await message.getMessageDetail(messageId);
    this.setData({ currentMessage: detail });
  } catch (error) {
    console.error('加载失败', error);
  }
}
```

#### 标记所有消息为已读

```javascript
async function markAllRead() {
  try {
    await message.markAllAsRead();
    wx.showToast({
      title: '已全部标记为已读',
      icon: 'success'
    });
    // 刷新列表
    this.loadMessages();
  } catch (error) {
    console.error('操作失败', error);
  }
}
```

### 6. 文件上传模块

#### 上传头像

```javascript
const { file } = require('../../api/index.js');

async function uploadAvatar() {
  try {
    const result = await file.chooseAndUploadImage('avatar', 1);
    console.log('上传成功', result.url);
    
    // 更新用户头像
    // ... 调用更新用户信息接口
    
  } catch (error) {
    console.error('上传失败', error);
  }
}
```

#### 上传实验室图片

```javascript
async function uploadLabImage() {
  try {
    const result = await file.chooseAndUploadImage('lab', 1);
    this.setData({ labImageUrl: result.url });
  } catch (error) {
    console.error('上传失败', error);
  }
}
```

#### 上传文档

```javascript
async function uploadDocument() {
  try {
    const result = await file.chooseAndUploadFile('document');
    console.log('文档上传成功', result.url);
  } catch (error) {
    console.error('上传失败', error);
  }
}
```

## 完整业务流程示例

### 预约流程

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
    // 1. 检查登录状态
    if (!user.isLoggedIn()) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
      return;
    }
    
    // 2. 加载实验室列表
    await this.loadLaboratories();
    
    // 3. 加载时间段列表
    await this.loadTimeSlots();
  },
  
  async loadLaboratories() {
    try {
      const labs = await laboratory.getAvailableLaboratories();
      this.setData({ laboratories: labs });
    } catch (error) {
      wx.showToast({
        title: '加载实验室失败',
        icon: 'none'
      });
    }
  },
  
  async loadTimeSlots() {
    try {
      const slots = await timeslot.getEnabledTimeSlots();
      this.setData({ timeSlots: slots });
    } catch (error) {
      wx.showToast({
        title: '加载时间段失败',
        icon: 'none'
      });
    }
  },
  
  async handleSubmit() {
    const { selectedLab, selectedDate, selectedTimeSlot } = this.data;
    
    // 4. 验证表单
    if (!selectedLab || !selectedDate || !selectedTimeSlot) {
      wx.showToast({
        title: '请完善信息',
        icon: 'none'
      });
      return;
    }
    
    // 5. 检查时间冲突
    try {
      await reservation.checkConflict(
        selectedLab.id,
        selectedDate,
        selectedTimeSlot
      );
    } catch (error) {
      wx.showToast({
        title: '该时间段已被预约',
        icon: 'none'
      });
      return;
    }
    
    // 6. 创建预约
    try {
      const currentUser = user.getCurrentUser();
      await reservation.createReservation({
        userId: currentUser.userId,
        labId: selectedLab.id,
        reserveDate: selectedDate,
        timeSlot: selectedTimeSlot
      });
      
      wx.showToast({
        title: '预约成功',
        icon: 'success'
      });
      
      // 7. 跳转到我的预约页面
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/my-reservations/my-reservations'
        });
      }, 1500);
      
    } catch (error) {
      wx.showToast({
        title: '预约失败',
        icon: 'none'
      });
    }
  }
});
```

## 错误处理

所有API调用都建议使用 try-catch 进行错误处理：

```javascript
try {
  const result = await api.someMethod();
  // 处理成功结果
} catch (error) {
  // 错误已经在 request.js 中统一处理并显示toast
  // 这里可以做额外的错误处理，如日志记录
  console.error('操作失败', error);
}
```

## 注意事项

1. **登录状态检查**：需要登录的页面应在 `onLoad` 中检查登录状态
2. **Token管理**：登录成功后token会自动保存，退出登录会自动清除
3. **错误提示**：网络错误和业务错误已在 `request.js` 中统一处理
4. **日期格式**：所有日期必须使用 `yyyy-MM-dd` 格式
5. **文件上传**：单文件最大10MB，注意文件类型限制
6. **权限控制**：某些接口需要特定权限，前端应根据用户类型显示/隐藏相应功能

## 开发建议

1. 使用 async/await 处理异步操作，代码更清晰
2. 在页面 onShow 时刷新数据，确保数据最新
3. 适当使用加载提示，提升用户体验
4. 关键操作前进行二次确认
5. 做好表单验证，减少不必要的网络请求

## 生产环境配置

部署到生产环境前，需要：

1. 修改 `utils/request.js` 中的 `BASE_URL` 为生产环境地址
2. 在微信公众平台配置生产环境域名
3. 开启小程序的 HTTPS 要求
4. 建议使用环境变量管理不同环境的配置

```javascript
// utils/config.js
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

然后在 `request.js` 中引用：

```javascript
const config = require('./config.js');
const BASE_URL = config.baseURL;
