<template>
  <div class="credit-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>信誉分管理</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="toolbar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名/姓名"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="信用等级">
            <el-select
              v-model="searchForm.creditLevel"
              placeholder="请选择信用等级"
              clearable
              @change="handleSearch"
              style="width: 150px"
            >
              <el-option label="优秀 (90-100)" value="excellent" />
              <el-option label="良好 (75-89)" value="good" />
              <el-option label="中等 (60-74)" value="medium" />
              <el-option label="较差 (0-59)" value="poor" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 用户信誉分列表 -->
      <el-table
        :data="userList"
        v-loading="loading"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="realName" label="姓名" width="100" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="userType" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getUserTypeTag(row.userType)" size="small">
              {{ getUserTypeText(row.userType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creditScore" label="信誉分" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getCreditLevelTag(row.creditScore)" size="small">
              {{ row.creditScore }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creditLevel" label="信用等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getCreditLevelColor(row.creditLevel)" size="small">
              {{ getCreditLevelText(row.creditLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="280">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleViewLogs(row)"
            >
              <el-icon><Document /></el-icon>
              记录
            </el-button>
            <el-button 
              type="warning" 
              size="small" 
              @click="handleAdjustCredit(row)"
              v-if="currentUser?.userType === 3"
            >
              <el-icon><Edit /></el-icon>
              调整
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 信誉分记录对话框 -->
    <el-dialog
      v-model="logsDialogVisible"
      title="信誉分记录"
      width="700px"
    >
      <el-descriptions :column="2" border v-if="selectedUser">
        <el-descriptions-item label="用户">
          {{ selectedUser.username }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ selectedUser.realName }}
        </el-descriptions-item>
        <el-descriptions-item label="当前信誉分" :span="2">
          <el-tag :type="getCreditLevelTag(selectedUser.creditScore)">
            {{ selectedUser.creditScore }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      
      <el-table :data="creditLogs" v-loading="logsLoading" style="margin-top: 20px;">
        <el-table-column prop="createTime" label="时间" width="180" />
        <el-table-column prop="score" label="分数变化" width="100" align="center">
          <template #default="{ row }">
            <span :class="row.score > 0 ? 'score-increase' : 'score-decrease'">
              {{ row.score > 0 ? '+' : '' }}{{ row.score }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" show-overflow-tooltip />
        <el-table-column prop="operator" label="操作人" width="120" />
      </el-table>
    </el-dialog>

    <!-- 调整信誉分对话框 -->
    <el-dialog
      v-model="adjustDialogVisible"
      title="调整信誉分"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="adjustFormRef"
        :model="adjustForm"
        :rules="adjustRules"
        label-width="100px"
      >
        <el-form-item label="用户">
          <el-input v-model="adjustForm.username" disabled />
        </el-form-item>
        <el-form-item label="当前分数">
          <el-tag :type="getCreditLevelTag(adjustForm.currentScore)">
            {{ adjustForm.currentScore }}
          </el-tag>
        </el-form-item>
        <el-form-item label="调整分数" prop="score">
          <el-input-number
            v-model="adjustForm.score"
            :min="-100"
            :max="100"
            :step="5"
            style="width: 100%"
            placeholder="正数增加，负数减少"
          />
        </el-form-item>
        <el-form-item label="调整说明" prop="description">
          <el-input
            v-model="adjustForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入调整原因和说明"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitAdjust" :loading="adjusting">
          确认调整
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Document, Edit } from '@element-plus/icons-vue'
import { getUserList } from '@/api/user'
import { getUserCredit, getUserCreditLogs, adjustUserCredit } from '@/api/credit'

const loading = ref(false)
const logsLoading = ref(false)
const adjusting = ref(false)

const searchForm = reactive({
  username: '',
  creditLevel: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const userList = ref([])
const allUsers = ref([]) // 存储所有用户数据用于前端过滤

// 对话框
const logsDialogVisible = ref(false)
const adjustDialogVisible = ref(false)
const selectedUser = ref(null)
const creditLogs = ref([])

const adjustForm = reactive({
  userId: null,
  username: '',
  currentScore: 0,
  score: 0,
  description: ''
})

const adjustFormRef = ref(null)

const adjustRules = {
  score: [
    { required: true, message: '请输入调整分数', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入调整说明', trigger: 'blur' },
    { min: 5, max: 200, message: '说明长度在 5 到 200 个字符', trigger: 'blur' }
  ]
}

// 获取当前用户信息（用于判断是否为超级管理员）
const currentUser = ref(null)

const getUserTypeTag = (userType) => {
  const typeMap = {
    0: '',
    1: 'warning',
    2: 'success',
    3: 'danger'
  }
  return typeMap[userType] || 'info'
}

const getUserTypeText = (userType) => {
  const textMap = {
    0: '学生',
    1: '教师',
    2: '管理员',
    3: '超级管理员'
  }
  return textMap[userType] || '未知'
}

const getCreditLevelTag = (score) => {
  if (score >= 90) return 'success'
  if (score >= 75) return ''
  if (score >= 60) return 'warning'
  return 'danger'
}

const getCreditLevelColor = (level) => {
  const levelMap = {
    'excellent': 'success',
    'good': '',
    'medium': 'warning',
    'poor': 'danger'
  }
  return levelMap[level] || 'info'
}

const getCreditLevelText = (level) => {
  const textMap = {
    'excellent': '优秀',
    'good': '良好',
    'medium': '中等',
    'poor': '较差'
  }
  return textMap[level] || '未知'
}

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    const res = await getUserList()
    const users = Array.isArray(res.data) ? res.data : (res.data?.list || [])
    
    // 为每个用户获取信誉分
    const usersWithCredit = await Promise.all(
      users.map(async (user) => {
        try {
          const creditRes = await getUserCredit(user.id)
          return {
            ...user,
            creditScore: creditRes.data?.score || 100,
            creditLevel: calculateCreditLevel(creditRes.data?.score || 100)
          }
        } catch (error) {
          return {
            ...user,
            creditScore: 100,
            creditLevel: 'good'
          }
        }
      })
    )
    
    allUsers.value = usersWithCredit
    applyFilters()
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 计算信用等级
const calculateCreditLevel = (score) => {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'medium'
  return 'poor'
}

// 应用搜索过滤
const applyFilters = () => {
  let filtered = allUsers.value
  
  if (searchForm.username) {
    filtered = filtered.filter(user => 
      user.username.includes(searchForm.username) ||
      user.realName?.includes(searchForm.username)
    )
  }
  
  if (searchForm.creditLevel) {
    filtered = filtered.filter(user => user.creditLevel === searchForm.creditLevel)
  }
  
  userList.value = filtered
  pagination.total = filtered.length
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  applyFilters()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.creditLevel = ''
  pagination.page = 1
  applyFilters()
}

// 查看记录
const handleViewLogs = async (user) => {
  selectedUser.value = user
  logsLoading.value = true
  logsDialogVisible.value = true
  
  try {
    const res = await getUserCreditLogs(user.id, {
      page: 1,
      pageSize: 50
    })
    creditLogs.value = Array.isArray(res.data) ? res.data : (res.data?.list || [])
  } catch (error) {
    console.error('获取信誉分记录失败:', error)
    ElMessage.error('获取信誉分记录失败')
  } finally {
    logsLoading.value = false
  }
}

// 调整信誉分
const handleAdjustCredit = (user) => {
  adjustForm.userId = user.id
  adjustForm.username = user.username
  adjustForm.currentScore = user.creditScore
  adjustForm.score = 0
  adjustForm.description = ''
  adjustDialogVisible.value = true
  
  if (adjustFormRef.value) {
    adjustFormRef.value.clearValidate()
  }
}

// 提交调整
const handleSubmitAdjust = async () => {
  try {
    await adjustFormRef.value.validate()
    
    adjusting.value = true
    
    await adjustUserCredit(adjustForm.userId, {
      score: adjustForm.score,
      description: adjustForm.description
    })
    
    ElMessage.success('信誉分调整成功')
    adjustDialogVisible.value = false
    loadUserList()
  } catch (error) {
    if (error !== false) {
      console.error('调整信誉分失败:', error)
      ElMessage.error('调整信誉分失败')
    }
  } finally {
    adjusting.value = false
  }
}

// 分页
const handleSizeChange = () => {
  pagination.page = 1
  applyFilters()
}

const handlePageChange = () => {
  applyFilters()
}

onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.credit-management-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.score-increase {
  color: #67C23A;
  font-weight: bold;
}

.score-decrease {
  color: #F56C6C;
  font-weight: bold;
}

@media (max-width: 768px) {
  .credit-management-container {
    padding: 10px;
  }
  
  .search-form {
    display: block;
  }
  
  .search-form :deep(.el-form-item) {
    display: block;
    margin-right: 0;
  }
}
</style>
