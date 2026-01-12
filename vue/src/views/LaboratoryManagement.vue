<template>
  <div class="laboratory-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>实验室管理</span>
          <el-button type="primary" @click="handleAdd">新增实验室</el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <div class="toolbar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="实验室名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入实验室名称"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              @change="handleSearch"
            >
              <el-option label="可用" value="available" />
              <el-option label="维护中" value="maintenance" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 实验室列表 -->
      <el-table
        :data="laboratoryList"
        v-loading="loading"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="实验室名称" width="200" />
        <el-table-column prop="location" label="位置" width="200" />
        <el-table-column prop="capacity" label="容量" width="100" align="center" />
        <el-table-column prop="equipment" label="设备" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'available' ? 'success' : 'warning'" size="small">
              {{ row.status === 'available' ? '可用' : '维护中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reservationCount" label="预约次数" width="100" align="center" />
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.status === 'available' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'available' ? '维护' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
    
    <!-- 新增/编辑实验室对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="实验室名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入实验室名称" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="formData.location" placeholder="请输入位置信息" />
        </el-form-item>
        <el-form-item label="容量" prop="capacity">
          <el-input-number
            v-model="formData.capacity"
            :min="1"
            :max="999"
            placeholder="请输入容量"
          />
        </el-form-item>
        <el-form-item label="设备" prop="equipment">
          <el-input
            v-model="formData.equipment"
            type="textarea"
            :rows="3"
            placeholder="请输入设备信息，多个设备用逗号分隔"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入实验室描述"
          />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getLaboratoryList,
  searchLaboratories,
  addLaboratory,
  updateLaboratory,
  deleteLaboratory,
  updateLaboratoryStatus
} from '@/api/laboratory'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增实验室')
const isEdit = ref(false)
const formRef = ref(null)

const searchForm = reactive({
  name: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const laboratoryList = ref([])

const formData = reactive({
  id: null,
  name: '',
  location: '',
  capacity: 1,
  equipment: '',
  description: ''
})

const formRules = {
  name: [
    { required: true, message: '请输入实验室名称', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入位置信息', trigger: 'blur' }
  ],
  capacity: [
    { required: true, message: '请输入容量', trigger: 'blur' },
    { type: 'number', min: 1, message: '容量至少为1', trigger: 'blur' }
  ]
}

const loadLaboratoryList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const res = await getLaboratoryList(params)
    laboratoryList.value = res.data.list || []
    pagination.total = res.data.total || 0
  } catch (error) {
    ElMessage.error('加载实验室列表失败')
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
      ...searchForm
    }
    const res = await searchLaboratories(params)
    laboratoryList.value = res.data.list || []
    pagination.total = res.data.total || 0
  } catch (error) {
    ElMessage.error('搜索实验室失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
  pagination.page = 1
  loadLaboratoryList()
}

const handleAdd = () => {
  dialogTitle.value = '新增实验室'
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑实验室'
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    location: row.location,
    capacity: row.capacity,
    equipment: row.equipment,
    description: row.description
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value) {
          await updateLaboratory(formData.id, formData)
          ElMessage.success('更新实验室成功')
        } else {
          await addLaboratory(formData)
          ElMessage.success('新增实验室成功')
        }
        dialogVisible.value = false
        loadLaboratoryList()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新实验室失败' : '新增实验室失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    name: '',
    location: '',
    capacity: 1,
    equipment: '',
    description: ''
  })
}

const handleToggleStatus = (row) => {
  const newStatus = row.status === 'available' ? 'maintenance' : 'available'
  const action = newStatus === 'available' ? '启用' : '设为维护'
  
  ElMessageBox.confirm(
    `确定要${action}实验室 ${row.name} 吗？`,
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await updateLaboratoryStatus(row.id, { status: newStatus })
      ElMessage.success(`${action}成功`)
      loadLaboratoryList()
    } catch (error) {
      ElMessage.error(`${action}失败`)
    }
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除实验室 ${row.name} 吗？此操作不可恢复！`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(async () => {
    try {
      await deleteLaboratory(row.id)
      ElMessage.success('删除成功')
      loadLaboratoryList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleSizeChange = () => {
  pagination.page = 1
  loadLaboratoryList()
}

const handlePageChange = () => {
  loadLaboratoryList()
}

onMounted(() => {
  loadLaboratoryList()
})
</script>

<style scoped>
.laboratory-management-container {
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
  .laboratory-management-container {
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
