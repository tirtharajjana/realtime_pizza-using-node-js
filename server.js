const env = require("dotenv").config()
const express = require("express")
const app = express();
const ejs = require('ejs');
const path = require("path")
const expressLayout = require("express-ejs-layouts")
const PORT = process.env.PORT || 3300
const mongoose = require("mongoose")
var morgan = require('morgan');
const { request } = require("http");
const session = require("express-session");
var flash = require('express-flash');
const MongoDbStore = require('connect-mongo')(session);
const Emitter = require('events')
const passport = require('passport')
/**
 * db connection
 */
mongoose.connect(process.env.MONGO_CONNECTION_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("Database connected...")
}).catch(err => {
    console.log("Connection failed...");
})

/**
 * session store
 */
let mongoStore = new MongoDbStore({
    mongooseConnection: connection,
    collection: 'sessions'
})
/**
 * event emitter
 */
const eventEmitter = new Emitter()
app.set('eventEmitter',eventEmitter)
/**
 * session config
 */
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: true,
    store: mongoStore,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}))
/**
 * passport config
 */
const passportInit = require('./app/config/passport');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session())
/**
 * assets
 */
app.use(flash());
app.use(express.static("public"))
app.use(express.urlencoded({ extended: flash }))
app.use(express.json())
app.use(morgan('dev'))
/**
 * Global middleware
*/
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user

    next();
})

/**
 * set templates
 */
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set("view engine", 'ejs')


require("./routes/web")(app);
app.use((req,res)=>{
    res.status(404).render('errors/404')
})



const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})


/**
 * socket 
 */

const io = require('socket.io')(server);

io.on('connection', (socket) => {
    //join
    socket.on('join', (orderId) => {
        socket.join(orderId)
    })
})


eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})


eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})