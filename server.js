import amqp from 'amqplib'
//通过amqp连接rabbitmq服务
amqp.connect('amqp://127.0.0.1').then((conn) => {
  process.once('SIGN', () => {
    conn.close() // 检测到CTRL+C 关闭rabbitmq队列
  })
  return conn.createChannel().then((ch) => {
    //通道创建成功后我们通过通道对象的assertQueue方法来监听hello队列，并设置durable持久化为false。这里消息将会被保存在内存中。该方法会返回一个promise对象。
    const ok = ch.assertQueue('hello', {durable: false}).then((_qok) => {
      //监听创建成功后，我们使用ch.consume创建一个消费者。指定消费hello队列和处理函数，在这里我们简单打印一句话。设置noAck为true表示不对消费结果做出回应。
      //ch.consume会返回一个promise，这里我们把这个promise赋给ok。
      console.log(_qok);
      return ch.consume('hello', (msg) => {
        console.log('[X] Recieved \'%s\'', msg.content.toString())
      }, {noAck: true})
    })
    return ok.then((_consumeOk) => {
      console.log(_consumeOk)
      console.log('[*] Waiting for message. To exit press CRTL+C');
    });
  })
}).then(null, console.warn)
