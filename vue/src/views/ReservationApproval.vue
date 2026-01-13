<template>
  <div class="reservation-approval-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input 
            v-model="searchForm.username" 
            placeholder="请输入用户名"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="实验室">
          <el-input 
            v-model="searchForm.laboratoryName" 
            placeholder="请输入实验室名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="预约日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            clearable
            @clear="handleSearch"
          />
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
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>待审核预约列表</span>
          <el-tag type="warning">共 {{ total }} 条待审核</el-tag>
        </div>
      </template>

      <el-table 
        :data="tableData" 
        style="width: 100%" 
        v-loading="loading"
        stripe
      >
        <el-table-column prop="id" label="预约ID" width="80" />
        <el-table-column prop="userName" label="预约用户" width="120" />
        <el-table-column prop="labName" label="实验室" width="180" />
        <el-table-column prop="experimentName" label="实验名称" width="150" show-overflow-tooltip />
        <el-table-column prop="reserveDate" label="预约日期" width="120" />
        <el-table-column prop="timeSlot" label="预约时间" width="150" />
        <el-table-column prop="purpose" label="预约目的" min-width="120" show-overflow-tooltip />
        <el-table-column prop="peopleNum" label="人数" width="80" align="center" />
        <el-table-column prop="createTime" label="申请时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small"
              @click="handleApprove(scope.row)"
            >
              <el-icon><Check /></el-icon>
              批准
            </el-button>
            <el-button 
              type="danger" 
              size="small"
              @click="handleReject(scope.row)"
            >
              <el-icon><Close /></el-icon>
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 拒绝对话框 -->
    <el-dialog 
      v-model="rejectDialogVisible" 
      title="拒绝预约" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="rejectForm" :rules="rejectRules" ref="rejectFormRef" label-width="100px">
        <el-form-item label="预约信息">
          <div class="reject-info">
            <p><strong>用户：</strong>{{ currentReservation?.userName }}</p>
            <p><strong>实验室：</strong>{{ currentReservation?.labName }}</p>
            <p><strong>实验名称：</strong>{{ currentReservation?.experimentName }}</p>
            <p><strong>日期：</strong>{{ currentReservation?.reserveDate }}</p>
            <p><strong>时间：</strong>{{ currentReservation?.timeSlot }}</p>
          </div>
        </el-form-item>
        <el-form-item label="拒绝原因" prop="reason">
          <el-input 
            v-model="rejectForm.reason" 
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject" :loading="rejecting">
          确认拒绝
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Check, Close } from '@element-plus/icons-vue'
import { 
  getPendingReservations, 
  approveReservation, 
  rejectReservation 
} from '@/api/reservation'

// 搜索表单
const searchForm = reactive({
  username: '',
  laboratoryName: '',
  dateRange: null
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 拒绝对话框
const rejectDialogVisible = ref(false)
const currentReservation = ref(null)
const rejectForm = reactive({
  reason: ''
})
const rejectFormRef = ref(null)
const rejecting = ref(false)

// 拒绝表单验证规则
const rejectRules = {
  reason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' },
    { min: 5, max: 200, message: '拒绝原因长度在5到200个字符', trigger: 'blur' }
  ]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    let params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }

    // 如果有搜索条件，使用搜索接口
    if (searchForm.username || searchForm.laboratoryName || searchForm.dateRange) {
      params = {
        ...params,
        userName: searchForm.username || undefined,
        labName: searchForm.laboratoryName || undefined,
        startDate: searchForm.dateRange?.[0] || undefined,
        endDate: searchForm.dateRange?.[1] || undefined
      }
    }

    const res = await getPendingReservations(params)
    // 处理API返回的数据，过滤出待审核状态（status=0）的预约
    if (Array.isArray(res.data)) {
      tableData.value = res.data.filter(item => item.status === 0)
      total.value = tableData.value.length
    } else {
      tableData.value = res.data.reservations || res.data.list || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error(error.message || '获取待审核预约列表失败')
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
  searchForm.username = ''
  searchForm.laboratoryName = ''
  searchForm.dateRange = null
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

// 批准预约
const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认批准用户 ${row.userName} 在 ${row.reserveDate} ${row.timeSlot} 对 ${row.labName} 的预约申请？`,
      '批准确认',
      {
        confirmButtonText: '确认批准',
        cancelButtonText: '取消',
        type: 'success'
      }
    )

    await approveReservation(row.id)
    ElMessage.success('预约已批准')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批准预约失败')
    }
  }
}

// 拒绝预约
const handleReject = (row) => {
  currentReservation.value = row
  rejectForm.reason = ''
  rejectDialogVisible.value = true
  // 重置表单验证
  if (rejectFormRef.value) {
    rejectFormRef.value.clearValidate()
  }
}

// 确认拒绝
const confirmReject = async () => {
  try {
    await rejectFormRef.value.validate()
    
    rejecting.value = true
    await rejectReservation(currentReservation.value.id, {
      reason: rejectForm.reason
    })
    
    ElMessage.success('预约已拒绝')
    rejectDialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== false) { // 表单验证失败会返回false
      ElMessage.error(error.message || '拒绝预约失败')
    }
  } finally {
    rejecting.value = false
  }
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.reservation-approval-container {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.reject-info {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.reject-info p {
  margin: 8px 0;
  color: #606266;
}

.reject-info strong {
  color: #303133;
  margin-right: 8px;
}
</style>
