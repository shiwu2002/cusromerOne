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
          <el-form-item label="关键字">
            <el-input
              v-model="searchForm.keyword"
              placeholder="请输入关键字"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              @change="handleSearch"
            >
              <el-option
                v-for="opt in STATUS_OPTIONS"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
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
        <el-table-column prop="imageUrl" label="图片" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.imageUrl"
              :src="row.imageUrl"
              :preview-src-list="[row.imageUrl]"
              fit="cover"
              style="width: 60px; height: 60px; cursor: pointer;"
            />
            <span v-else>无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="labName" label="实验室名称" width="200" />
        <el-table-column prop="location" label="位置" width="200" />
        <el-table-column prop="capacity" label="容量" width="100" align="center" />
        <el-table-column prop="equipment" label="设备" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">
              {{ row.status === 1 ? '可用' : '维护中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '维护' : '启用' }}
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
        <el-form-item label="实验室名称" prop="labName">
          <el-input v-model="formData.labName" placeholder="请输入实验室名称" />
        </el-form-item>
        <el-form-item label="实验室编号" prop="labNumber">
          <el-input v-model="formData.labNumber" placeholder="请输入实验室编号" />
        </el-form-item>
        <el-form-item label="实验室类型" prop="labType">
          <el-select v-model="formData.labType" placeholder="请选择实验室类型" style="width: 100%">
            <el-option label="计算机" value="计算机" />
            <el-option label="物理" value="物理" />
            <el-option label="化学" value="化学" />
            <el-option label="生物" value="生物" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼栋" prop="building">
          <el-input v-model="formData.building" placeholder="请输入楼栋" />
        </el-form-item>
        <el-form-item label="楼层" prop="floor">
          <el-input v-model="formData.floor" placeholder="请输入楼层" />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="formData.location" placeholder="请输入详细位置信息" />
        </el-form-item>
        <el-form-item label="容量" prop="capacity">
          <el-input-number
            v-model="formData.capacity"
            :min="1"
            :max="999"
            placeholder="请输入容量"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="设备清单" prop="equipment">
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
        <el-form-item label="图片" prop="imageUrl">
          <div class="image-uploader">
            <el-image
              v-if="formData.imageUrl"
              :src="formData.imageUrl"
              fit="cover"
              class="image-preview"
            >
              <template #error>
                <div class="image-slot">图片加载失败</div>
              </template>
            </el-image>
            <div 
              v-else 
              class="image-uploader-trigger"
              @click="triggerImageUpload"
            >
              <el-icon><Plus /></el-icon>
              <span>点击上传</span>
            </div>
            <input
              ref="imageInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleImageChange"
            />
            <div class="image-tips">
              <el-button size="small" @click="triggerImageUpload">
                {{ formData.imageUrl ? '更换图片' : '上传图片' }}
              </el-button>
              <el-button 
                v-if="formData.imageUrl" 
                size="small" 
                type="danger" 
                @click="handleRemoveImage"
              >
                删除图片
              </el-button>
            </div>
          </div>
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
import { Plus } from '@element-plus/icons-vue'
import {
  getLaboratoryList,
  searchLaboratories,
  addLaboratory,
  updateLaboratory,
  deleteLaboratory,
  updateLaboratoryStatus
} from '@/api/laboratory'
import { uploadLabImage } from '@/api/file'

/* 状态选项常量，统一使用数字枚举，确保下拉框默认值可见 */
const STATUS_OPTIONS = [
  { label: '停用', value: 0 },
  { label: '正常', value: 1 }
]

/* 将后端返回的实验室类型统一映射到下拉框使用的中文值，解决默认值不显示的问题 */
const LAB_TYPE_MAP = {
  0: '计算机',
  1: '物理',
  2: '化学',
  3: '生物',
  4: '其他',
  COMPUTER: '计算机',
  PHYSICS: '物理',
  CHEMISTRY: '化学',
  BIOLOGY: '生物',
  OTHER: '其他',
}

/** 
 * 规范化实验室类型：
 * - 后端可能返回数字枚举或英文枚举，统一转成下拉框的中文字符串
 * - 若匹配不到，保持原值（空字符串则显示占位）
 */
const normalizeLabType = (v) => {
  if (v === null || v === undefined) return ''
  const key = typeof v === 'string' ? v.trim() : v
  return LAB_TYPE_MAP.hasOwnProperty(key) ? LAB_TYPE_MAP[key] : key
}

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增实验室')
const isEdit = ref(false)
const formRef = ref(null)
const imageInputRef = ref(null)

const searchForm = reactive({
  keyword: '',
  labType: '',
  // 默认显示“正常”状态，确保未点击时也有可见的默认值
  status: 1
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const laboratoryList = ref([])

const formData = reactive({
  id: null,
  labName: '',
  labNumber: '',
  labType: '',
  building: '',
  floor: '',
  location: '',
  capacity: 1,
  equipment: '',
  description: '',
  imageUrl: ''
})

const formRules = {
  labName: [
    { required: true, message: '请输入实验室名称', trigger: 'blur' }
  ],
  labNumber: [
    { required: true, message: '请输入实验室编号', trigger: 'blur' }
  ],
  labType: [
    { required: true, message: '请选择实验室类型', trigger: 'change' }
  ],
  building: [
    { required: true, message: '请输入楼栋', trigger: 'blur' }
  ],
  floor: [
    { required: true, message: '请输入楼层', trigger: 'blur' }
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
    // 处理API返回的数据，如果返回的是数组则直接使用，否则从data中获取
    if (Array.isArray(res.data)) {
      laboratoryList.value = res.data
      pagination.total = res.data.length
    } else {
      laboratoryList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载实验室列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  loading.value = true
  try {
    // 构建搜索参数，只传递有值的参数
    const params = {}
    
    if (searchForm.keyword) {
      params.keyword = searchForm.keyword
    }
    
    if (searchForm.labType) {
      params.labType = searchForm.labType
    }
    
    if (searchForm.status !== '' && searchForm.status !== null) {
      params.status = searchForm.status
    }
    
    const res = await searchLaboratories(params)
    // 处理API返回的数据，与loadLaboratoryList保持一致
    if (Array.isArray(res.data)) {
      laboratoryList.value = res.data
      pagination.total = res.data.length
    } else {
      laboratoryList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('搜索实验室失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.labType = ''
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
    labName: row.labName,
    labNumber: row.labNumber || '',
    labType: normalizeLabType(row.labType || ''),
    building: row.building || '',
    floor: row.floor || '',
    location: row.location || '',
    capacity: row.capacity || 1,
    equipment: row.equipment || '',
    description: row.description || '',
    imageUrl: row.imageUrl || ''
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const submitData = {
          id: formData.id,
          labName: formData.labName,
          labNumber: formData.labNumber,
          labType: formData.labType,
          building: formData.building,
          floor: formData.floor,
          location: formData.location,
          capacity: formData.capacity,
          equipment: formData.equipment,
          description: formData.description,
          imageUrl: formData.imageUrl,
          status: 1 // 新增时默认可用状态
        }
        
        if (isEdit.value) {
          await updateLaboratory(submitData)
          ElMessage.success('更新实验室成功')
        } else {
          // 新增时移除id字段
          const { id, ...addData } = submitData
          await addLaboratory(addData)
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
    labName: '',
    labNumber: '',
    labType: '',
    building: '',
    floor: '',
    location: '',
    capacity: 1,
    equipment: '',
    description: '',
    imageUrl: ''
  })
}

const handleToggleStatus = (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '设为维护'
  
  ElMessageBox.confirm(
    `确定要${action}实验室 ${row.labName || row.name} 吗？`,
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await updateLaboratoryStatus(row.id, newStatus)
      ElMessage.success(`${action}成功`)
      loadLaboratoryList()
    } catch (error) {
      ElMessage.error(`${action}失败`)
    }
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除实验室 ${row.labName || row.name} 吗？此操作不可恢复！`,
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

// 图片相关方法
const triggerImageUpload = () => {
  imageInputRef.value?.click()
}

const handleImageChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件大小（限制 5MB）
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 5MB')
    return
  }
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return
  }
  
  try {
    const uploadFormData = new FormData()
    // 使用 files 参数名，与后端接口匹配
    uploadFormData.append('files', file)
    
    const res = await uploadLabImage(uploadFormData)
    
    // 处理返回结果
    if (res.data?.images && res.data.images.length > 0) {
      // 取第一张图片的 URL
      const imageUrl = res.data.images[0].url || res.data.images[0].path
      formData.imageUrl = imageUrl
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error('图片上传失败：未返回图片信息')
    }
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('图片上传失败')
  } finally {
    // 清空 input，允许重复上传同一文件
    event.target.value = ''
  }
}

const handleRemoveImage = () => {
  ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    formData.imageUrl = ''
    ElMessage.success('图片已删除')
  }).catch(() => {})
}

onMounted(() => {
  // 使用默认状态=1触发搜索，让“未点击时”也能显示数据与默认项文本
  handleSearch()
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

.image-uploader {
  width: 100%;
}

.image-preview {
  width: 200px;
  height: 200px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}

.image-uploader-trigger {
  width: 200px;
  height: 200px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
  font-size: 14px;
  transition: border-color 0.3s;
}

.image-uploader-trigger:hover {
  border-color: #409eff;
}

.image-uploader-trigger .el-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 12px;
}

.image-tips {
  margin-top: 10px;
}

.image-tips .el-button {
  margin-right: 8px;
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
