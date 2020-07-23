const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
var items = require('./routes/item')

mongoose.set('useCreateIndex',true)
mongoose.set('useUnifiedTopology',true)
mongoose.set('useNewUrlParser',true)
mongoose.set("useFindAndModify",false)
mongoose.connect(process.env.DATABASE_URL).then(() => {
    console.log("Connected to database!")

})
const port = 3010
app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use('/item',items)
app.listen(port, () => console.log("Listening on port " + port))
