//index.js
const app = getApp()

Page({
  data: {
    scrollViewHeight: 600,
    postList: [],
    page: 1,
    pageSize: 10,
    lock: false
  },

  onLoad: function() {
    this.calcHeight()
    this.getPostList('init')
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },
  /**
   * 倒序获取信息
   */
  getPostList: function(type, callback) {
    var self = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'postList',
      data: {
        page: this.data.page,
        pageSize: this.data.pageSize
      },
      success: function(res) {
        var result = []
        if (type === 'init') {
          result = res.result.data || [];
        } else {
          result = [...self.data.postList, ...res.result.data]
        }
        self.setData({
          postList: result,
          lock: false,
          totalRecords: res.result.totalRecords
        })
        if (callback && typeof callback === 'function') {
          callback()
        }
      },
      fail: function(xhr) {
        console.log(xhr)
        this.setData({
          lock: false
        })
      },
      complete: function () {
        setTimeout(() => {
          wx.hideLoading()
        }, 200)
      }
    })
  },
  /**
   * 预览图片
   */
  viewImage: function(e) {
    console.log(e)
    if (e.target.dataset.url) {
      let imgArr = this.data.postList[e.target.dataset.index].imgList.map(item => item.url)
      wx.previewImage({
        current: e.target.dataset.url,
        urls: imgArr,
      })
    }
  },
  scrollPage: function () {
    if (!this.data.lock && this.data.totalRecords > this.data.page * 10) {
      // 判断能不能加载数据
      this.setData({
        lock: true,
        page: this.data.page + 1
      })
      this.getPostList();
    }
  },
  onPullDownRefresh: function () {
    console.log('pull down')
    this.setData({
      page: 1
    })
    this.getPostList('init', function () {
      wx.stopPullDownRefresh();
    });
  },
  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
  /**
   * 计算 scroll view height
   */
  calcHeight: function (e) {
    var self = this;
    wx.getSystemInfo({
      success: function (res) {
        self.setData({
          scrollViewHeight: res.windowHeight
        })
      }
    })
  }
})
