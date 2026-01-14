<template>
  <el-dialog
    v-model="dialogVisible"
    title="个人信息"
    width="500px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="userForm"
      :rules="rules"
      label-width="100px"
      :disabled="!isEditMode"
    >
      <el-form-item label="用户ID">
        <el-input v-model="userForm.id" disabled />
      </el-form-item>
      
      <el-form-item label="用户名" prop="username">
        <el-input v-model="userForm.username" :disabled="!isEditMode" />
      </el-form-item>
      
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="userForm.realName" :disabled="!isEditMode" />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="userForm.email" :disabled="!isEditMode" />
      </el-form-item>
      
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="userForm.phone" :disabled="!isEditMode" />
      </el-form-item>
      
      <el-form-item label="用户类型">
        <el-input :value="getUserTypeText(userForm.userType)" disabled />
      </el-form-item>
      
      <el-form-item label="创建时间">
        <el-input :value="formatDate(userForm.createTime)" disabled />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          v-if="!isEditMode"
          type="primary"
          @click="enableEditMode"
        >
          编辑
        </el-button>
        <el-button
          v-if="isEditMode"
          type="primary"
          :loading="loading"
          @click="handleSave"
        >
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserById, updateUser } from '@/api/user'
import { useUserStore } from '@/store'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:visible'])

const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)
const isEditMode = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const userForm = reactive({
  id: '',
  username: '',
  realName: '',
  email: '',
  phone: '',
  userType: '',
  createTime: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 用户类型映射
const userTypeMap = {
  0: '普通用户',
  1: '管理员',
  2: '超级管理员'
}

// 获取用户类型文本
const getUserTypeText = (type) => {
  return userTypeMap[type] || '未知类型'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 加载用户信息
const loadUserInfo = async () => {
  try {
    loading.value = true
    const res = await getUserById(props.userId)
    if (res.data) {
      Object.assign(userForm, res.data)
    } else {
      ElMessage.error('获取用户信息失败')
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

// 启用编辑模式
const enableEditMode = () => {
  isEditMode.value = true
}

// 保存用户信息
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    loading.value = true
    // 更新用户信息，传递整个用户对象
    const userId = props.userId
    await updateUser(userId, userForm)
    
    ElMessage.success('用户信息更新成功')
    
    // 更新store中的用户信息
    userStore.updateUserInfo(userForm)
    
    isEditMode.value = false
    handleClose()
  } catch (error) {
    console.error('更新用户信息失败:', error)
    ElMessage.error(error.message || '更新用户信息失败')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  isEditMode.value = false
  // 重置表单
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 监听对话框显示状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadUserInfo()
  }
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
