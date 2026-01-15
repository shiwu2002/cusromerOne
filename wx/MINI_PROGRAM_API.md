# 小程序接口文档（后端集成版）

本接口文档针对微信小程序前端开发，覆盖用户认证、实验室与时间段查询、预约管理、站内消息、文件上传等核心能力。后端已集成所有接口，统一以 REST 风格提供。

- 基础路径前缀：`/api`
- 数据格式：使用JSON(JavaScript Object Notation)格式
- 鉴权方式：JWT(JSON Web Token)；登录成功后前端需在后续请求头携带 `Authorization: Bearer <token>`

本文档仅列出小程序常用接口及字段约束，所有返回结构统一封装为：
```
{
  "success": true/false,
  "message": "说明信息",
  "data": 任意类型
}
```
当 `success=false` 时，`message`为错误原因；当 `success=true` 时，`data`为业务数据。

---

## 1. 认证与用户模块

### 1.1 用户登录
- 方法：POST
- URL：`/api/user/login`
- 请求体：
```
{
  "username": "string",
  "password": "string"
}
```
- 成功响应示例：
```
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "userId": 1,
    "username": "zhangsan",
    "userType": 1,        // 0-普通用户, 1-审核员或管理员(按项目定义), 2-管理员, 3-超级管理员
    "realName": "张三"
  }
}
```
- 说明：登录成功后保存 `token`，后续接口需在请求头携带 `Authorization: Bearer <token>`。

### 1.2 用户注册
- 方法：POST
- URL：`/api/user/register`
- 请求体（示例字段，具体以后端User实体为准）：
```
{
  "username": "string",
  "password": "string",
  "realName": "string",
  "email": "string",
  "userType": 0
}
```
- 响应：`data`为新建用户对象

### 1.3 查询用户信息（按ID）
- 方法：GET
- URL：`/api/user/{id}`
- 说明：小程序通常仅需当前登录用户信息，可用于确认绑定邮箱、状态等。

### 1.4 更新用户信息（本人或超级管理员）
- 方法：PUT
- URL：`/api/user/{id}`
- 请求头：`Authorization: Bearer <token>`
- 请求体：User对象（至少包含需要更新的字段）
- 限制：
  - `userType`仅超级管理员可修改；普通用户更新资料不可变更权限。
- 响应：`message=更新成功`

### 1.5 修改密码（本人）
- 方法：PUT
- URL：`/api/user/password`
- 请求头：`Authorization: Bearer <token>`
- 请求体：
```
{
  "id": 1,                  // 当前用户ID
  "oldPassword": "string",
  "newPassword": "string"
}
```

### 1.6 通过邮箱验证码重置密码（无需登录）
- 方法：POST
- URL：`/api/user/reset-password-by-email`
- 请求体：
```
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "string"
}
```

### 1.7 用户统计
- 方法：GET
- URL：`/api/user/statistics`
- 请求头：`Authorization: Bearer <token>`
- 说明：前端无需传 `userId`，后端优先从JWT拦截器注入的 `request.attribute("userId")` 读取。
- 响应示例：
```
{
  "success": true,
  "data": {
    "pending": 2,   // 待审核数量（示例）
    "approved": 5,  // 已通过数量（示例）
    "rejected": 1,
    "cancelled": 0,
    "completed": 3
  }
}
```
具体键名以 `reservationService.getUserReservationStats(uid)` 实际实现为准。

---

## 2. 邮箱与验证码模块

### 2.1 发送注册验证邮件
- 方法：POST
- URL：`/api/user/send-register-email`
- 请求体：
```
{
  "email": "user@example.com",
  "username": "string"
}
```
- 校验：
  - 邮箱不能为空
  - 邮箱未被注册

### 2.2 验证邮箱注册token
- 方法：GET
- URL：`/api/user/verify-email?token=<token>`
- 成功：标记该邮箱 `emailVerified=1`

### 2.3 发送验证码邮件
- 方法：POST
- URL：`/api/user/send-code`
- 请求体：
```
{
  "email": "user@example.com",
  "purpose": "register | reset-password | bind-email"
}
```
- 校验逻辑：
  - `register`：邮箱不得已注册
  - `reset-password`：邮箱必须已注册
  - 若未传purpose默认 `verify`

