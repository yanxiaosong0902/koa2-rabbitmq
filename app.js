import Koa from 'koa'
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
import mongoose from 'mongoose'
import dbConfig from './db/config'
const index = require('./routes/index')
const users = require('./routes/users')
import msg from './routes/msg'
import mq_msg from './routes/mq_msg'
import Promise from 'bluebird'
global.Promise = Promise

// error handler
onerror(app)
mongoose.Promise = global.Promise
mongoose.connect(dbConfig.dbs, {
  useNewUrlParser: true,
  poolSize: 50,
  autoReconnect: true
})

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(msg.routes(), msg.allowedMethods())
app.use(mq_msg.routes(), mq_msg.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
