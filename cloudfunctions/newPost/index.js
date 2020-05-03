// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const uuid = uuidv4();
  console.log('imgs', event.imgs)
  let promiseList = []
  for(let item of event.imgs) {
    promiseList.push(
      new Promise((resolve, reject) => {
        db.collection('w_imgs').add({
          data: {
            open_id: wxContext.OPENID,
            file_name: item.file_name,
            url: item.path,
            public: event.public || false,
            create_time: new Date(),
            uuid: uuid
          }
        }).then(res => {
          resolve(res)
        }).catch(e => {
          reject(e)
        })
      })
    )
  }

  let imgData = []
  try {
    imgData = await Promise.all(promiseList)
  } catch (e) {
    console.log('save img error', e)
  }

  console.log('img data', imgData);

  const imgIds = imgData.map(item => item._id)

  let postData = await db.collection('w_posts').add({
    data: {
      create_time: new Date(),
      open_id: wxContext.OPENID,
      img_ids: imgIds || [],
      content: event.content || '',
      img_uuid: uuid,
      public: event.public || false,
      deleted: event.deleted || false
    }
  })

  return {
    openid: wxContext.OPENID,
    data: postData
  }
}

/**
 * RFC4122 version 4 
 * create uuid
 */
function uuidv4() {
  return 'xxxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}