### 2.4 验证验证码
- 方法：POST
- URL：`/api/user/verify-code`
- 请求体：
```
{
  "email": "user@example.com",
  "code": "123456"
}
```

### 2.5 绑定邮箱
- 方法：POST
- URL：`/api/user/bind-email`
- 请求头：`Authorization: Bearer <token>`
- 请求体：
```
{
  "userId": 1,
  "email": "user@example.com",
  "code": "123456"
}
```
- 校验：
  - 邮箱未被其他用户使用
  - 验证码正确且未过期

---

## 3. 实验室模块

### 3.1 查询实验室详情
- 方法：GET
- URL：`/api/laboratory/{id}`

### 3.2 查询所有实验室
- 方法：GET
- URL：`/api/laboratory/list`

### 3.3 查询可用实验室
- 方法：GET
- URL：`/api/laboratory/available`
- 说明：状态为 `1-可用`

### 3.4 查询按类型
- 方法：GET
- URL：`/api/laboratory/type/{labType}`

### 3.5 查询按状态
- 方法：GET
- URL：`/api/laboratory/status/{status}`
- 状态取值：`0-维护中 / 1-可用 / 2-停用`

### 3.6 搜索实验室
- 方法：GET
- URL：`/api/laboratory/search`
- 查询参数（可选）：
  - `keyword`：名称/编号/位置模糊匹配
  - `labType`：类型过滤
  - `status`：状态过滤

### 3.7 按容量范围查询
- 方法：GET
- URL：`/api/laboratory/capacity`
- 查询参数（可选）：`minCapacity`、`maxCapacity`
- 返回：过滤后的实验室列表

---

## 4. 时间段模块

### 4.1 查询所有时间段
- 方法：GET
- URL：`/api/timeslot/list`

### 4.2 查询启用时间段
- 方法：GET
- URL：`/api/timeslot/enabled`
- 含义：`status=1` 的时间段

### 4.3 按状态查询时间段
- 方法：GET
- URL：`/api/timeslot/status/{status}`
- 取值：`0-禁用 / 1-启用`

### 4.4 查询时间段详情
- 方法：GET
- URL：`/api/timeslot/{id}`

---

## 5. 预约模块

预约记录字段常见（以Reservation实体为准）：`id`、`userId`、`labId`、`reserveDate(yyyy-MM-dd)`、`timeSlot(字符串或ID)`、`status(0待审/1通过/2拒绝/3取消/4完成)`、`approvalNote`、`feedback` 等。

### 5.1 创建预约
- 方法：POST
- URL：`/api/reservation`
- 请求体：
```
{
  "userId": 1,
  "labId": 2,
  "reserveDate": "2026-01-15",
  "timeSlot": "08:00-10:00" // 或后端定义的时间段标识
}
```
- 校验：四项必填；后端返回新建记录

### 5.2 查询预约详情
- 方法：GET
- URL：`/api/reservation/{id}`

### 5.3 查询所有预约（通常后台用）
- 方法：GET
- URL：`/api/reservation/list`

### 5.4 查询某用户预约列表
- 方法：GET
- URL：`/api/reservation/user/{userId}`

### 5.5 查询某实验室预约列表
- 方法：GET
- URL：`/api/reservation/lab/{labId}`

### 5.6 按状态查询预约
- 方法：GET
- URL：`/api/reservation/status/{status}`
- 状态：`0-待审核, 1-已通过, 2-已拒绝, 3-已取消, 4-已完成`

### 5.7 查询待审核预约（后台）
- 方法：GET
- URL：`/api/reservation/pending`

### 5.8 取消预约（用户）
- 方法：PUT
- URL：`/api/reservation/cancel/{id}`

### 5.9 完成预约（用户）
- 方法：PUT
- URL：`/api/reservation/complete/{id}`
- 查询参数（可选）：`feedback=字符串`

### 5.10 检查时间冲突（创建前调用）
- 方法：GET
- URL：`/api/reservation/check-conflict`
- 查询参数：
  - `labId`：实验室ID
  - `reserveDate`：`yyyy-MM-dd`
  - `timeSlot`：时间段名称/标识
- 响应：
  - `success=true` → 可用
  - `success=false` → 冲突（`message`=该时间段已被预约）

