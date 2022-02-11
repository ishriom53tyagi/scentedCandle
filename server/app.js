const express = require('express')
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
const helmet = require('helmet')
var path = require('path')
var session = require('express-session')
var MongoDBStore = require('connect-mongodb-session')(session)
const app = express()

const config = require('./config.json')
const db = require('./utils/database')
const backendRoutes = require('./routes/backend')
const documentService = require('./services/documentation')
const apiMngt = require('./services/apiManagement')
const adminRoutes = require('./routes/admin')
const staticRoutes = require('./routes/static')
const dummyRoutes = require('./routes/dummy')

app.enable('trust proxy')
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
)
app.disable('x-powered-by')

var dbUrl = db.dbNameUrl()

var store = new MongoDBStore({
  uri: dbUrl,
  collection: 'sessions',
})

app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'dist/light')))
app.use(bodyParser.json({ limit: '50mb' }))

// view engine setup
app.set('views', path.join(__dirname, '/public/views'))
app.set('view engine', 'ejs')

//setup public folder
app.use('/static', staticRoutes)
app.use('/api_doc/css', express.static(__dirname + '/public/css'))
app.use('/doc', express.static(__dirname + '/public/doc'))

app.use(
  session({
    secret: config.encryption.session.secret,
    store: store,
    resave: false,
    rolling: true,
    saveUninitialized: true,
    cookie: {
      maxAge: parseInt(config.encryption.session.maxage),
      secure: config.encryption.session.secure,
    },
  })
)

app.use('/api/backend', backendRoutes)
app.use('/api/admin', adminRoutes)

app.get('/*', function (req, res, next) {
  res.set({
    'Cache-Control':
      'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0',
    Expires: '0',
    Pragma: 'no-cache',
  })
  res.sendFile(path.join(__dirname, 'dist/light/index.html'))
})

app.use(function (err, req, res, next) {
  if (err.code === 'EBADCSRFTOKEN') {
    console.log('csrf token error ' + err)
    // handle CSRF token errors here
    return res.status(403).send('access denied')
  }
  console.log('--start-up-app-error--', err)
  res.status(503).send('internal server error')
})

app.use(function (err, req, res, next) {
  console.log('req url in backend.js : ', req.url)
  // next();
})

db.mongoConnect((db) => {
  app.db = db
  app.listen(config.port || 5120)
})
