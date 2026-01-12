# 实验室预约管理系统 - Web管理端

基于Vue 3 + Element Plus开发的实验室预约管理系统Web管理端。

## 项目结构

```
vue/
├── public/                    # 静态资源目录
├── src/
│   ├── api/                   # API接口目录
│   │   ├── user.js           # 用户管理API
│   │   ├── laboratory.js     # 实验室管理API
│   │   ├── reservation.js    # 预约管理API
│   │   ├── timeslot.js       # 时间段配置API
│   │   ├── message.js        # 消息管理API
│   │   ├── file.js           # 文件管理API
│   │   └── report.js         # 报表导出API
│   ├── layouts/              # 布局组件
│   │   └── MainLayout.vue    # 主布局（含侧边栏和顶部导航）
│   ├── views/                # 页面组件
│   │   ├── Login.vue         # 登录页面
│   │   ├── Dashboard.vue     # 仪表盘
│   │   ├── UserManagement.vue           # 用户管理
│   │   ├── LaboratoryManagement.vue     # 实验室管理
│   │   ├── ReservationManagement.vue    # 预约管理
│   │   ├── ReservationApproval.vue      # 预约审核
│   │   ├── TimeslotManagement.vue       # 时间段配置
│   │   ├── MessageManagement.vue        # 消息管理
│   │   └── ReportManagement.vue         # 报表导出
│   ├── store/                # Pinia状态管理
│   │   └── index.js          # 用户状态store
│   ├── router/               # 路由配置
│   │   └── index.js          # 路由定义
│   ├── utils/                # 工具函数
│   │   └── request.js        # Axios请求封装
│   ├── App.vue               # 根组件
│   └── main.js               # 入口文件
├── index.html                # HTML模板
├── vite.config.js            # Vite配置
├── package.json              # 项目依赖
└── Web管理端API文档.md       # API接口文档
```

## 功能模块

### 1. 用户管理
- 用户列表查询（支持分页、筛选）
- 用户详情查看
- 用户信息编辑
- 用户状态管理（启用/禁用）
- 密码重置
- 用户删除
- 用户统计

### 2. 实验室管理
- 实验室列表查询
- 实验室信息维护（新增、编辑、删除）
- 实验室状态管理
- 实验室搜索
- 实验室统计

### 3. 预约管理
- 预约列表查询
- 预约详情查看
- 预约创建
- 预约编辑
- 预约取消
- 预约完成
- 预约搜索
- 预约统计

### 4. 预约审核
- 待审核预约列表
- 预约审批（通过/拒绝）
- 审核记录查看

### 5. 时间段配置
- 时间段列表管理
- 时间段新增、编辑、删除
- 时间段状态管理
- 时间段排序
- 时间段统计

### 6. 消息管理
- 消息列表查询
- 系统消息发送
- 用户消息发送
- 消息详情查看
- 消息状态管理（已读/未读）
- 消息删除
- 未读消息统计

### 7. 报表导出
- 预约报表导出（Excel格式）
- 统计报表导出（Excel格式）
- 自定义时间范围
- 多维度数据筛选

## 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **日期处理**: dayjs
- **图标**: @element-plus/icons-vue

## 开发指南

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```
访问地址：http://localhost:5173

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## API配置

API基础地址配置在 `src/utils/request.js` 中：

```javascript
const service = axios.create({
  baseURL: 'http://your-api-domain.com', // 修改为实际的API地址
  timeout: 10000
})
```

**重要提示**：在使用前，请将 `baseURL` 修改为实际的后端API地址。

## 认证机制

系统使用JWT Token进行身份认证：

1. 登录成功后，Token保存在localStorage中
2. 每次请求自动在请求头中携带Token
3. Token过期或无效时，自动跳转到登录页面
4. 退出登录时清除Token

## 路由守卫

系统实现了全局路由守卫：

- 未登录用户访问需要认证的页面时，自动跳转到登录页
- 已登录用户访问登录页时，自动跳转到首页
- 动态设置页面标题

## 状态管理

使用Pinia管理全局状态：

- `userStore`: 用户信息和认证状态
  - `userInfo`: 当前用户信息
  - `token`: 认证令牌
  - `login()`: 登录方法
  - `logout()`: 退出登录方法

## 开发注意事项

### 1. API接口调用
所有API函数都采用命名导出方式：

```javascript
import { getUserList, updateUser } from '@/api/user'

// 调用API
const res = await getUserList()
```

### 2. 路径别名
项目配置了路径别名 `@` 指向 `src` 目录：

```javascript
import request from '@/utils/request'
import { useUserStore } from '@/store'
```

### 3. 组件引入
Element Plus组件按需引入，已全局注册，可直接使用：

```vue
<template>
  <el-button type="primary">按钮</el-button>
  <el-table :data="tableData">
    <!-- ... -->
  </el-table>
</template>
```

### 4. 消息提示
使用Element Plus的消息组件：

```javascript
import { ElMessage, ElMessageBox } from 'element-plus'

// 成功提示
ElMessage.success('操作成功')

// 错误提示
ElMessage.error('操作失败')

// 确认对话框
ElMessageBox.confirm('确认删除吗？', '提示', {
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  type: 'warning'
})
```

### 5. 表单验证
使用Element Plus的表单验证：

```javascript
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ]
}
```

## 常见问题

### 1. 启动时提示端口被占用
修改 `vite.config.js` 中的端口号：

```javascript
server: {
  port: 3000 // 改为其他可用端口
}
```

### 2. API请求跨域问题
在 `vite.config.js` 中配置代理：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://your-backend-url',
      changeOrigin: true
    }
  }
}
```

### 3. 构建后白屏
检查 `vite.config.js` 中的 `base` 配置，确保与部署路径一致。

## 部署说明

### 1. 构建
```bash
npm run build
```

### 2. 部署产物
构建完成后，`dist` 目录包含所有静态资源，可直接部署到：
- Nginx
- Apache
- 静态托管服务（如Vercel、Netlify等）

### 3. Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://your-backend-url;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 后续开发建议

1. **API Mock**：可集成 Mock.js 或 MSW 进行接口模拟
2. **单元测试**：添加 Vitest 进行组件和函数测试
3. **E2E测试**：集成 Playwright 或 Cypress 进行端到端测试
4. **代码规范**：配置 ESLint + Prettier 统一代码风格
5. **Git Hooks**：使用 husky + lint-staged 在提交前进行代码检查
6. **性能优化**：
   - 路由懒加载
   - 组件懒加载
   - 图片懒加载
   - 虚拟滚动（大列表场景）
7. **安全增强**：
   - XSS防护
   - CSRF防护
   - 敏感信息加密
8. **用户体验**：
   - 骨架屏
   - 加载状态
   - 错误边界
   - 操作反馈

## 许可证

本项目仅供学习和参考使用。

## 联系方式

如有问题或建议，请联系开发团队。