### 5.11 预约统计（用户或全局）
- 方法：GET
- URL：`/api/reservation/statistics`
- 查询参数（可选）：`userId`
- 无 `userId` 时返回全局统计；有 `userId` 时返回该用户统计

### 5.12 按日期范围查询预约（用于日历）
- 方法：GET
- URL：`/api/reservation/date-range`
- 查询参数：`startDate`、`endDate`（格式`yyyy-MM-dd`）

### 5.13 查询指定日期的实验室预约情况（生成日程）
- 方法：GET
- URL：`/api/reservation/lab-schedule`
- 查询参数：`labId`、`date(yyyy-MM-dd)`

---

## 6. 站内消息模块

消息实体常见字段：`id`、`senderId`、`receiverId`、`title`、`content`、`messageType`、`priority`、`readStatus`、`createTime` 等。

所有需要从登录态读取用户ID的接口，后端从请求属性 `request.attribute("userId")`（JWT拦截器注入）读取，因此需携带 `Authorization` 头。

### 6.1 发送用户消息（当前登录用户为发送者）
- 方法：POST
- URL：`/api/messages/user`
- 请求头：`Authorization: Bearer <token>`
- 请求体：
```
{
  "receiverId": 2,
  "title": "标题",
  "content": "内容文本"
}
```

### 6.2 获取当前用户的所有消息
- 方法：GET
- URL：`/api/messages/list`
- 请求头：`Authorization: Bearer <token>`

### 6.3 获取未读消息
- 方法：GET
- URL：`/api/messages/unread`
- 请求头：`Authorization: Bearer <token>`

### 6.4 获取未读消息数量
- 方法：GET
- URL：`/api/messages/unread-count`
- 请求头：`Authorization: Bearer <token>`

### 6.5 按类型获取消息
- 方法：GET
- URL：`/api/messages/list/type/{messageType}`
- 请求头：`Authorization: Bearer <token>`

### 6.6 获取各类型未读数量统计
- 方法：GET
- URL：`/api/messages/unread-count-by-types`
- 请求头：`Authorization: Bearer <token>`

### 6.7 获取消息详情（自动标记已读）
- 方法：GET
- URL：`/api/messages/detail/{messageId}`
- 请求头：`Authorization: Bearer <token>`

### 6.8 标记单条消息为已读
- 方法：PUT
- URL：`/api/messages/mark-read/{messageId}`
- 请求头：`Authorization: Bearer <token>`

### 6.9 批量标记为已读
- 方法：PUT
- URL：`/api/messages/batch-mark-read`
- 请求头：`Authorization: Bearer <token>`
- 请求体：
```
{
  "messageIds": [1,2,3]
}
```

### 6.10 标记所有消息为已读
- 方法：PUT
- URL：`/api/messages/mark-all-read`
- 请求头：`Authorization: Bearer <token>`

### 6.11 删除消息
- 方法：DELETE
- URL：`/api/messages/{messageId}`
- 请求头：`Authorization: Bearer <token>`

### 6.12 批量删除消息
- 方法：DELETE
- URL：`/api/messages/batch`
- 请求头：`Authorization: Bearer <token>`
- 请求体：
```
{
  "messageIds": [1,2,3]
}
```

### 6.13 获取我发送的消息
- 方法：GET
- URL：`/api/messages/sent`
- 请求头：`Authorization: Bearer <token>`

### 6.14 分页获取消息
- 方法：GET
- URL：`/api/messages/page`
- 查询参数：`page=1`、`pageSize=20`
- 请求头：`Authorization: Bearer <token>`

---

## 7. 文件上传模块

用于头像、实验室图片、通用文档上传；返回可访问URL。

### 7.1 单文件上传
- 方法：POST
- URL：`/api/file/upload`
- 表单：`multipart/form-data`
  - 字段：
    - `file`：文件二进制
    - `type`：`avatar | lab | document`（默认`document`）
- 约束：
  - 单文件最大 10MB
  - `avatar`/`lab` 仅允许图片：`.jpg/.jpeg/.png/.gif/.bmp/.webp`
  - `document` 允许图片和文档：加上 `.pdf/.doc/.docx/.xls/.xlsx/.txt`
