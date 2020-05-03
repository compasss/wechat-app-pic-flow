// miniprogram/pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  getUserInfo: function(userObj) {
    wx.showLoading({
      title: '加载中...',
    })
    let userInfo = userObj.detail.userInfo;
    wx.cloud.callFunction({
      name: 'login',
      data: {
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        userInfoObj: userInfo
      },
      success: function(res) {
        console.log('login obj', res)
        userInfo.openid = res.result.openid;
        wx.setStorage({
          key: 'userInfo',
          data: userInfo,
          success: function() {
            wx.switchTab({
              url: '/pages/index/index',
            })
          }
        })
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  }
})