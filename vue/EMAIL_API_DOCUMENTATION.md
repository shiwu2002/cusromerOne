# 邮箱功能接口说明文档

## 概述

本文档详细描述了实验室预约管理系统中的邮箱功能接口。系统通过邮箱服务实现用户注册验证、密码重置、邮箱绑定等功能，采用验证码和验证链接双重验证机制确保安全性。

## 技术架构

- **后端框架**: Spring Boot 3.x
- **邮件服务**: Spring Mail + Thymeleaf模板引擎
- **缓存存储**: Redis（存储验证码和验证token）
- **安全机制**: JWT认证 + 验证码验证
- **API风格**: RESTful API

## 邮箱服务核心类

### 1. EmailService（邮件服务类）

#### 主要功能方法：

1. **sendRegisterVerifyEmail(String email, String username)**
   - 功能：发送注册验证邮件
   - 实现：生成UUID token，存储到Redis（30分钟有效），发送包含验证链接的HTML邮件
   - 模板：`email-register.html`

2. **sendVerificationCode(String email, String purpose)**
   - 功能：发送验证码邮件
   - 实现：生成随机验证码，存储到Redis，发送包含验证码的HTML邮件
   - 支持用途：register（注册）、reset-password（重置密码）、bind-email（绑定邮箱）
   - 模板：`email-code.html`

3. **verifyCode(String email, String code)**
   - 功能：验证验证码
   - 实现：检查Redis中存储的验证码，验证成功后删除验证码
   - 验证范围：支持多种用途的验证码验证

4. **verifyEmailToken(String token)**
   - 功能：验证邮箱验证token
   - 实现：检查Redis中存储的token，验证成功后删除token并返回邮箱地址

5. **sendReservationNotification()** / **sendApprovalNotification()** / **sendReservationReminder()**
   - 功能：发送预约相关通知邮件
   - 模板：`email-reservation.html`、`email-approval.html`、`email-reminder.html`

#### 配置参数：
```properties
system.email.from=发件人邮箱
system.email.from-name=发件人名称
system.base-url=系统基础URL
verification.code.expire-minutes=验证码有效期（分钟）
verification.code.length=验证码长度
```

## 邮箱功能API接口

### 1. 发送注册验证邮件

**接口**: `POST /api/user/send-register-email`

**功能**: 发送注册验证邮件到指定邮箱，用于新用户注册验证

**请求参数**:
```json
{
  "email": "user@example.com",
  "username": "用户名（可选）"
}
```

**请求示例**:
```bash
curl -X POST http://localhost:8080/api/user/send-register-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "username": "张三"}'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "验证邮件已发送，请查收",
  "data": null
}
```

**业务逻辑**:
1. 验证邮箱格式和空值检查
2. 检查邮箱是否已被注册
3. 调用EmailService发送验证邮件
4. 邮件中包含验证链接，30分钟内有效

**错误响应**:
- 400: 邮箱地址不能为空
- 400: 该邮箱已被注册
- 500: 发送失败：具体错误信息

---

### 2. 验证邮箱注册token

**接口**: `GET /api/user/verify-email`

**功能**: 验证邮箱注册链接中的token，完成邮箱验证

**请求参数**:
- `token`: 邮箱验证token（URL参数）

**请求示例**:
```bash
curl -X GET "http://localhost:8080/api/user/verify-email?token=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**响应示例**:
```json
{
  "code": 200,
  "message": "邮箱验证成功",
  "data": null
}
```

**业务逻辑**:
1. 验证token有效性
2. 从Redis获取对应的邮箱地址
3. 更新用户邮箱验证状态为已验证
4. 删除已使用的token

**错误响应**:
- 400: 验证链接已失效或不存在
- 500: 验证失败：具体错误信息

---

### 3. 发送验证码邮件

**接口**: `POST /api/user/send-code`

**功能**: 发送验证码到指定邮箱，支持多种用途

**请求参数**:
```json
{
  "email": "user@example.com",
  "purpose": "register | reset-password | bind-email | verify"
}
```

**请求示例**:
```bash
curl -X POST http://localhost:8080/api/user/send-code \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "purpose": "reset-password"}'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "验证码已发送，请查收邮件",
  "data": null
}
```

**业务逻辑**:
1. 验证邮箱格式和空值检查
2. 根据用途检查邮箱状态：
   - register: 检查邮箱是否已被注册
   - reset-password: 检查邮箱是否已注册
3. 调用EmailService发送验证码邮件
4. 验证码存储在Redis中，有效期可配置

**错误响应**:
- 400: 邮箱地址不能为空
- 400: 该邮箱已被注册（register用途）
- 400: 该邮箱未注册（reset-password用途）
- 500: 发送失败：具体错误信息

---

### 4. 验证验证码

**接口**: `POST /api/user/verify-code`

**功能**: 验证邮箱收到的验证码

**请求参数**:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**请求示例**:
```bash
curl -X POST http://localhost:8080/api/user/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456"}'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "验证成功",
  "data": null
}
```

**业务逻辑**:
1. 验证邮箱和验证码非空
2. 调用EmailService验证验证码
3. 验证成功后删除Redis中的验证码

**错误响应**:
- 400: 邮箱地址不能为空
- 400: 验证码不能为空
- 400: 验证码错误或已失效
- 500: 验证失败：具体错误信息

---

### 5. 通过邮箱验证码重置密码

**接口**: `POST /api/user/reset-password-by-email`

**功能**: 通过邮箱验证码重置用户密码

**请求参数**:
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newPassword123"
}
```

