import amqp from 'amqplib'
import msgSchema from './db/modules/msg'
import mongoose from 'mongoose'
import dbConfig from './db/config'
import Promise from 'bluebird'
global.Promise = Promise
mongoose.Promise = global.Promise
mongoose.connect(dbConfig.dbs, {
  useNewUrlParser: true,
  poolSize: 50,
  autoReconnect: true
})

const fq = 'fq'
amqp.connect('amqp://127.0.0.1').then(async (conn) => {
  process.on('SIGINT', () => {
    conn.close()
  })
  const ch = await conn.createChannel()
  ch.prefetch(1)
  const ackSend = (msg, content) => {
    ch.sendToQueue(msg.properties.replyTo, Buffer.from(content.toString()), {
      correlationId: msg.properties.correlationId
    })
    ch.ack(msg)
  }
  const reply = async (msg) => {
    const userId = parseInt(msg.content.toString())
    let count = await msgSchema.countDocuments()
    if (count > 100) {
      return ackSend(msg, 'sold out')
    } else {
      let result = await msgSchema.create({userId: userId})
      if (result) {
        return ackSend(msg, 'success, orderid:' + result._id.toString() + ' && userId:' + result.userId.toString())
      } else {
        console.log('fail');
      }
    }
  }
  // 监听队列并消费
  await ch.assertQueue(fq, {durable: false})
  ch.consume(fq, reply, {noAck: false})
  console.log('wait for message');
})
