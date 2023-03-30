const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')

const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')

require('dotenv').config()
const api = process.env.API_URL

// middleware
app.use(cors())
app.options('*',cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler)

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

// mongoDB connection

mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
    .then(()=>{
        console.log('dataBase connection is established successfully !!')
    })
    .catch((err)=>{
        console.log("Some err occured",err)
    })

    app.get("/",(req,res)=>{
        res.send("hello")
        console.log(`${api}/categories`)
    })

app.listen(1234,()=>{
    console.log('listening on the port 1234')
})