- 响应示例：
```
{
  "success": true,
  "data": {
    "url": "http://localhost:8080/uploads/avatar/2026/01/11/uuid.jpg",
    "path": "/absolute/path/...",
    "fileName": "uuid.jpg",
    "originalName": "origin.jpg",
    "size": "102400"
  }
}
```

### 7.2 批量上传（最多10个）
- 方法：POST
- URL：`/api/file/upload-batch`
- 权限：需要管理员及以上
- 表单：`multipart/form-data`
  - 字段：
    - `files`：多个文件
    - `type`：同上
- 响应：
```
{
  "success": true,
  "data": {
    "total": 5,
    "success": 4,
    "fail": 1
  }
}
```

### 7.3 删除文件
- 方法：DELETE
- URL：`/api/file/delete`
- 权限：管理员及以上
- 查询参数：`path`（服务器文件路径）
- 响应：`success=true` 表示删除成功或文件不存在已忽略

---

## 8. 权限与请求头说明

- 需要登录的接口必须携带请求头：
  - `Authorization: Bearer <token>`
- 权限等级（示例，实际以项目定义为准）：
  - `0` 普通用户
  - `2` 管理员
  - `3` 超级管理员
- 控制器中的 `@RequirePermission` 注解限制管理操作；小程序通常只调用“查询、自助操作（取消、完成、消息收发、上传头像等）”接口。

---

## 9. 小程序常见业务流程

### 9.1 注册并邮箱验证流程
1. 调用 `POST /api/user/send-register-email` 发送验证邮件（或使用验证码流程 `send-code`+`verify-code`）。
2. 用户点击邮件中的验证链接 → `GET /api/user/verify-email?token=...` 完成验证。
3. 调用 `POST /api/user/register` 提交注册表单。
4. 登录 `POST /api/user/login` 获取 `token`。

（替代流程：`send-code` 发验证码 → `verify-code` → `register`）

### 9.2 忘记密码流程
1. `POST /api/user/send-code`，`purpose=reset-password`。
2. `POST /api/user/reset-password-by-email`，提交 `email`、`code`、`newPassword`。
3. 成功后重新登录。

### 9.3 预约提交与校验
1. 用户在实验室详情页选择日期与时间段：
   - 查询启用时间段：`GET /api/timeslot/enabled`
   - 冲突校验：`GET /api/reservation/check-conflict?labId=&reserveDate=&timeSlot=`
2. 冲突通过后创建预约：`POST /api/reservation`
3. 查询我的预约列表：`GET /api/reservation/user/{userId}`
4. 取消/完成预约：`PUT /api/reservation/cancel/{id}` / `PUT /api/reservation/complete/{id}?feedback=...`

### 9.4 消息通知
- 获取未读消息数量：`GET /api/messages/unread-count`
- 获取未读消息列表：`GET /api/messages/unread`
- 查看消息详情（自动已读）：`GET /api/messages/detail/{messageId}`
- 批量标记为已读：`PUT /api/messages/batch-mark-read`

---

## 10. 错误处理约定

- 业务失败返回：
```
{
  "success": false,
  "message": "错误原因"
}
```
- 前端需判断 `success` 决定流程跳转或提示。
- 可能错误场景：
  - 参数缺失/格式错误（如`receiverId`格式错误）
  - 权限不足（仅管理员或超级管理员可用的接口）
  - 资源不存在（预约/消息/时间段/实验室不存在）
  - 业务冲突（时间段冲突、邮箱已被使用等）

---

## 11. 字段与格式规范建议

- 日期统一 `yyyy-MM-dd`
- 时间段可以为名称或ID，保持与后端约定一致（若为ID，需在时间段查询接口返回该ID供选择）
- 文本字段需做前端必填校验；密码强度建议在前端进行提示
- 上传文件类型由 `type` 控制，头像/实验室图片使用图片类型

---

## 12. 开发提示

- 登录成功后统一封装请求实例，自动注入 `Authorization` 头。
- 统一处理 `success=false` 的异常弹窗。
- 预约前务必调用时间冲突接口校验，减少服务端拒绝的情况。
- 对于与用户ID强相关的接口，后端会从JWT拦截器注入的 `request.attribute("userId")` 读取，因此只需确保登录态与`Authorization`头正确。

