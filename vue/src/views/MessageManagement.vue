<template>
  <div class="message-management-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="接收者">
          <el-input 
            v-model="searchForm.receiverUsername" 
            placeholder="请输入用户名"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="消息类型">
          <el-select 
            v-model="searchForm.type" 
            placeholder="请选择类型"
            clearable
            @change="handleSearch"
            style="width: 150px"
          >
            <el-option label="系统通知" value="system" />
            <el-option label="预约通知" value="reservation" />
            <el-option label="审核通知" value="approval" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select 
            v-model="searchForm.isRead" 
            placeholder="请选择状态"
            clearable
            @change="handleSearch"
            style="width: 150px"
          >
            <el-option label="未读" :value="false" />
            <el-option label="已读" :value="true" />
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
          <el-button type="success" @click="handleSendSystemMessage">
            <el-icon><Promotion /></el-icon>
            发送系统消息
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>消息列表</span>
          <div>
            <el-tag type="warning" style="margin-right: 10px">
              未读: {{ unreadCount }}
            </el-tag>
            <el-tag>共 {{ total }} 条记录</el-tag>
          </div>
        </div>
      </template>

      <el-table 
        :data="tableData" 
        style="width: 100%" 
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="receiver_username" label="接收者" width="120" />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.is_read ? 'info' : 'success'">
              {{ scope.row.is_read ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="发送时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small"
              @click="handleViewDetail(scope.row)"
            >
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button 
              type="danger" 
              size="small"
              @click="handleDelete(scope.row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="batch-actions">
        <el-button 
          type="danger" 
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </div>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </el-card>

    <!-- 消息详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      title="消息详情" 
      width="600px"
    >
      <el-descriptions :column="1" border v-if="currentMessage">
        <el-descriptions-item label="消息ID">
          {{ currentMessage.id }}
        </el-descriptions-item>
        <el-descriptions-item label="消息类型">
          <el-tag :type="getTypeTagType(currentMessage.type)">
            {{ getTypeName(currentMessage.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="接收者">
          {{ currentMessage.receiver_username }}
        </el-descriptions-item>
        <el-descriptions-item label="标题">
          {{ currentMessage.title }}
        </el-descriptions-item>
        <el-descriptions-item label="内容">
          <div class="message-content">{{ currentMessage.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentMessage.is_read ? 'info' : 'success'">
            {{ currentMessage.is_read ? '已读' : '未读' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发送时间">
          {{ currentMessage.created_at }}
        </el-descriptions-item>
        <el-descriptions-item label="阅读时间" v-if="currentMessage.read_at">
          {{ currentMessage.read_at }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 发送系统消息对话框 -->
    <el-dialog 
      v-model="sendDialogVisible" 
      title="发送系统消息" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="sendForm" :rules="sendRules" ref="sendFormRef" label-width="100px">
        <el-form-item label="发送方式" prop="sendType">
          <el-radio-group v-model="sendForm.sendType">
            <el-radio value="all">全体用户</el-radio>
            <el-radio value="specific">指定用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item 
          label="接收者" 
          prop="receiverIds" 
          v-if="sendForm.sendType === 'specific'"
        >
          <el-select 
            v-model="sendForm.receiverIds" 
            placeholder="请选择接收用户"
            multiple
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="`${user.username} (${user.email})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="消息标题" prop="title">
          <el-input 
            v-model="sendForm.title" 
            placeholder="请输入消息标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input 
            v-model="sendForm.content" 
            type="textarea"
            :rows="6"
            placeholder="请输入消息内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sendDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSend" :loading="sending">
          发送
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Promotion, View, Delete } from '@element-plus/icons-vue'
import { 
  getMessageList,
  sendSystemMessage,
  sendBatchMessages,
  deleteMessage,
  batchDeleteMessages,
  getUnreadCount
} from '@/api/message'
import { getUserList } from '@/api/user'

// 搜索表单
const searchForm = reactive({
  receiverUsername: '',
  type: '',
  isRead: null
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const unreadCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 批量选择
const selectedIds = ref([])

// 消息详情
const detailDialogVisible = ref(false)
const currentMessage = ref(null)

// 发送消息
const sendDialogVisible = ref(false)
const sendForm = reactive({
  sendType: 'all',
  receiverIds: [],
  title: '',
  content: ''
})
const sendFormRef = ref(null)
const sending = ref(false)
const users = ref([])

// 发送表单验证规则
const sendRules = {
  sendType: [
    { required: true, message: '请选择发送方式', trigger: 'change' }
  ],
  receiverIds: [
    { 
      required: true, 
      message: '请选择接收用户', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (sendForm.sendType === 'specific' && (!value || value.length === 0)) {
          callback(new Error('请选择接收用户'))
        } else {
          callback()
        }
      }
    }
  ],
  title: [
    { required: true, message: '请输入消息标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在2到100个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入消息内容', trigger: 'blur' },
    { min: 5, max: 500, message: '内容长度在5到500个字符', trigger: 'blur' }
  ]
}

// 获取类型名称
const getTypeName = (type) => {
  const typeMap = {
    system: '系统通知',
    reservation: '预约通知',
    approval: '审核通知'
  }
  return typeMap[type] || type
}

// 获取类型标签类型
const getTypeTagType = (type) => {
  const typeMap = {
    system: 'info',
    reservation: 'success',
    approval: 'warning'
  }
  return typeMap[type] || 'info'
}

// 加载用户列表
const loadUsers = async () => {
  try {
    const res = await getUserList({ page: 1, page_size: 1000 })
    users.value = res.data.users
  } catch (error) {
    ElMessage.error(error.message || '获取用户列表失败')
  }
}

// 加载未读数量
const loadUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    unreadCount.value = res.data.count
  } catch (error) {
    console.error('获取未读数量失败:', error)
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      receiver_username: searchForm.receiverUsername || undefined,
      type: searchForm.type || undefined,
      is_read: searchForm.isRead !== null ? searchForm.isRead : undefined
    }

    const res = await getMessageList(params)
    tableData.value = res.data.messages
    total.value = res.data.total
    
    // 同时刷新未读数量
    loadUnreadCount()
  } catch (error) {
    ElMessage.error(error.message || '获取消息列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.receiverUsername = ''
  searchForm.type = ''
  searchForm.isRead = null
  currentPage.value = 1
  loadData()
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadData()
}

// 批量选择
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 查看详情
const handleViewDetail = (row) => {
  currentMessage.value = row
  detailDialogVisible.value = true
}

// 发送系统消息
const handleSendSystemMessage = () => {
  sendForm.sendType = 'all'
  sendForm.receiverIds = []
  sendForm.title = ''
  sendForm.content = ''
  sendDialogVisible.value = true
  if (sendFormRef.value) {
    sendFormRef.value.clearValidate()
  }
}

// 确认发送
const confirmSend = async () => {
  try {
    await sendFormRef.value.validate()

    sending.value = true
    const data = {
      title: sendForm.title,
      content: sendForm.content
    }

    if (sendForm.sendType === 'all') {
      await sendSystemMessage(data)
      ElMessage.success('系统消息已发送给全体用户')
    } else {
      await sendBatchMessages({
        ...data,
        receiver_ids: sendForm.receiverIds
      })
      ElMessage.success(`消息已发送给 ${sendForm.receiverIds.length} 位用户`)
    }

    sendDialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.message || '发送消息失败')
    }
  } finally {
    sending.value = false
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确认删除该消息？删除后将无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    await deleteMessage(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${selectedIds.value.length} 条消息？删除后将无法恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    await batchDeleteMessages({ message_ids: selectedIds.value })
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

// 初始化
onMounted(() => {
  loadUsers()
  loadData()
})
</script>

<style scoped>
.message-management-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-actions {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}
</style>
