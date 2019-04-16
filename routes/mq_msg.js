/*eslint-disable no-undef */
import Router from 'koa-router'
import amqp from 'amqplib'
import uuid from 'node-uuid'

const router = new Router({
  prefix: '/mq'
})
const fq = 'fq' //前端发送消息队列
const bq = 'bq' //后台回复队列
let conn // mq连接
let userId = 1
let correlationId = uuid()

//连接rabbitmq
amqp.connect('amqp://127.0.0.1').then((_conn) => {
  conn = _conn
})
router.get('/', async (ctx) => {
  const number = userId ++
  let ch = await conn.createChannel()
  await ch.assertQueue(bq, {durable: false})
  ch.sendToQueue(fq, Buffer.from(number.toString()), {replyTo: bq, correlationId: correlationId})
  async function delay() {
    return new Promise(function(resolve) {
      ch.consume(bq, (msg) => {
        ch.close()
        resolve(msg.content.toString())
      }, {noAck: true})
    });
  }
  const result = await delay()
  console.log(userId + ':' + result);
  ctx.body = {
    id: number,
    result
  }
})

export default router
