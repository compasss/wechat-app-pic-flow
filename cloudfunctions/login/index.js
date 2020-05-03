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

  let data = null;
  let result = await db.collection('w_users').where({
    open_id: wxContext.OPENID
  }).get()

  if(result.data.length) {
    // 已经存在，更新
    data = await db.collection('w_users')
      .where({
        open_id: wxContext.OPENID
      })
      .update({
        data: {
          avatar_url: event.avatarUrl,
          nick_name: event.nickName,
          userInfoObj: event.userInfoObj
        }
      })
  } else {
    data = await db.collection('w_users').add({
      data: {
        open_id: wxContext.OPENID,
        avatar_url: event.avatarUrl,
        nick_name: event.nickName,
        userInfoObj: event.userInfoObj
      }
    })
  }
  return {
    openid: wxContext.OPENID,
    data: data
  }
}

