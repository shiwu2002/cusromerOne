// pages/lab-selection/lab-selection.js
import api from '../../api/index'

Page({
  data: {
    // 搜索关键词
    keyword: '',
    // 实验室列表
    laboratories: [],
    // 筛选条件
    statusFilter: null,
    // 筛选标签
    filterVisible: false,
    // 加载状态
    loading: false,
    // 分页相关
    page: 1,
    pageSize: 10,
    hasMore: true,
    // 完整数据列表（用于前端筛选）
    filteredData: []
  },

  onLoad() {
    this.loadLaboratories()
  },

  /**
   * 加载实验室列表
   */
  async loadLaboratories() {
    if (this.data.loading) return

    this.setData({ loading: true })

    try {
      let response
      const { keyword, statusFilter } = this.data

      // 复用实验室列表页面的搜索逻辑
      if (keyword || statusFilter !== null) {
        const params = {}
        if (keyword) params.keyword = keyword
        if (statusFilter !== null) params.status = statusFilter
        response = await api.laboratory.searchLaboratories(params)
      } else {
        response = await api.laboratory.getAllLaboratories()
      }

      // 检查响应结构
      if (response && response.success !== false) {
        const res = response.data // 提取实际数据
        if (Array.isArray(res)) {
          // 处理数据：添加默认图片
          const laboratories = res.map(lab => ({
            ...lab,
            imageUrl: lab.imageUrl || '/images/shiyanshi.png',
            labName: lab.labName || lab.name,
            labType: lab.labType || lab.type,
            location: lab.labLocation || lab.location,
            capacity: lab.labCapacity || lab.capacity
          }))
          
          this.setData({ 
            laboratories,
            filteredData: laboratories
          })
          
          if (laboratories.length === 0) {
            wx.showToast({
              title: '暂无可用实验室',
              icon: 'none'
            })
          }
        } else {
          throw new Error('数据格式错误：响应不是一个数组')
        }
      } else {
        throw new Error('API请求失败或返回错误')
      }
    } catch (error) {
      console.error('加载实验室列表失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ laboratories: [], filteredData: [] })
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 搜索输入
   */
  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  /**
   * 执行搜索
   */
  onSearch() {
    this.loadLaboratories()
  },

  /**
   * 清除搜索
   */
  onClearSearch() {
    this.setData({ keyword: '' }, () => {
      this.loadLaboratories()
    })
  },

  /**
   * 切换筛选面板
   */
  toggleFilter() {
    this.setData({ filterVisible: !this.data.filterVisible })
  },

  /**
   * 选择状态筛选
   */
  selectStatus(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ 
      statusFilter: status,
      filterVisible: false
    }, () => {
      this.loadLaboratories()
    })
  },

  /**
   * 重置筛选
   */
  resetFilter() {
    this.setData({ 
      statusFilter: null,
      filterVisible: false
    }, () => {
      this.loadLaboratories()
    })
  },

  /**
   * 选择实验室进行预约
   */
  selectLaboratory(e) {
    const { laboratory } = e.currentTarget.dataset
    
    // 检查实验室是否可用
    if (laboratory.status !== 1) {
      wx.showToast({
        title: '该实验室暂不可用',
        icon: 'none'
      })
      return
    }

    // 跳转到预约页面，传递实验室ID
    wx.navigateTo({
      url: `/pages/reservation/reservation?labId=${laboratory.id}`
    })
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    await this.loadLaboratories()
    wx.stopPullDownRefresh()
  },

  /**
   * 加载更多
   */
  loadMore() {
    // 前端筛选，无需加载更多逻辑
  },

  /**
   * 取消选择
   */
  onCancel() {
    wx.navigateBack()
  }
})
