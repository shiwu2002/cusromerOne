<template>
  <div class="report-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>报表导出</span>
        </div>
      </template>

      <!-- 预约报表导出 -->
      <el-card shadow="hover" class="report-card">
        <template #header>
          <div class="report-header">
            <el-icon><Document /></el-icon>
            <span>预约报表导出</span>
          </div>
        </template>
        
        <el-form :model="reservationForm" label-width="120px" class="report-form">
          <el-form-item label="开始日期">
            <el-date-picker
              v-model="reservationForm.startDate"
              type="date"
              placeholder="选择开始日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="结束日期">
            <el-date-picker
              v-model="reservationForm.endDate"
              type="date"
              placeholder="选择结束日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="实验室">
            <el-select
              v-model="reservationForm.laboratoryId"
              placeholder="请选择实验室"
              clearable
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="lab in laboratories"
                :key="lab.id"
                :label="lab.labName"
                :value="lab.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="预约状态">
            <el-select
              v-model="reservationForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 100%"
            >
              <el-option label="待审核" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="已拒绝" :value="2" />
              <el-option label="已取消" :value="3" />
              <el-option label="已完成" :value="4" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleExportReservation" :loading="exporting">
              <el-icon><Download /></el-icon>
              导出 Excel
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 统计报表导出 -->
      <el-card shadow="hover" class="report-card" style="margin-top: 20px;">
        <template #header>
          <div class="report-header">
            <el-icon><DataAnalysis /></el-icon>
            <span>统计报表导出</span>
          </div>
        </template>
        
        <el-form :model="statisticsForm" label-width="120px" class="report-form">
          <el-form-item label="开始日期">
            <el-date-picker
              v-model="statisticsForm.startDate"
              type="date"
              placeholder="选择开始日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="结束日期">
            <el-date-picker
              v-model="statisticsForm.endDate"
              type="date"
              placeholder="选择结束日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleExportStatistics" :loading="exporting">
              <el-icon><Download /></el-icon>
              导出 Excel
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, DataAnalysis, Download } from '@element-plus/icons-vue'
import { exportReservationReport, exportStatisticsReport } from '@/api/report'
import { getLaboratoryList } from '@/api/laboratory'

const exporting = ref(false)

const reservationForm = reactive({
  startDate: '',
  endDate: '',
  laboratoryId: null,
  status: null
})

const statisticsForm = reactive({
  startDate: '',
  endDate: ''
})

const laboratories = ref([])

// 加载实验室列表
const loadLaboratories = async () => {
  try {
    const res = await getLaboratoryList()
    if (Array.isArray(res.data)) {
      laboratories.value = res.data
    } else if (res.data?.list) {
      laboratories.value = res.data.list
    }
  } catch (error) {
    console.error('加载实验室列表失败:', error)
  }
}

// 导出预约报表
const handleExportReservation = async () => {
  if (!reservationForm.startDate || !reservationForm.endDate) {
    ElMessage.warning('请选择开始和结束日期')
    return
  }

  try {
    exporting.value = true
    
    const params = {
      startDate: reservationForm.startDate,
      endDate: reservationForm.endDate
    }
    
    if (reservationForm.laboratoryId) {
      params.laboratoryId = reservationForm.laboratoryId
    }
    
    if (reservationForm.status !== null && reservationForm.status !== undefined) {
      params.status = reservationForm.status
    }

    const response = await exportReservationReport(params)
    
    // 创建下载链接
    const blob = new Blob([response], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `预约报表_${reservationForm.startDate}_${reservationForm.endDate}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('预约报表导出成功')
  } catch (error) {
    console.error('导出预约报表失败:', error)
    ElMessage.error('导出预约报表失败')
  } finally {
    exporting.value = false
  }
}

// 导出统计报表
const handleExportStatistics = async () => {
  if (!statisticsForm.startDate || !statisticsForm.endDate) {
    ElMessage.warning('请选择开始和结束日期')
    return
  }

  try {
    exporting.value = true

    const response = await exportStatisticsReport({
      startDate: statisticsForm.startDate,
      endDate: statisticsForm.endDate
    })
    
    // 创建下载链接
    const blob = new Blob([response], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `统计报表_${statisticsForm.startDate}_${statisticsForm.endDate}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('统计报表导出成功')
  } catch (error) {
    console.error('导出统计报表失败:', error)
    ElMessage.error('导出统计报表失败')
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  loadLaboratories()
})
</script>

<style scoped>
.report-management-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.report-card {
  max-width: 600px;
}

.report-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: bold;
}

.report-header .el-icon {
  font-size: 20px;
  color: #409EFF;
}

.report-form {
  margin-top: 20px;
}
</style>
