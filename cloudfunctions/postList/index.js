// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const page = event.page || 1;
  const pageSize = event.pageSize || 10;
  let data = []
  let totalRecords = 0;
  let skipNumber = (page - 1) * 10;

  totalRecords = await db.collection('w_posts').count();
  const aggregateInstance = db.collection('w_posts').aggregate()
    .lookup({
      from: 'w_imgs',
      localField: 'img_uuid',
      foreignField: 'uuid',
      as: 'imgList'
    })
    .lookup({
      from: 'w_users',
      localField: 'open_id',
      foreignField: 'open_id',
      as: 'userInfo'
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$userInfo', 0]), '$$ROOT'])
    })
    .project({
      userInfo: 0
    })
  
  data = await aggregateInstance
    .match({
      public: true
    })
    .sort({
      'create_time': -1
    })
    .skip(skipNumber)
    .limit(pageSize)
    .end()

  return {
    openid: wxContext.OPENID,
    data: data.list,
    totalRecords: totalRecords.total
  }
}
