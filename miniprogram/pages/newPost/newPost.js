// miniprogram/pages/newPost/newPost.js
const { getExt } = require('../../utils/func.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedImgList: [],
    uploadImgList: [],
    content: ''
  },

  onTabItemTap(item) {
    this.setData({
      content: '',
      selectedImgList: [],
      uploadImgList: []
    })
  },

  /**
   * 选择图片
   */
  selectImgs: function () {
    var self = this;
    wx.chooseImage({
      count: 9 - self.data.selectedImgList.length,
      success: chooseResult => {
        console.log(chooseResult)
        self.setData({
          selectedImgList: [...chooseResult.tempFilePaths, ...this.data.selectedImgList]
        })
      }
    })
  },

  /**
   * 一个一个上传图片
   */
  uploadOneByOne(imgPaths, successUp, failUp, count) {
    var self = this;
    wx.showLoading({
      icon: 'none',
      title: '正在上传第' + count + '张',
    })
    var ext = getExt(imgPaths[count - 1]);
    var fileName = `${new Date().getTime()}.${ext}`

    wx.cloud.uploadFile({
      // 指定上传到的云路径
      cloudPath: fileName,
      // 指定要上传的文件的小程序临时文件路径
      filePath: imgPaths[count - 1],
      // 成功回调
      success: res => {
        successUp += 1;
        self.setData({
          uploadImgList: [...this.data.uploadImgList, {
            file_name: fileName,
            path: res.fileID
          }]
        })
        self.uploadCallback(imgPaths, successUp, failUp, count)
      },
      fail: () => {
        failUp += 1; //失败+1
        self.uploadCallback(imgPaths, successUp, failUp, count)
        // wx.hideLoading()
      }
    })
  },
  uploadCallback: function (imgPaths, successUp, failUp, count) {
    var self = this;
    if (count == imgPaths.length) {
      //上传完毕，作一下提示
      console.log('上传成功' + successUp + ',' + '失败' + failUp);
      wx.cloud.callFunction({
        name: 'newPost',
        data: {
          "imgs": self.data.uploadImgList,
          "content": self.data.content,
          "public": true,
          "deleted": false
        },
        success: function () {
          wx.hideLoading();
          wx.showToast({
            title: `上传成功${successUp}张`,
            icon: 'success',
            duration: 2000,
            complete: function () {
              wx.switchTab({
                url: '/pages/index/index',
              })
            }
          })
        },
        fail: function () {
          wx.showToast({
            title: `保存图片失败`,
            icon: 'warn',
            duration: 2000
          })
        }
      })
    } else {
      //递归调用，上传下一张
      count += 1; //下一张
      this.uploadOneByOne(imgPaths, successUp, failUp, count);
    }
  },
  /**
   * 发布图片
   */
  handlePublish: function () {
    if(!this.data.content) {
      wx.showToast({
        title: '请输入内容',
      })
      return false;
    }
    if(this.data.selectedImgList.length) {
      this.uploadOneByOne(this.data.selectedImgList, 0, 0, 1)
    } else {
      wx.showToast({
        title: '至少选择一张图片',
      })
    }
  },
  textInput: function (ev) {
    this.setData({
      content: ev.detail.value
    })
  }
})