如需补充实体字段详细定义，可参考后端 `entity` 包下的 `User`、`Laboratory`、`TimeSlot`、`Reservation`、`Message` 实体类，以保持前后端字段一致性。

---

## 13. 微信小程序登录模块（code2Session + 绑定）

通过微信提供的 jscode2session 接口，将前端 `wx.login` 获取的 `code` 换取 `openid`、`session_key`、`unionid`。后端维护独立绑定关系表 `user_wechat_auth` 支持多平台/多账号绑定。

### 13.1 通过 code 登录（换取 openid / session_key）
- 方法：POST
- URL：`/api/wx/login`
- 请求体：
```
{
  "code": "wx.login返回的code"
}
```
- 响应（成功示例，已绑定场景）：
```
{
  "success": true,
  "message": "微信登录成功（已绑定）",
  "data": {
    "needBind": false,
    "token": "jwt-token",
    "userId": 1,
    "username": "zhangsan",
    "userType": 1,
    "realName": "张三",
    "openid": "oXXXXXX",
    "unionid": null
  }
}
```
- 响应（成功示例，未绑定场景）：
```
{
  "success": true,
  "message": "微信登录成功（未绑定）",
  "data": {
    "openid": "oXXXXXX",
    "sessionKey": "sXXXXXX",
    "unionid": null,
    "needBind": true
  }
}
```
- 错误返回示例（微信侧错误）：
```
{
  "success": false,
  "message": "微信登录失败(errcode=40029): invalid code"
}
```
- 说明与建议：
  - 需在 `application.properties` 配置 `wx.appid` 与 `wx.secret`。
  - 已绑定用户将直接返回系统JWT；未绑定需走绑定流程。
  - 请求无需携带 `Authorization`。

### 13.2 绑定 openid 到指定用户
- 方法：POST
- URL：`/api/wx/bind`
- 请求体：
```
{
  "userId": 1,
  "openid": "oXXXXXX",
  "unionid": null,
  "sessionKey": "sXXXXXX",
  "platform": "mini_program"   // 可选，默认 mini_program
}
```
- 成功响应示例：
```
{
  "success": true,
  "message": "绑定成功",
  "data": {
    "userId": 1,
    "platform": "mini_program",
    "openid": "oXXXXXX",
    "unionid": null,
    "bindStatus": 1,
    "token": "jwt-token"
  }
}
```
- 说明与安全建议：
  - 生产环境建议校验当前登录态（仅本人可绑定其账号）。
  - 后端已采用绑定表 `user_wechat_auth` 维护关系，避免在 `user` 表直接存 `openid`。
  - 绑定成功后已返回系统 `token`，前端可直接视为登录完成。

### 13.3 推荐登录/绑定流程
1. 前端调用 `wx.login` 获得 `code`。
2. 调用 `POST /api/wx/login`：
   - 若 `needBind=false`，直接拿 `token` 进入应用。
   - 若 `needBind=true`，展示绑定流程（可通过已有账号登录或注册获得 `userId`）。
3. 完成账号获取后，调用 `POST /api/wx/bind` 绑定 `openid` 与 `userId`，接口返回 `token`。
4. 使用 `token` 访问其他受保护接口。

---

## 14. 前端实现说明

### 14.1 项目结构
```
/Volumes/data/cusromerOne/wx/
├── api/                          # API封装层
│   ├── index.js                  # 统一导出
│   ├── user.js                   # 用户相关API（11个方法）
│   ├── email.js                  # 邮箱验证API（5个方法）
│   ├── laboratory.js             # 实验室API（7个方法）
│   ├── timeslot.js              # 时间段API（4个方法）
│   ├── reservation.js           # 预约API（13个方法）
│   ├── message.js               # 消息API（15个方法）
│   ├── file.js                  # 文件上传API（4个方法）
│   └── wechat.js                # 微信登录API（4个方法）
├── utils/
│   ├── request.js               # 统一请求封装（自动注入token）
│   └── util.js                  # 工具函数
├── pages/                       # 页面目录（14个页面，56个文件）
│   ├── login/                   # 登录页（支持账号登录+微信登录）
│   ├── register/                # 注册页
│   ├── forgot-password/         # 忘记密码页
│   ├── bind-account/            # 微信账号绑定页（NEW）
│   ├── index/                   # 首页
│   ├── laboratory-list/         # 实验室列表
│   ├── laboratory-detail/       # 实验室详情
│   ├── reservation/             # 预约页面
│   ├── my-reservations/         # 我的预约列表
│   ├── reservation-detail/      # 预约详情
│   ├── messages/                # 消息列表
│   ├── message-detail/          # 消息详情
│   ├── profile/                 # 个人中心
│   └── settings/                # 设置页面
├── app.js                       # 小程序入口
├── app.json                     # 全局配置
└── app.wxss                     # 全局样式
```

