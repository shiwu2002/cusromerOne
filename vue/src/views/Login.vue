<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>实验室预约管理系统</h2>
        <p>Web管理端</p>
      </div>
      
      <el-tabs v-model="activeTab" class="login-tabs">
        <!-- 登录表单 -->
        <el-tab-pane label="登录" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                prefix-icon="User"
                size="large"
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                size="large"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="login-button"
                @click="handleLogin"
              >
                登录
              </el-button>
            </el-form-item>
            
            <el-form-item>
              <div class="login-actions">
                <el-link type="primary" @click="showForgotPasswordDialog = true">
                  忘记密码？
                </el-link>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 注册表单 -->
        <el-tab-pane label="注册" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            class="login-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名 (3-20个字符)"
                prefix-icon="User"
                size="large"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码 (至少6个字符)"
                prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                prefix-icon="Lock"
                size="large"
                show-password
              />
            </el-form-item>
            
            <el-form-item prop="realName">
              <el-input
                v-model="registerForm.realName"
                placeholder="请输入真实姓名"
                prefix-icon="UserFilled"
                size="large"
              />
            </el-form-item>
            
            <el-form-item prop="userType">
              <el-select
                v-model="registerForm.userType"
                placeholder="请选择用户类型"
                size="large"
                style="width: 100%"
              >
                <el-option label="学生" :value="1" />
                <el-option label="教师" :value="2" />
                <el-option label="管理员" :value="3" />
              </el-select>
            </el-form-item>
            
            <el-form-item prop="phone">
              <el-input
                v-model="registerForm.phone"
                placeholder="请输入手机号"
                prefix-icon="Phone"
                size="large"
              />
            </el-form-item>
            
            <el-form-item prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="请输入邮箱"
                prefix-icon="Message"
                size="large"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="login-button"
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
  
  <!-- 忘记密码对话框 -->
  <el-dialog
    v-model="showForgotPasswordDialog"
    title="忘记密码"
    width="400px"
    @close="handleForgotPasswordClose"
  >
    <el-form
      ref="forgotPasswordFormRef"
      :model="forgotPasswordForm"
      :rules="forgotPasswordRules"
      label-width="80px"
    >
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="forgotPasswordForm.email"
          placeholder="请输入注册时使用的邮箱"
          size="large"
        />
      </el-form-item>
      
      <el-form-item label="验证码" prop="code">
        <div class="code-input-container">
          <el-input
            v-model="forgotPasswordForm.code"
            placeholder="请输入验证码"
            size="large"
            style="flex: 1"
          />
          <el-button
            type="primary"
            size="large"
            :disabled="codeCountdown > 0"
            @click="handleSendCode"
            style="margin-left: 10px"
          >
            {{ codeCountdown > 0 ? `${codeCountdown}秒后重试` : '发送验证码' }}
          </el-button>
        </div>
      </el-form-item>
      
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="forgotPasswordForm.newPassword"
          type="password"
          placeholder="请输入新密码"
          size="large"
          show-password
        />
      </el-form-item>
      
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="forgotPasswordForm.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          size="large"
          show-password
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="showForgotPasswordDialog = false">取消</el-button>
      <el-button type="primary" @click="handleResetPassword" :loading="resetLoading">
        重置密码
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import { login, register, sendCode, verifyCode, resetPasswordByEmail } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

// 当前激活的标签页
const activeTab = ref('login')

// 登录表单
const loginFormRef = ref(null)
const loading = ref(false)

// 忘记密码相关
const showForgotPasswordDialog = ref(false)
const forgotPasswordFormRef = ref(null)
const resetLoading = ref(false)
const codeCountdown = ref(0)
let countdownTimer = null

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ]
}

// 注册表单
const registerFormRef = ref(null)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  userType: null,
  phone: '',
  email: ''
})

// 忘记密码表单
const forgotPasswordForm = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

// 自定义验证规则：确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 自定义验证规则：手机号
const validatePhone = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入手机号'))
  } else {
    const phoneReg = /^1[3-9]\d{9}$/
    if (phoneReg.test(value)) {
      callback()
    } else {
      callback(new Error('请输入有效的手机号'))
    }
  }
}

// 自定义验证规则：邮箱
const validateEmail = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入邮箱'))
  } else {
    const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (emailReg.test(value)) {
      callback()
    } else {
      callback(new Error('请输入有效的邮箱地址'))
    }
  }
}

