//imports
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const userRoutes = require('./routes/userRoutes')
const DB_USER= process.env.DB_USER
const DB_PASS = encodeURIComponent(process.env.DB_PASS)

//read json
app.use(
    express.urlencoded({
        extended: true
    }),
)

app.use(express.json());

//api routes
app.use('/auth', userRoutes)
app.use('/users', userRoutes)
app.use('/', userRoutes)

// Connect to MongoDB
mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASS}@authjwt.t1xjq.mongodb.net/authjwt?retryWrites=true&w=majority

`)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(3000);
    })
    .catch((err) => {
        console.error('Deu ruim', err)
    })
