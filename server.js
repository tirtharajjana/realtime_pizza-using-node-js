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
/**
 * db connection
 */
mongoose.connect('mongodb://localhost/pizza', { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true });
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
 * assets
 */
app.use(flash());
app.use(express.static("public"))
app.use(express.json())
app.use(morgan('dev'))
/**
 * Global middleware
*/
app.use((req, res, next) => {
    res.locals.session = req.session
    next();
})

/**
 * set templates
 */
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set("view engine", 'ejs')

require("./routes/web")(app);



app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})