import msgSchema from '../db/modules/msg.js'
import Router from 'koa-router'

const router = new Router({
  prefix: '/msg'
})
router.get('/', async (ctx) => {
  var userid = 1
  //获取数据库中订单数量
  var count = await msgSchema.countDocuments();
  //做判断，大于100就不再入库
  if (count > 100) {
    ctx.body = 'sold out!';
  } else {
    let model = await msgSchema.create({
      userId: userid
    })
    if (model) {
      ctx.body = 'success';
    }
  }
})

export default router