// 忘记密码表单验证规则
const validateForgotPasswordConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== forgotPasswordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const forgotPasswordRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateForgotPasswordConfirmPassword, trigger: 'blur' }
  ]
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  email: [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // login函数调用axios，响应拦截器在code===200时返回response.data
        // 根据API文档，后端返回格式为：{code: 200, message: "success", data: {token, userId, username, userType, realName}}
        // 所以res就是这个完整对象
        const res = await login({
          username: loginForm.username,
          password: loginForm.password
        })
        
        console.log('=== 登录调试信息 ===')
        console.log('完整响应对象:', res)
        console.log('res.data内容:', res.data)
        
        // 从res.data中提取token和用户信息
        const { token, userId, username, userType, realName } = res.data
        
        console.log('提取的token:', token)
        console.log('提取的用户信息:', { userId, username, userType, realName })
        
        if (!token) {
          throw new Error('登录失败：未获取到token')
        }
        
        // 构建用户信息对象
        const userInfo = {
          userId,
          username,
          userType,
          realName
        }
        
        // 保存token和用户信息到store
        userStore.setToken(token)
        userStore.setUserInfo(userInfo)
        
        console.log('Store中的token:', userStore.token)
        console.log('Store中的userInfo:', userStore.userInfo)
        console.log('Store中的isLoggedIn:', userStore.isLoggedIn)
        
        ElMessage.success('登录成功')
        
        // 跳转到仪表盘
        console.log('准备跳转到/dashboard')
        await router.push('/dashboard')
        console.log('跳转完成')
      } catch (error) {
        console.error('登录错误:', error)
        ElMessage.error(error.message || '登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }
  })
}

// 发送验证码
const handleSendCode = async () => {
  if (!forgotPasswordForm.email) {
    ElMessage.warning('请输入邮箱地址')
    return
  }
  
  try {
    await sendCode({
      email: forgotPasswordForm.email,
      purpose: 'reset-password'
    })
    ElMessage.success('验证码已发送，请查收邮件')
    
    // 开始倒计时
    codeCountdown.value = 60
    countdownTimer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    }, 1000)
  } catch (error) {
    ElMessage.error(error.message || '发送验证码失败')
  }
}

// 重置密码
const handleResetPassword = async () => {
  if (!forgotPasswordFormRef.value) return
  
  await forgotPasswordFormRef.value.validate(async (valid) => {
    if (valid) {
      resetLoading.value = true
      try {
        await resetPasswordByEmail({
          email: forgotPasswordForm.email,
          code: forgotPasswordForm.code,
          newPassword: forgotPasswordForm.newPassword
        })
        
        ElMessage.success('密码重置成功，请使用新密码登录')
        showForgotPasswordDialog.value = false
      } catch (error) {
        ElMessage.error(error.message || '密码重置失败')
      } finally {
        resetLoading.value = false
      }
    }
  })
}

// 关闭忘记密码对话框
const handleForgotPasswordClose = () => {
  if (forgotPasswordFormRef.value) {
    forgotPasswordFormRef.value.resetFields()
  }
  Object.assign(forgotPasswordForm, {
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  })
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  codeCountdown.value = 0
}

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await register({
          username: registerForm.username,
          password: registerForm.password,
          realName: registerForm.realName,
          userType: registerForm.userType,
          phone: registerForm.phone,
          email: registerForm.email
        })
        
        ElMessage.success('注册成功，请登录')
        
        // 清空注册表单
        registerFormRef.value.resetFields()
        
        // 切换到登录标签页
        activeTab.value = 'login'
        
        // 自动填充用户名到登录表单
        loginForm.username = registerForm.username
      } catch (error) {
        ElMessage.error(error.message || '注册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 480px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.login-header h2 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.login-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.login-tabs {
  margin-top: 10px;
}

.login-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.login-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
}

.login-form {
  margin-top: 10px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  margin-top: 10px;
}

/* 滚动条样式优化 */
.login-box::-webkit-scrollbar {
  width: 6px;
}

.login-box::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.login-box::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.login-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: -10px;
}

.code-input-container {
  display: flex;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-box {
    padding: 30px 20px;
  }
  
  .login-header h2 {
    font-size: 20px;
  }
}
</style>
