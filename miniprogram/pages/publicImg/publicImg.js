// miniprogram/pages/publicImg/publicImg.js
const { getExt } = require('../../utils/func.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgList: [],
    scrollViewHeight: 600,
    lock: false,
    page: 1,
    pageSize: 10,
    totalRecords: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getImgList('init');
    this.calcHeight();
  },

  onPullDownRefresh: function () {
    console.log('pull down')
    this.setData({
      page: 1
    })
    this.getImgList('init', function() {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 获取图片列表
   */
  getImgList: function (type, callback) {
    var self = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'getImgs',
      data: {
        public: true,
        page: this.data.page,
        pageSize: this.data.pageSize
      },
      success: function(res) {
        var result = []
        if (type === 'init') {
          result = res.result.data || [];
        } else {
          result = [...self.data.imgList, ...res.result.data]
        }
        self.setData({
          imgList: result,
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
      complete: function() {
        setTimeout(() => {
          wx.hideLoading()
        }, 200)
      }
    })
  },
  /**
   * 上传图片
   */
  uploadImg: function () {
    var self = this;
    wx.chooseImage({
      count: 3,
      success: chooseResult => {
        console.log('choose image success')
        self.uploadOneByOne(chooseResult.tempFilePaths, 0, 0, 1, chooseResult.tempFilePaths.length);
      },
    })
  },
  /**
   * 保存图片信息到数据库
   */
  saveImgs: function (path) {
    var self = this;
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'saveImgs',
        data: {
          public: true,
          path: path
        },
        success: function (res) {
          resolve(res)
          // self.getImgList('init')
        },
        fail: function (xhr) {
          console.log('save img error', xhr);
          reject(xhr)
        }
      })
    })
  },
  /**
  * 采用递归的方式上传
  */
  uploadOneByOne(imgPaths, successUp, failUp, count) {
    var self = this;
    wx.showLoading({
      icon: 'none',
      title: '正在上传第' + count + '张',
    })
    var ext = getExt(imgPaths[count - 1]);

    wx.cloud.uploadFile({
      // 指定上传到的云路径
      cloudPath: `${new Date().getTime()}.${ext}`,
      // 指定要上传的文件的小程序临时文件路径
      filePath: imgPaths[count - 1],
      // 成功回调
      success: res => {
        self.saveImgs(res.fileID).then(res => {
          successUp +=1;
          self.uploadCallback(imgPaths, successUp, failUp, count)
        }).catch(e => {
          failUp += 1; //失败+1
          self.uploadCallback(imgPaths, successUp, failUp, count)
        })
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
      wx.hideLoading();
      wx.showToast({
        title: `上传成功${successUp}张`,
        icon: 'success',
        duration: 2000,
        complete: function () {
          self.getImgList('init')
        }
      })
    } else {
      //递归调用，上传下一张
      count += 1; //下一张
      this.uploadOneByOne(imgPaths, successUp, failUp, count);
    }
  },
  scrollPage: function () {
    if (!this.data.lock && this.data.totalRecords > this.data.page * 10) {
      // 判断能不能加载数据
      this.setData({
        lock: true,
        page: this.data.page + 1
      })
      this.getImgList();
    }
  },
  viewImage: function (ev) {
    let urls = this.data.imgList.map(item => item.url)
    if (ev.target.dataset.url) {
      wx.previewImage({
        current: ev.target.dataset.url,
        urls: urls
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
