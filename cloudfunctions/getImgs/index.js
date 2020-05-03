// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const page = event.page || 1;
  const pageSize = event.pageSize || 10;

  let data = []
  let totalRecords = 0;
  let skipNumber = (page - 1) * 10;
  if (event.public) {
    data = await db.collection('w_imgs').where({
      public: true
    }).orderBy('create_time', 'desc').skip(skipNumber).limit(pageSize).get()
    const countResult = await db.collection('w_imgs').where({
      public: true
    }).count()
    totalRecords = countResult.total
  } else {
    data = await db.collection('w_imgs').where({
      open_id: wxContext.OPENID
    }).orderBy('create_time', 'desc').skip(skipNumber).limit(pageSize).get()
    const countResult = await db.collection('w_imgs').where({
      open_id: wxContext.OPENID
    }).count()
    totalRecords = countResult.total
  }

  if (data.errMsg === 'collection.get:ok') {
    data = data.data;
  } else {
    data = []
  }
  return {
    data: data,
    totalRecords: totalRecords
  }
  
}

