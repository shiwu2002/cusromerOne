<template>
  <div class="timeslot-management-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="实验室">
          <el-select 
            v-model="searchForm.laboratoryId" 
            placeholder="请选择实验室"
            clearable
            filterable
            @change="handleSearch"
            style="width: 200px"
          >
            <el-option
              v-for="lab in laboratories"
              :key="lab.id"
              :label="lab.name"
              :value="lab.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select 
            v-model="searchForm.status" 
            placeholder="请选择状态"
            clearable
            @change="handleSearch"
            style="width: 150px"
          >
            <el-option label="可用" value="available" />
            <el-option label="禁用" value="disabled" />
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
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增时间段
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>时间段配置列表</span>
          <el-tag>共 {{ total }} 条记录</el-tag>
        </div>
      </template>

      <el-table 
        :data="tableData" 
        style="width: 100%" 
        v-loading="loading"
        stripe
        row-key="id"
      >
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="laboratory_name" label="实验室" width="150" />
        <el-table-column label="时间段" width="180">
          <template #default="scope">
            {{ scope.row.start_time }} - {{ scope.row.end_time }}
          </template>
        </el-table-column>
        <el-table-column prop="max_capacity" label="最大容量" width="100" />
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'available' ? 'success' : 'info'">
              {{ scope.row.status === 'available' ? '可用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small"
              @click="handleEdit(scope.row)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button 
              :type="scope.row.status === 'available' ? 'warning' : 'success'" 
              size="small"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'available' ? '禁用' : '启用' }}
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

    <!-- 新增/编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="实验室" prop="laboratory_id">
          <el-select 
            v-model="form.laboratory_id" 
            placeholder="请选择实验室"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="lab in laboratories"
              :key="lab.id"
              :label="lab.name"
              :value="lab.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="start_time">
          <el-time-picker
            v-model="form.start_time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="请选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="end_time">
          <el-time-picker
            v-model="form.end_time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="请选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="最大容量" prop="max_capacity">
          <el-input-number 
            v-model="form.max_capacity" 
            :min="1"
            :max="100"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number 
            v-model="form.sort_order" 
            :min="0"
            :max="999"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="available">可用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { 
  getTimeslotList,
  addTimeslot,
  updateTimeslot,
  deleteTimeslot,
  updateTimeslotStatus
} from '@/api/timeslot'
import { getLaboratoryList } from '@/api/laboratory'

// 搜索表单
const searchForm = reactive({
  laboratoryId: null,
  status: ''
})

// 实验室列表
const laboratories = ref([])

// 表格数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = computed(() => form.id ? '编辑时间段' : '新增时间段')
const form = reactive({
  id: null,
  laboratory_id: null,
  start_time: '',
  end_time: '',
  max_capacity: 1,
  sort_order: 0,
  status: 'available'
})
const formRef = ref(null)
const submitting = ref(false)

// 表单验证规则
const rules = {
  laboratory_id: [
    { required: true, message: '请选择实验室', trigger: 'change' }
  ],
  start_time: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  end_time: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  max_capacity: [
    { required: true, message: '请输入最大容量', trigger: 'blur' }
  ],
  sort_order: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 加载实验室列表
const loadLaboratories = async () => {
  try {
    const res = await getLaboratoryList({ page: 1, page_size: 1000 })
    laboratories.value = res.data.laboratories
  } catch (error) {
    ElMessage.error(error.message || '获取实验室列表失败')
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      laboratory_id: searchForm.laboratoryId || undefined,
      status: searchForm.status || undefined
    }

    const res = await getTimeslotList(params)
    tableData.value = res.data.timeslots
    total.value = res.data.total
  } catch (error) {
    ElMessage.error(error.message || '获取时间段列表失败')
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
  searchForm.laboratoryId = null
  searchForm.status = ''
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

// 新增
const handleAdd = () => {
  form.id = null
  form.laboratory_id = null
  form.start_time = ''
  form.end_time = ''
  form.max_capacity = 1
  form.sort_order = 0
  form.status = 'available'
  dialogVisible.value = true
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 编辑
const handleEdit = (row) => {
  form.id = row.id
  form.laboratory_id = row.laboratory_id
  form.start_time = row.start_time
  form.end_time = row.end_time
  form.max_capacity = row.max_capacity
  form.sort_order = row.sort_order
  form.status = row.status
  dialogVisible.value = true
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    // 验证时间段
    if (form.start_time >= form.end_time) {
      ElMessage.warning('结束时间必须大于开始时间')
      return
    }

    submitting.value = true
    const data = {
      laboratory_id: form.laboratory_id,
      start_time: form.start_time,
      end_time: form.end_time,
      max_capacity: form.max_capacity,
      sort_order: form.sort_order,
      status: form.status
    }

    if (form.id) {
      await updateTimeslot(form.id, data)
      ElMessage.success('更新成功')
    } else {
      await addTimeslot(data)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}

// 切换状态
const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === 'available' ? 'disabled' : 'available'
    const action = newStatus === 'available' ? '启用' : '禁用'
    
    await ElMessageBox.confirm(
      `确认${action}该时间段？`,
      '状态切换',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await updateTimeslotStatus(row.id, { status: newStatus })
    ElMessage.success(`${action}成功`)
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确认删除该时间段？删除后将无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    await deleteTimeslot(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 初始化
onMounted(() => {
  loadLaboratories()
  loadData()
})
</script>

<style scoped>
.timeslot-management-container {
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
</style>