**请求示例**:
```bash
curl -X POST http://localhost:8080/api/user/reset-password-by-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456", "newPassword": "newPassword123"}'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "密码重置成功",
  "data": null
}
```

**业务逻辑**:
1. 验证所有参数非空
2. 验证验证码有效性
3. 调用UserService重置密码
4. 密码重置后需要重新登录

**错误响应**:
- 400: 邮箱地址不能为空
- 400: 验证码不能为空
- 400: 新密码不能为空
- 400: 验证码错误或已失效
- 500: 重置失败：具体错误信息

---

### 6. 绑定邮箱

**接口**: `POST /api/user/bind-email`

**功能**: 为用户绑定邮箱地址

**请求参数**:
```json
{
  "userId": 1,
  "email": "user@example.com",
  "code": "123456"
}
```

**请求示例**:
```bash
curl -X POST http://localhost:8080/api/user/bind-email \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "email": "test@example.com", "code": "123456"}'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "邮箱绑定成功",
  "data": null
}
```

**业务逻辑**:
1. 验证所有参数非空
2. 检查邮箱是否已被其他用户使用
3. 验证验证码有效性
4. 调用UserService绑定邮箱

**错误响应**:
- 400: 邮箱地址不能为空
- 400: 验证码不能为空
- 400: 该邮箱已被其他用户使用
- 400: 验证码错误或已失效
- 500: 绑定失败：具体错误信息

---

### 7. 重新发送邮箱验证邮件

**接口**: `POST /api/user/resend-verify-email`

**功能**: 重新发送邮箱验证邮件

**请求参数**:
```json
{
  "userId": 1
}
```

**请求示例**:
```bash
curl -X POST http://localhost:8080/api/user/resend-verify-email \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "验证邮件已重新发送",
  "data": null
}
```

**业务逻辑**:
1. 验证用户存在性
2. 检查用户是否已设置邮箱
3. 检查邮箱是否已验证
4. 调用EmailService重新发送验证邮件

**错误响应**:
- 400: 用户不存在
- 400: 用户未设置邮箱
- 400: 邮箱已验证，无需重复验证
- 500: 发送失败：具体错误信息

## 邮件模板说明

系统使用Thymeleaf模板引擎生成HTML邮件，包含以下模板：

### 1. email-register.html（注册验证邮件）
- 变量：`username`, `verifyUrl`
- 内容：欢迎信息 + 验证链接

### 2. email-code.html（验证码邮件）
- 变量：`code`, `purpose`, `expireMinutes`
- 内容：验证码 + 用途说明 + 有效期提示

### 3. email-reservation.html（预约通知邮件）
- 变量：`username`, `labName`, `reservationDate`, `timeSlot`, `status`, `baseUrl`
- 内容：预约状态通知

### 4. email-approval.html（审核结果通知邮件）
- 变量：`username`, `labName`, `reservationDate`, `timeSlot`, `approved`, `reason`, `baseUrl`
- 内容：审核结果通知

### 5. email-reminder.html（预约提醒邮件）
- 变量：`username`, `labName`, `reservationDate`, `timeSlot`, `baseUrl`
- 内容：预约开始前提醒

## 安全机制

### 1. 验证码安全
- 验证码长度可配置（默认6位）
- 有效期可配置（默认10分钟）
- 验证成功后立即删除
- 支持多种用途，防止验证码复用

### 2. Token安全
- 使用UUID生成唯一token
- 存储在Redis中，30分钟有效
- 验证成功后立即删除
- 防止重放攻击

### 3. 邮箱验证
- 注册时强制邮箱验证
- 绑定邮箱需要验证码验证
- 防止恶意邮箱注册和绑定

## 错误处理

所有接口统一使用Result对象返回：
```java
public class Result<T> {
    private Integer code;    // 状态码：200成功，400客户端错误，500服务器错误
    private String message;  // 提示信息
    private T data;          // 返回数据
}
```

## 使用流程示例

### 用户注册流程：
1. 调用 `/send-register-email` 发送验证邮件
2. 用户点击邮件中的验证链接，调用 `/verify-email` 完成验证
3. 调用 `/register` 完成用户注册

### 密码重置流程：
1. 调用 `/send-code` 发送重置密码验证码（purpose=reset-password）
2. 调用 `/verify-code` 验证验证码
3. 调用 `/reset-password-by-email` 重置密码

### 邮箱绑定流程：
1. 调用 `/send-code` 发送绑定邮箱验证码（purpose=bind-email）
2. 调用 `/verify-code` 验证验证码
3. 调用 `/bind-email` 完成邮箱绑定

## 配置说明

在 `application.properties` 中配置：

```properties
# 邮件配置
spring.mail.host=smtp.example.com
spring.mail.port=587
spring.mail.username=your-email@example.com
spring.mail.password=your-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# 系统配置
system.email.from=your-email@example.com
system.email.from-name=实验室预约系统
system.base-url=http://localhost:8080

# 验证码配置
verification.code.expire-minutes=10
verification.code.length=6

# Redis配置
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.database=0
```

## 注意事项

1. **邮箱服务依赖**：确保SMTP服务器配置正确
2. **Redis服务**：验证码和token存储依赖Redis，确保Redis服务正常运行
3. **并发控制**：同一邮箱短时间内频繁请求验证码应有频率限制（当前版本未实现）
4. **安全性**：生产环境应使用HTTPS，防止验证码和token被截获
5. **模板路径**：邮件模板文件应放在 `resources/templates/` 目录下

---

*文档版本：1.0*
*最后更新：2026年1月14日*
*维护者：系统开发团队*
