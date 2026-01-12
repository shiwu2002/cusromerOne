<template>
  <div class="reservation-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>预约管理</span>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <div class="toolbar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户名">
            <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
            />
          </el-form-item>
          <el-form-item label="实验室">
            <el-input
              v-model="searchForm.laboratoryName"
              placeholder="请输入实验室名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
            >
              <el-option label="待审核" value="pending" />
              <el-option label="已批准" value="approved" />
              <el-option label="已拒绝" value="rejected" />
              <el-option label="已取消" value="cancelled" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </el-form-item>
          <el-form-item label="预约日期">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 预约列表 -->
      <el-table
        :data="reservationList"
        v-loading="loading"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="laboratoryName" label="实验室" width="180" />
        <el-table-column prop="date" label="预约日期" width="120" />
        <el-table-column prop="timeslot" label="时间段" width="150" />
        <el-table-column prop="purpose" label="预约目的" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">详情</el-button>
            <el-button
              v-if="row.status === 'approved'"
              type="success"
              size="small"
              @click="handleComplete(row)"
            >
              完成
            </el-button>
            <el-button
              v-if="['pending', 'approved'].includes(row.status)"
              type="danger"
              size="small"
              @click="handleCancel(row)"
            >
              取消
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
    
    <!-- 预约详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="预约详情"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="预约ID">
          {{ detailData.id }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detailData.status)" size="small">
            {{ getStatusText(detailData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="用户">
          {{ detailData.username }}
        </el-descriptions-item>
        <el-descriptions-item label="用户邮箱">
          {{ detailData.userEmail }}
        </el-descriptions-item>
        <el-descriptions-item label="实验室">
          {{ detailData.laboratoryName }}
        </el-descriptions-item>
        <el-descriptions-item label="实验室位置">
          {{ detailData.laboratoryLocation }}
        </el-descriptions-item>
        <el-descriptions-item label="预约日期">
          {{ detailData.date }}
        </el-descriptions-item>
        <el-descriptions-item label="时间段">
          {{ detailData.timeslot }}
        </el-descriptions-item>
        <el-descriptions-item label="参与人数">
          {{ detailData.participants }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ detailData.createdAt }}
        </el-descriptions-item>
        <el-descriptions-item label="预约目的" :span="2">
          {{ detailData.purpose }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.approver" label="审核人">
          {{ detailData.approver }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.approvedAt" label="审核时间">
          {{ detailData.approvedAt }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.rejectReason" label="拒绝原因" :span="2">
          {{ detailData.rejectReason }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getReservationList,
  searchReservations,
  getReservationDetail,
  cancelReservation,
  completeReservation
} from '@/api/reservation'

const loading = ref(false)
const detailVisible = ref(false)

const searchForm = reactive({
  username: '',
  laboratoryName: '',
  status: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const reservationList = ref([])
const detailData = ref({})

const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'info',
    completed: ''
  }
  return typeMap[status] || ''
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待审核',
    approved: '已批准',
    rejected: '已拒绝',
    cancelled: '已取消',
    completed: '已完成'
  }
  return textMap[status] || status
}

const loadReservationList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    const res = await getReservationList(params)
    reservationList.value = res.data.list || []
    pagination.total = res.data.total || 0
  } catch (error) {
    ElMessage.error('加载预约列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    
    if (searchForm.username) {
      params.username = searchForm.username
    }
    if (searchForm.laboratoryName) {
      params.laboratoryName = searchForm.laboratoryName
    }
    if (searchForm.status) {
      params.status = searchForm.status
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }
    
    const res = await searchReservations(params)
    reservationList.value = res.data.list || []
    pagination.total = res.data.total || 0
  } catch (error) {
    ElMessage.error('搜索预约失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.laboratoryName = ''
  searchForm.status = ''
  searchForm.dateRange = []
  pagination.page = 1
  loadReservationList()
}

const handleView = async (row) => {
  try {
    const res = await getReservationDetail(row.id)
    detailData.value = res.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('加载预约详情失败')
  }
}

const handleComplete = (row) => {
  ElMessageBox.confirm(
    `确定要将预约 ${row.id} 标记为已完成吗？`,
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(async () => {
    try {
      await completeReservation(row.id)
      ElMessage.success('预约已完成')
      loadReservationList()
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

const handleCancel = (row) => {
  ElMessageBox.prompt(
    '请输入取消原因',
    '取消预约',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入取消原因',
      inputValidator: (value) => {
        if (!value || value.trim().length === 0) {
          return '请输入取消原因'
        }
        return true
      }
    }
  ).then(async ({ value }) => {
    try {
      await cancelReservation(row.id, { reason: value })
      ElMessage.success('预约已取消')
      loadReservationList()
    } catch (error) {
      ElMessage.error('取消失败')
    }
  }).catch(() => {})
}

const handleSizeChange = () => {
  pagination.page = 1
  loadReservationList()
}

const handlePageChange = () => {
  loadReservationList()
}

onMounted(() => {
  loadReservationList()
})
</script>

<style scoped>
.reservation-management-container {
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

@media (max-width: 768px) {
  .reservation-management-container {
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
