<template>
  <div class="my-credit-container">
    <el-row :gutter="20">
      <!-- 左侧：我的信誉分 -->
      <el-col :xs="24" :md="16">
        <el-card class="credit-card">
          <template #header>
            <div class="card-header">
              <span>我的信誉分</span>
              <el-button 
                type="primary" 
                size="small"
                @click="handleRefresh"
                v-if="creditData.score < 60"
              >
                <el-icon><Refresh /></el-icon>
                参加培训恢复分数
              </el-button>
            </div>
          </template>
          
          <div class="credit-content" v-loading="loading">
            <div class="score-display">
              <div class="score-circle" :class="getScoreClass(creditData.score)">
                <span class="score-number">{{ creditData.score }}</span>
                <span class="score-label">当前分数</span>
              </div>
              
              <div class="score-details">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="信用等级">
                    <el-tag :type="getLevelTag(creditData.level)" size="large">
                      {{ getLevelText(creditData.level) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="历史最高分">
                    <span class="highlight">{{ creditData.maxScore }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="累计加分次数">
                    {{ creditData.totalAddTimes }}
                  </el-descriptions-item>
                  <el-descriptions-item label="累计扣分次数">
                    {{ creditData.totalSubtractTimes }}
                  </el-descriptions-item>
                  <el-descriptions-item label="连续准时使用次数">
                    <el-tag type="success" effect="plain">
                      {{ creditData.continuousOnTimeCount }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="用户类型">
                    {{ getUserTypeText(userType) }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
            
            <!-- 低分提示 -->
            <el-alert
              v-if="creditData.score < 60"
              title="信誉分过低警告"
              type="error"
              :closable="false"
              show-icon
              class="warning-alert"
            >
              <template #default>
                <p>您的当前信誉分为 <strong>{{ creditData.score }}</strong> 分，已低于 60 分的最低限制。</p>
                <p style="margin-top: 10px;">
                  <el-button type="danger" size="small" @click="handleRecoverTraining">
                    <el-icon><VideoPlay /></el-icon>
                    参加实验室安全培训（+20 分）
                  </el-button>
                </p>
                <p class="alert-note">
                  💡 参加培训可恢复 20 分，每月限 1 次
                </p>
              </template>
            </el-alert>
            
            <!-- 高分鼓励 -->
            <el-alert
              v-else-if="creditData.score >= 120"
              title="信誉分优秀"
              type="success"
              :closable="false"
              show-icon
              class="success-alert"
            >
              <template #default>
                <p>🎉 恭喜！您的信誉分已达到 <strong>{{ creditData.score }}</strong> 分，享有免审核快速通道特权！</p>
              </template>
            </el-alert>
          </div>
        </el-card>
        
        <!-- 最近记录 -->
        <el-card class="logs-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>最近信誉分变动记录</span>
              <el-button type="primary" link @click="handleViewAllLogs">
                查看全部
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          
          <el-table :data="recentLogs" v-loading="logsLoading" :show-header="true">
            <el-table-column prop="createTime" label="时间" width="180" />
            <el-table-column prop="changeScore" label="分数变化" width="100" align="center">
              <template #default="{ row }">
                <span :class="row.changeScore > 0 ? 'score-increase' : 'score-decrease'">
                  {{ row.changeScore > 0 ? '+' : '' }}{{ row.changeScore }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" show-overflow-tooltip min-width="200" />
            <el-table-column prop="operator" label="操作人" width="120" />
          </el-table>
        </el-card>
      </el-col>
      
      <!-- 右侧：信誉分规则说明 -->
      <el-col :xs="24" :md="8">
        <el-card class="rules-card">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>信誉分规则说明</span>
            </div>
          </template>
          
          <div class="rules-content" v-loading="rulesLoading">
            <!-- 信用等级表 -->
            <div class="rule-section">
              <h4 class="rule-title">
                <el-icon><Star /></el-icon>
                信用等级与权限
              </h4>
              <el-table :data="levelRules" size="small" :show-header="true" class="rules-table">
                <el-table-column prop="level" label="等级" width="60" align="center" />
                <el-table-column prop="range" label="分数范围" width="100" align="center" />
                <el-table-column prop="name" label="等级名称" width="80" align="center" />
                <el-table-column prop="permission" label="预约权限" />
              </el-table>
            </div>
            
            <!-- 加分规则 -->
            <div class="rule-section">
              <h4 class="rule-title">
                <el-icon><Plus /></el-icon>
                加分规则
              </h4>
              <el-table :data="addRules" size="small" :show-header="true" class="rules-table">
                <el-table-column prop="event" label="事件" />
                <el-table-column prop="score" label="加分" width="70" align="center">
                  <template #default="{ row }">
                    <span class="score-plus">+{{ row.score }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            
            <!-- 扣分规则 -->
            <div class="rule-section">
              <h4 class="rule-title">
                <el-icon><Minus /></el-icon>
                扣分规则
              </h4>
              <el-table :data="subtractRules" size="small" :show-header="true" class="rules-table">
                <el-table-column prop="event" label="事件" />
                <el-table-column prop="score" label="扣分" width="70" align="center">
                  <template #default="{ row }">
                    <span class="score-minus">{{ row.score }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            
            <!-- 恢复机制 -->
            <div class="rule-section">
              <h4 class="rule-title">
                <el-icon><RefreshLeft /></el-icon>
                分数恢复机制
              </h4>
              <el-alert
                title="信誉分修复"
                type="info"
                :closable="false"
                show-icon
                class="recovery-alert"
              >
                <template #default>
                  <p>信誉分低于 <strong>60 分</strong> 时，可通过参加实验室安全培训恢复 <strong>20 分</strong>。</p>
                  <p class="note" style="margin-top: 8px; font-size: 13px;">
                    ⚠️ 注意：每月限 1 次
                  </p>
                </template>
              </el-alert>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 完整记录对话框 -->
    <el-dialog
      v-model="logsDialogVisible"
      title="信誉分变动记录"
      width="800px"
    >
      <el-table :data="allLogs" v-loading="logsLoading">
        <el-table-column prop="createTime" label="时间" width="180" />
        <el-table-column prop="scoreBefore" label="变动前分数" width="100" align="center" />
        <el-table-column prop="scoreAfter" label="变动后分数" width="100" align="center" />
        <el-table-column prop="changeScore" label="变化分数" width="100" align="center">
          <template #default="{ row }">
            <span :class="row.changeScore > 0 ? 'score-increase' : 'score-decrease'">
              {{ row.changeScore > 0 ? '+' : '' }}{{ row.changeScore }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" show-overflow-tooltip min-width="200" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="changeType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getChangeTypeTag(row.changeType)" size="small">
              {{ getChangeTypeText(row.changeType) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <el-button @click="logsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Document, Star, Plus, Minus, Refresh, RefreshLeft, 
  ArrowRight, VideoPlay 
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store'
import { 
  getMyCredit, 
  getMyCreditLogs, 
  getCreditRules, 
  trainingRecoverScore 
} from '@/api/credit'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const logsLoading = ref(false)
const rulesLoading = ref(false)
const recovering = ref(false)

const creditData = ref({
  id: null,
  userId: null,
  score: 0,
  maxScore: 0,
  totalAddTimes: 0,
  totalSubtractTimes: 0,
  continuousOnTimeCount: 0,
  level: 0,
  remark: null
})

const recentLogs = ref([])
const allLogs = ref([])
const logsDialogVisible = ref(false)

const userType = ref(null)

// 规则数据
const levelRules = ref([])
const addRules = ref([])
const subtractRules = ref([])

// 获取用户类型文本
const getUserTypeText = (userType) => {
  const textMap = {
    0: '学生',
    1: '老师',
    2: '管理员',
    3: '超级管理员'
  }
  return textMap[userType] || '未知'
}

// 获取分数样式类
const getScoreClass = (score) => {
  if (score >= 120) return 'excellent'
  if (score >= 100) return 'good'
  if (score >= 80) return 'normal'
  if (score >= 60) return 'warning'
  return 'danger'
}

// 获取等级标签颜色
const getLevelTag = (level) => {
  const tagMap = {
    0: 'danger',
    1: 'warning',
    2: '',
    3: 'success',
    4: 'success'
  }
  return tagMap[level] || 'info'
}

// 获取等级文本
const getLevelText = (level) => {
  const textMap = {
    0: '差',
    1: '中',
    2: '良',
    3: '优',
    4: '极好'
  }
  return textMap[level] || '未知'
}

// 获取变动类型标签
const getChangeTypeTag = (type) => {
  const typeMap = {
    1: 'success',
    2: 'success',
    3: 'warning',
    4: 'danger',
    5: '',
    6: 'info'
  }
  return typeMap[type] || 'info'
}

// 获取变动类型文本
const getChangeTypeText = (type) => {
  const textMap = {
    1: '预约成功',
    2: '准时使用',
    3: '取消预约',
    4: '爽约',
    5: '管理员调整',
    6: '其他'
  }
  return textMap[type] || '未知'
}

// 加载我的信誉分
const loadMyCredit = async () => {
  loading.value = true
  try {
    const res = await getMyCredit()
    if (res.data) {
      creditData.value = res.data.credit || {}
      // 获取当前用户类型
      const userInfo = userStore.userInfo
      userType.value = userInfo?.userType
    }
  } catch (error) {
    console.error('获取信誉分失败:', error)
    ElMessage.error('获取信誉分失败')
  } finally {
    loading.value = false
  }
}

// 加载最近记录
const loadRecentLogs = async () => {
  logsLoading.value = true
  try {
    const res = await getMyCreditLogs({ page: 1, pageSize: 5 })
    recentLogs.value = Array.isArray(res.data) ? res.data : (res.data?.list || [])
  } catch (error) {
    console.error('获取记录失败:', error)
  } finally {
    logsLoading.value = false
  }
}

// 加载完整记录
const loadAllLogs = async () => {
  logsLoading.value = true
  try {
    const res = await getMyCreditLogs({ page: 1, pageSize: 100 })
    allLogs.value = Array.isArray(res.data) ? res.data : (res.data?.list || [])
  } catch (error) {
    console.error('获取完整记录失败:', error)
  } finally {
    logsLoading.value = false
  }
}

// 加载规则说明
const loadCreditRules = async () => {
  rulesLoading.value = true
  try {
    const res = await getCreditRules()
    const rules = res.data
    
    if (rules) {
      // 处理信用等级规则
      if (rules.levels) {
        levelRules.value = Object.entries(rules.levels).map(([key, value]) => {
          const [range, name] = value.split(' - ')
          return {
            level: key,
            range: range.replace(/[()]/g, ''),
            name: name.split(' ')[0],
            permission: name.split(' - ')[1] || ''
          }
        })
      }
      
      // 处理加分规则
      if (rules.addRules) {
        addRules.value = Object.entries(rules.addRules).map(([event, score]) => ({
          event,
          score
        }))
      }
      
      // 处理扣分规则
      if (rules.subtractRules) {
        subtractRules.value = Object.entries(rules.subtractRules).map(([event, score]) => ({
          event,
          score
        }))
      }
    }
  } catch (error) {
    console.error('获取规则失败:', error)
  } finally {
    rulesLoading.value = false
  }
}

// 参加培训恢复分数
const handleRecoverTraining = async () => {
  if (creditData.value.score >= 60) {
    ElMessage.warning('您的信誉分不低于 60 分，无需参加培训')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '参加实验室安全培训后可恢复 20 分，每月限 1 次。确认开始培训？',
      '培训确认',
      {
        confirmButtonText: '开始培训',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    recovering.value = true
    await trainingRecoverScore()
    
    ElMessage.success('培训完成，信誉分 +20')
    await loadMyCredit()
  } catch (error) {
    if (error !== false) {
      console.error('培训失败:', error)
      ElMessage.error(error.message || '培训失败')
    }
  } finally {
    recovering.value = false
  }
}

// 刷新数据
const handleRefresh = () => {
  loadMyCredit()
  loadRecentLogs()
}

// 查看全部记录
const handleViewAllLogs = async () => {
  await loadAllLogs()
  logsDialogVisible.value = true
}

onMounted(() => {
  loadMyCredit()
  loadRecentLogs()
  loadCreditRules()
})
</script>

<style scoped>
.my-credit-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 80px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.credit-card, .logs-card, .rules-card {
  border-radius: 12px;
  overflow: hidden;
}

/* 分数显示区域 */
.credit-content {
  padding: 20px 0;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 30px;
}

.score-circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 8px solid;
  position: relative;
  flex-shrink: 0;
}

.score-circle.excellent {
  border-color: #95D47A;
  background: linear-gradient(135deg, #67C23A 0%, #95D47A 100%);
  color: white;
}

.score-circle.good {
  border-color: #67C23A;
  background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
  color: white;
}

.score-circle.normal {
  border-color: #409EFF;
  background: linear-gradient(135deg, #409EFF 0%, #79BBFF 100%);
  color: white;
}

.score-circle.warning {
  border-color: #E6A23C;
  background: linear-gradient(135deg, #E6A23C 0%, #F5C885 100%);
  color: white;
}

.score-circle.danger {
  border-color: #F56C6C;
  background: linear-gradient(135deg, #F56C6C 0%, #F89191 100%);
  color: white;
}

.score-number {
  font-size: 48px;
  font-weight: bold;
  line-height: 1;
}

.score-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 8px;
}

.score-details {
  flex: 1;
}

.highlight {
  color: #E6A23C;
  font-weight: bold;
  font-size: 16px;
}

/* 警告提示 */
.warning-alert, .success-alert {
  margin-top: 20px;
}

.alert-note {
  margin-top: 10px;
  font-size: 13px;
  color: #606266;
}

/* 规则内容 */
.rules-content {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.rule-section {
  margin-bottom: 25px;
}

.rule-section:last-child {
  margin-bottom: 0;
}

.rule-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #303133;
  font-size: 15px;
  font-weight: 600;
}

.rules-table {
  width: 100%;
}

.rules-table :deep(.el-table__header th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.score-plus {
  color: #67C23A;
  font-weight: bold;
}

.score-minus {
  color: #F56C6C;
  font-weight: bold;
}

.recovery-alert {
  background: linear-gradient(135deg, #ecf5ff 0%, #f4f4f5 100%);
}

.recovery-alert .note {
  color: #E6A23C;
  font-weight: 500;
}

/* 分数变化颜色 */
.score-increase {
  color: #67C23A;
  font-weight: bold;
}

.score-decrease {
  color: #F56C6C;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .my-credit-container {
    padding: 10px;
  }
  
  .score-display {
    flex-direction: column;
    gap: 20px;
  }
  
  .score-circle {
    width: 140px;
    height: 140px;
  }
  
  .score-number {
    font-size: 36px;
  }
}

/* 滚动条样式 */
.rules-content::-webkit-scrollbar {
  width: 6px;
}

.rules-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.rules-content::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
