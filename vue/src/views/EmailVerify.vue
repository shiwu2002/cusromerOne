<template>
  <div class="email-verify-container">
    <div class="email-verify-box">
      <div class="email-verify-header">
        <h2>邮箱验证</h2>
      </div>
      
      <div class="email-verify-content">
        <div v-if="verifying" class="verifying">
          <el-icon class="loading-icon" color="#409EFF" :size="48">
            <Loading />
          </el-icon>
          <p>正在验证邮箱...</p>
        </div>
        
        <div v-else-if="verifySuccess" class="success">
          <el-icon class="success-icon" color="#67C23A" :size="48">
            <CircleCheck />
          </el-icon>
          <h3>邮箱验证成功！</h3>
          <p>您的邮箱已成功验证，现在可以使用完整功能</p>
          <el-button type="primary" @click="goToDashboard">前往工作台</el-button>
        </div>
        
        <div v-else class="error">
          <el-icon class="error-icon" color="#F56C6C" :size="48">
            <CircleClose />
          </el-icon>
          <h3>邮箱验证失败</h3>
          <p>{{ errorMessage }}</p>
          <div class="actions">
            <el-button type="primary" @click="tryAgain">重新验证</el-button>
            <el-button @click="goToLogin">返回登录</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { verifyEmail } from '@/api/user'

const router = useRouter()
const route = useRoute()

const verifying = ref(true)
const verifySuccess = ref(false)
const errorMessage = ref('')

// 邮箱验证处理
const handleEmailVerification = async () => {
  const token = route.query.token
  
  if (!token) {
    verifying.value = false
    errorMessage.value = '验证链接无效，请检查链接是否正确'
    return
  }
  
  try {
    await verifyEmail(token)
    verifySuccess.value = true
    verifying.value = false
    ElMessage.success('邮箱验证成功')
  } catch (error) {
    verifying.value = false
    errorMessage.value = error.message || '邮箱验证失败，请重新获取验证链接'
  }
}

// 重新验证
const tryAgain = () => {
  verifying.value = true
  verifySuccess.value = false
  errorMessage.value = ''
  handleEmailVerification()
}

// 跳转到工作台
const goToDashboard = () => {
  router.push('/dashboard')
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  handleEmailVerification()
})
</script>

<style scoped>
.email-verify-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.email-verify-box {
  width: 100%;
  max-width: 480px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.email-verify-header {
  margin-bottom: 30px;
}

.email-verify-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.email-verify-content {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.verifying {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.verifying p {
  margin: 0;
  color: #606266;
  font-size: 16px;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.success h3 {
  margin: 0;
  color: #67C23A;
  font-size: 20px;
  font-weight: 600;
}

.success p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.error h3 {
  margin: 0;
  color: #F56C6C;
  font-size: 20px;
  font-weight: 600;
}

.error p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  max-width: 300px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .email-verify-box {
    padding: 30px 20px;
  }
  
  .actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .success,
  .error,
  .verifying {
    gap: 15px;
  }
}
</style>
