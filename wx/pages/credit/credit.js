// pages/credit/credit.js
const api = require('../../api/index');

Page({
  data: {
    creditInfo: {
      score: 0,
      levelClass: '',
      levelText: '',
      description: ''
    },
    creditLogs: [],
    rules: {
      addRules: [],
      deductRules: [],
      levels: []
    },
    showRulesModal: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadCreditInfo();
    this.loadCreditLogs();
    this.loadCreditRules();
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true
    });
    Promise.all([
      this.loadCreditInfo(),
      this.loadCreditLogs(),
      this.loadCreditRules()
    ]).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载信誉分信息
  async loadCreditInfo() {
    try {
      const response = await api.credit.getMyCredit();
      const data = response.data;
      
      // 根据实际返回的数据结构提取
      const creditData = data.credit || data;
      const statsData = data.stats || {};
      
      // 使用后端返回的等级信息，如果没有则前端计算
      let levelInfo;
      if (statsData.levelText) {
        levelInfo = {
          class: `level-${this.getLevelClass(statsData.level)}`,
          text: statsData.levelText,
          description: this.getLevelDescription(statsData.level)
        };
      } else {
        levelInfo = this.calculateLevel(creditData.score || statsData.score);
      }
      
      this.setData({
        creditInfo: {
          score: creditData.score || statsData.score || 0,
          levelClass: levelInfo.class,
          levelText: levelInfo.text,
          description: levelInfo.description
        }
      });
    } catch (error) {
      console.error('加载信誉分失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  // 加载信誉分记录
  async loadCreditLogs(isLoadMore = false) {
    if (this.data.loading || (!this.data.hasMore && isLoadMore)) return;

    this.setData({ loading: true });

    try {
      const response = await api.credit.getMyCreditLogs({
        page: this.data.page,
        pageSize: this.data.pageSize
      });

      // 提取实际的记录数组（response.data.data）
      const logsData = response.data || [];
      
      if (isLoadMore) {
        this.setData({
          creditLogs: [...this.data.creditLogs, ...logsData]
        });
      } else {
        this.setData({
          creditLogs: logsData
        });
      }

      // 判断是否还有更多数据
      this.setData({
        hasMore: logsData.length === this.data.pageSize
      });
    } catch (error) {
      console.error('加载信誉分记录失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载信誉分规则
  async loadCreditRules() {
    try {
      const response = await api.credit.getCreditRules();
      const rulesData = response.data || {};

      // API 返回的 addRules 和 subtractRules 是对象，需要转换为数组
      const addRulesArray = [];
      if (rulesData.addRules) {
        Object.keys(rulesData.addRules).forEach(key => {
          addRulesArray.push({
            description: key,
            score: rulesData.addRules[key]
          });
        });
      }

      const deductRulesArray = [];
      if (rulesData.subtractRules) {
        Object.keys(rulesData.subtractRules).forEach(key => {
          deductRulesArray.push({
            description: key,
            score: Math.abs(rulesData.subtractRules[key]) // 确保为正数
          });
        });
      }

      // levels 是对象，键为等级数字，值为等级描述字符串
      const levelsArray = [];
      if (rulesData.levels) {
        Object.keys(rulesData.levels).forEach(key => {
          const levelInfo = rulesData.levels[key];
          // 解析等级描述字符串，如 "差 (0-59 分) - 禁止预约"
          levelsArray.push({
            name: levelInfo.split(' ')[0], // 提取等级名称
            range: levelInfo.split(' ').slice(1).join(' ') // 提取分数范围和权限
          });
        });
      }

      this.setData({
        rules: {
          addRules: addRulesArray,
          deductRules: deductRulesArray,
          levels: levelsArray
        }
      });
    } catch (error) {
      console.error('加载信誉分规则失败:', error);
    }
  },

  // 根据等级数字获取等级类别
  getLevelClass(level) {
    const levelMap = {
      1: 'bad',
      2: 'poor',
      3: 'medium',
      4: 'good',
      5: 'excellent'
    };
    return levelMap[level] || 'medium';
  },

  // 根据等级数字获取等级描述
  getLevelDescription(level) {
    const descriptions = {
      1: '信用差，将影响预约功能',
      2: '信用较差，请尽快提升',
      3: '信用中等，请注意维护',
      4: '信用良好，请继续保持',
      5: '信用极佳，可享受更多便利'
    };
    return descriptions[level] || '信用中等，请注意维护';
  },

  // 计算等级（备用方法）
  calculateLevel(score) {
    if (score >= 90) {
      return {
        class: 'level-excellent',
        text: '优秀',
        description: '信用极佳，可享受更多便利'
      };
    } else if (score >= 80) {
      return {
        class: 'level-good',
        text: '良好',
        description: '信用良好，请继续保持'
      };
    } else if (score >= 70) {
      return {
        class: 'level-medium',
        text: '中等',
        description: '信用中等，请注意维护'
      };
    } else if (score >= 60) {
      return {
        class: 'level-poor',
        text: '较差',
        description: '信用较差，请尽快提升'
      };
    } else {
      return {
        class: 'level-bad',
        text: '差',
        description: '信用差，将影响预约功能'
      };
    }
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
      return timeStr;
    }
  },

  // 参加培训恢复信誉分
  async onTrainingRecover() {
    wx.showModal({
      title: '培训恢复',
      content: '参加培训可以提升信誉分，是否立即参加？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '提交中...' });
            await api.credit.trainingRecover();
            wx.hideLoading();
            wx.showToast({ title: '培训成功，信誉分已提升', icon: 'success' });
            this.loadCreditInfo();
          } catch (error) {
            wx.hideLoading();
            console.error('培训恢复失败:', error);
            wx.showToast({ title: error.message || '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  // 查看规则
  onViewRules() {
    this.setData({ showRulesModal: true });
  },

  // 关闭规则弹窗
  closeRulesModal() {
    this.setData({ showRulesModal: false });
  },

  // 阻止冒泡
  preventClose() {},

  // 刷新
  onRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadCreditLogs();
    wx.showToast({ title: '刷新成功', icon: 'success' });
  },

  // 加载更多
  onLoadMore() {
    if (!this.data.loading && this.data.hasMore) {
      this.setData({ page: this.data.page + 1 });
      this.loadCreditLogs(true);
    }
  }
});