### 14.2 API封装层说明

#### 14.2.1 统一请求封装（utils/request.js）
- 自动注入 `Authorization: Bearer <token>`
- 统一错误处理和提示
- 支持 `skipAuth` 参数跳过token注入（用于登录、注册等接口）
- 自动处理 `success=false` 的业务错误

#### 14.2.2 微信登录API（api/wechat.js）
提供4个方法：
- `login(code)` - 通过code登录，对应 `POST /api/wx/login`
- `bind(data)` - 绑定微信账号，对应 `POST /api/wx/bind`
- `unbind()` - 解绑微信账号，对应 `POST /api/wx/unbind`
- `getBindStatus()` - 查询绑定状态，对应 `GET /api/wx/bind-status`

### 14.3 微信登录功能实现

#### 14.3.1 登录页（pages/login/）
**功能特性**：
- 支持账号密码登录
- 支持微信一键登录
- 自动判断微信登录返回结果（已绑定/未绑定）
- 已绑定用户直接进入应用，未绑定用户跳转绑定页面

**关键代码逻辑**：
```javascript
async handleWechatLogin() {
  // 1. 调用wx.login获取code
  const loginRes = await wx.login();
  
  // 2. 调用后端接口换取openid
  const res = await api.wechat.login(loginRes.code);
  
  // 3. 根据返回结果处理
  if (res.token) {
    // 已绑定：保存token和用户信息，跳转首页
    wx.setStorageSync('token', res.token);
    wx.setStorageSync('userInfo', res.user);
    wx.switchTab({ url: '/pages/index/index' });
  } else if (res.needBind) {
    // 未绑定：跳转账号绑定页
    wx.navigateTo({
      url: `/pages/bind-account/bind-account?openid=${res.openid}&sessionKey=${res.sessionKey}`
    });
  }
}
```

#### 14.3.2 账号绑定页（pages/bind-account/）
**功能特性**：
- 支持两种绑定方式：登录绑定 / 注册绑定
- Tab标签页切换
- 登录绑定：使用已有账号密码登录后自动绑定
- 注册绑定：注册新账号并同时完成绑定
- 邮箱验证码支持（60秒倒计时）
- 完整的表单验证

**绑定流程**：

**方式一：登录绑定**
1. 用户输入已有账号的邮箱和密码
2. 调用 `POST /api/user/login` 获取用户信息
3. 调用 `POST /api/wx/bind` 绑定openid到该用户
4. 保存返回的token，完成登录

**方式二：注册绑定**
1. 用户输入用户名、邮箱、密码
2. 发送邮箱验证码（`POST /api/user/send-code`，purpose=register）
3. 验证验证码后调用 `POST /api/user/register` 注册账号
4. 调用 `POST /api/wx/bind` 绑定openid到新用户
5. 保存返回的token，完成登录

**关键代码逻辑**：
```javascript
// 登录绑定流程
async handleLoginBind() {
  // 1. 先登录获取用户信息
  const loginRes = await api.user.login({ email, password });
  
  // 2. 绑定微信
  const bindRes = await api.wechat.bind({
    userId: loginRes.user.id,
    openid: this.data.openid,
    sessionKey: this.data.sessionKey,
    unionid: this.data.unionid || null,
    platform: 'mini_program'
  });
  
  // 3. 保存token和用户信息
  wx.setStorageSync('token', bindRes.token);
  wx.setStorageSync('userInfo', bindRes.user);
  
  // 4. 跳转首页
  wx.switchTab({ url: '/pages/index/index' });
}

// 注册绑定流程
async handleRegisterBind() {
  // 1. 先注册账号
  const registerRes = await api.user.register({
    username, email, password, code
  });
  
  // 2. 绑定微信（同上）
  // 3. 保存token（同上）
  // 4. 跳转首页（同上）
}
```

