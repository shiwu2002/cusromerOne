// pages/laboratory-list/laboratory-list.js
import api from '../../api/index'

Page({
  data: {
    // 搜索关键词
    keyword: '',
    // 筛选条件
    selectedType: '',
    selectedStatus: null,
    // 实验室类型列表
    labTypes: ['物理实验室', '化学实验室', '生物实验室', '计算机实验室', '工程实验室'],
    // 显示筛选面板
    showFilter: false,
    // 实验室列表
    laboratories: [],
    // 加载状态
    loading: false,
    // 分页相关
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad(options) {
    // 从参数中获取初始筛选条件
    if (options.type) {
      this.setData({ selectedType: options.type })
    }
    if (options.status) {
      this.setData({ selectedStatus: parseInt(options.status) })
    }
    
    this.loadLaboratories()
  },

  onShow() {
    // 每次显示时刷新列表
    this.loadLaboratories(true)
  },

  /**
   * 加载实验室列表
   */
  async loadLaboratories(refresh = false) {
    if (this.data.loading) return

    // 如果是刷新，重置分页
    if (refresh) {
      this.setData({
        page: 1,
        laboratories: [],
        hasMore: true
      })
    }

    try {
      this.setData({ loading: true })

      let res
      const { keyword, selectedType, selectedStatus } = this.data

      // 根据条件选择不同的API
      if (keyword || selectedType || selectedStatus !== null) {
        // 使用搜索接口
        res = await api.laboratory.searchLaboratories({
          keyword,
          labType: selectedType || undefined,
          status: selectedStatus !== null ? selectedStatus : undefined
        })
      } else {
        // 获取所有实验室
        res = await api.laboratory.getAllLaboratories()
      }

      if (res.success && res.data) {
        const laboratories = Array.isArray(res.data) ? res.data : []
        
        if (refresh) {
          this.setData({ laboratories })
        } else {
          this.setData({
            laboratories: [...this.data.laboratories, ...laboratories]
          })
        }

        // 判断是否还有更多数据
        this.setData({
          hasMore: laboratories.length >= this.data.pageSize
        })
      }
    } catch (error) {
      console.error('加载实验室列表失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
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
    this.loadLaboratories(true)
  },

  /**
   * 清除搜索
   */
  onClearSearch() {
    this.setData({ keyword: '' }, () => {
      this.loadLaboratories(true)
    })
  },

  /**
   * 切换筛选面板
   */
  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter })
  },

  /**
   * 选择类型
   */
  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ selectedType: type })
  },

  /**
   * 选择状态
   */
  selectStatus(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ selectedStatus: status })
  },

  /**
   * 重置筛选
   */
  resetFilter() {
    this.setData({
      selectedType: '',
      selectedStatus: null
    })
  },

  /**
   * 应用筛选
   */
  applyFilter() {
    this.setData({ showFilter: false }, () => {
      this.loadLaboratories(true)
    })
  },

  /**
   * 加载更多
   */
  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 }, () => {
        this.loadLaboratories()
      })
    }
  },

  /**
   * 导航到详情页
   */
  navigateToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/laboratory-detail/laboratory-detail?id=${id}`
    })
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    await this.loadLaboratories(true)
    wx.stopPullDownRefresh()
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    this.loadMore()
  },

  /**
   * 分享给朋友
   */
  onShareAppMessage() {
    return {
      title: '实验室列表',
      path: '/pages/laboratory-list/laboratory-list',
      imageUrl: '/images/share.png'
    }
  }
})
