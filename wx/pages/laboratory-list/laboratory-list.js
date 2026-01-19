// pages/laboratory-list/laboratory-list.js
import api from '../../api/index'

Page({
  data: {
    // 搜索关键词
    keyword: '',
    // 筛选条件
    selectedStatus: null,
    // 显示筛选面板
    showFilter: false,
    // 实验室列表（显示的数据）
    laboratories: [],
    // 完整数据列表（用于前端分页）
    allLaboratories: [],
    // 加载状态
    loading: false,
    // 分页相关
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad(options) {
    // 从参数中获取初始筛选条件
    if (options.status) {
      this.setData({ selectedStatus: parseInt(options.status) })
    }
    
    this.loadLaboratories()
  },

  /**
   * 加载实验室列表
   */
  async loadLaboratories(refresh = false) {
    if (this.data.loading) return

    try {
      // 如果是刷新，先清空列表并重置分页
      if (refresh) {
        this.setData({
          loading: true,
          page: 1,
          laboratories: [],
          allLaboratories: [],
          hasMore: true
        })
      } else {
        this.setData({ loading: true })
      }

      let response
      const { keyword, selectedStatus } = this.data

      // 使用搜索接口（支持keyword和status参数）
      if (keyword || selectedStatus !== null) {
        const params = {}
        if (keyword) params.keyword = keyword
        if (selectedStatus !== null) params.status = selectedStatus
        response = await api.laboratory.searchLaboratories(params)
      } else {
        // 获取所有实验室
        response = await api.laboratory.getAllLaboratories()
      }

      console.log('API返回数据:', response)

      // 提取实际数据
      let allLaboratories = []
      if (response && response.data) {
        const res = response.data
        if (Array.isArray(res)) {
          allLaboratories = res
        } else {
          console.error('API返回数据格式异常:', response)
          wx.showToast({
            title: '数据格式错误',
            icon: 'none'
          })
          return
        }
      } else {
        console.error('API返回数据格式异常:', response)
        wx.showToast({
          title: '数据格式错误',
          icon: 'none'
        })
        return
      }
      
      console.log('解析后的实验室列表:', allLaboratories)
      
      // 为没有图片的实验室添加默认图片
      allLaboratories = allLaboratories.map(lab => ({
        ...lab,
        imageUrl: lab.imageUrl || '/images/shiyanshi.png'
      }))
      
      // 存储完整数据，用于前端分页
      this.setData({ allLaboratories })
      
      // 显示第一页数据
      this.showPageData()
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
   * 显示当前页的数据
   */
  showPageData() {
    const { allLaboratories, page, pageSize } = this.data
    const startIndex = 0
    const endIndex = page * pageSize
    const laboratories = allLaboratories.slice(startIndex, endIndex)
    const hasMore = endIndex < allLaboratories.length

    this.setData({
      laboratories,
      hasMore
    })
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
        this.showPageData()
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
