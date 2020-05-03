const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
/**
 * 保存图片信息到数据库
 * 
 */
exports.main = async (event, context) => {
  console.log(event)

  const wxContext = cloud.getWXContext()

  let data = await db.collection('w_imgs').add({
    data: {
      open_id: wxContext.OPENID,
      file_name: new Date().getTime(),
      url: event.path,
      public: event.public,
      create_time: new Date()
    }
  })

  console.log('save img result', data)

  if (data.errMsg === 'collection.get:ok') {
    data = data.data;
  } else {
    data = []
  }
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    data: data
  }

}

