const express = require('express')
const app = express()
const morgan = require('morgan')

require('dotenv').config()
 
// middleware
app.use(express.json())
app.use(morgan('tiny'))

const api = process.env.API_URL

app.get(`${api}/products`,(req,res)=>{
    const product = {
        id:'1',
        name:'hair dresser',
        image_url:'some url'
    }
    res.send(product)
})

app.post(`${api}/products`,(req,res)=>{
    const product = req.body
    res.send(product)
})


app.listen(1234,()=>{
    console.log('api ->',api)
    console.log('listening on the port 1234')
})