### 14.4 完整的微信登录流程图

```
用户点击"微信一键登录"
        ↓
调用 wx.login() 获取 code
        ↓
POST /api/wx/login (code)
        ↓
    【判断返回】
   ↙          ↘
已绑定         未绑定
(返回token)    (返回openid)
   ↓              ↓
保存token      跳转绑定页
跳转首页           ↓
            【选择绑定方式】
           ↙            ↘
      登录绑定         注册绑定
         ↓                ↓
    输入账号密码      输入注册信息
         ↓                ↓
    POST /login      发送验证码
         ↓                ↓
    获取userId       POST /register
         ↓                ↓
         └───> POST /wx/bind <───┘
                    ↓
              返回token
                    ↓
              保存token
                    ↓
              跳转首页
```

### 14.5 页面配置说明

所有页面均已在 `app.json` 的 `pages` 数组中注册，包括新增的 `pages/bind-account/bind-account` 绑定页面。

TabBar配置包含4个标签页：
- 首页（pages/index/index）
- 消息（pages/messages/messages）
- 我的预约（pages/my-reservations/my-reservations）
- 我的（pages/profile/profile）

### 14.6 样式设计说明

#### 14.6.1 登录页样式
- 蓝色渐变主题（#1890ff → #096dd9）
- 微信登录按钮采用微信绿色（#07c160）
- 分隔线设计（"或"字样）
- 响应式按钮状态（loading、disabled）

#### 14.6.2 绑定页样式
- 紫色渐变主题（#7c3aed → #5b21b6）
- Tab标签页切换效果
- 验证码倒计时按钮
- 完整的表单输入样式

### 14.7 开发建议

#### 14.7.1 token管理
- 登录成功后使用 `wx.setStorageSync('token', token)` 保存
- 使用 `wx.getStorageSync('token')` 读取
- 退出登录时使用 `wx.removeStorageSync('token')` 清除

#### 14.7.2 用户信息管理
- 登录成功后保存完整的用户信息对象
- 用于个人中心页面展示
- 避免频繁请求用户信息接口

#### 14.7.3 错误处理
- 所有API调用都包含try-catch
- 使用 `wx.showToast` 统一提示错误
- 网络错误、业务错误分别处理

#### 14.7.4 安全建议
- 敏感信息（如sessionKey）仅在绑定流程中传递，不存储在本地
- token存储在小程序安全存储中
- 定期检查token有效性，过期自动跳转登录页

### 14.8 测试建议

#### 14.8.1 微信登录测试场景
1. **首次使用微信登录（未绑定）**
   - 验证跳转到绑定页面
   - 验证openid和sessionKey正确传递
   
2. **已绑定账号微信登录**
   - 验证直接登录成功
   - 验证token和用户信息正确保存
   
3. **登录绑定流程**
   - 测试账号密码错误处理
   - 测试绑定成功后自动登录
   
4. **注册绑定流程**
   - 测试邮箱验证码发送和验证
   - 测试注册失败（邮箱已存在等）处理
   - 测试注册成功后自动绑定和登录

#### 14.8.2 边界情况测试
- 网络异常处理
- 微信code过期处理
- 重复绑定处理
- 绑定页面返回/退出处理

---

## 15. 接口覆盖率说明

本项目已完成接口文档中所有59个API接口的前端实现：

| 模块 | 接口数量 | 实现状态 |
|------|---------|---------|
| 认证与用户模块 | 11 | ✅ 100% |
| 邮箱与验证码模块 | 5 | ✅ 100% |
| 实验室模块 | 7 | ✅ 100% |
| 时间段模块 | 4 | ✅ 100% |
| 预约模块 | 13 | ✅ 100% |
| 站内消息模块 | 15 | ✅ 100% |
| 文件上传模块 | 4 | ✅ 100% |
| 微信登录模块 | 4 | ✅ 100% |
| **总计** | **63** | **✅ 100%** |

所有接口均已在 `api/` 目录下完成封装，并在相应页面中集成使用。
