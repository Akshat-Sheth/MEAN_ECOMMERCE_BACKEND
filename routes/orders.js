const {Order} = require('../models/order');
const { OrderItem } = require('../models/orderItem')
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});

    if(!orderList) {
        res.status(500).json({success: false})
    } 
    res.send(orderList);
})

router.get(`/:id`, async (req, res) =>{
    const order = await Order.findById(req.params.id).populate('user','name').populate({path:'orderItems',populate: {path:'product',populate:'category'}})

    if(!order) {
        res.status(500).json({success: false})
    } 
    res.send(order);
})

router.put('/:id',async(req,res)=>{
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status:req.body.status
        },
        {
            new:true
        }
    )
    if(!order){
        res.status(400).json({success:false,msg:"category cannot be updated"})
    }
    res.send(order)
})

router.delete('/:id',async(req,res)=>{
    await Order.findByIdAndRemove(req.params.id)
        .then(async order =>{
            if(order){
                await order.orderItems.map(async ele => {
                    await OrderItem.findByIdAndRemove(ele)
                })
                return res.status(200).json({succes:true,msg:"order is deleted"})
            }else{
                return res.status(404).json({success:false,msg:"order not found !"})
            }
        })
        .catch(err =>{
            return res.status(400).json({success:false,err:err})
        })
})


router.post('/', async (req,res)=>{

    const { shippingAddress1,shippingAddress2,city,country,zip,phone,status,totalPrice,user} = req.body
    const ordderItemsIds = Promise.all(req.body.orderItems.map(async ele => {
        let newOrderitem = new OrderItem({
            quantity:ele.quantity,
            product:ele.product
        })

        newOrderitem = await newOrderitem.save()

        return newOrderitem._id
    }))

    const orderIdsResolved = await ordderItemsIds
    const total = await  Promise.all(orderIdsResolved.map( async (oId) => {
        const orderItem = await OrderItem.findById(oId).populate('product','price')
        const tp = orderItem.product.price * orderItem.quantity
        return tp
    }))

    const reducedTotal = total.reduce((a,b) => a+b , 0)

    let order = new Order({
        orderItems: orderIdsResolved,
        shippingAddress1,
        shippingAddress2,
        city,
        country,
        zip,
        phone,
        status,
        totalPrice: reducedTotal,
        user
    })
    order = await order.save();

    if(!order){
        return res.status(400).send('the category cannot be created!')
    }

    res.send(order);
})


router.get('/get/totalSales',async(req,res) => {
    const totalSales = await Order.aggregate([
        {$group : { _id:null, totalSales: { $sum : '$totalPrice' } }}
    ])

    if(!totalSales){
        return res.status(500).json({success:false,msg:"The total sales canot be generated !!"})
    }
    res.status(200).json({succes:true,totalSales:totalSales.pop().totalSales})
})

router.get('/get/count',async(req,res)=>{
    // .populate('category') is used because in the product Schema there is a refrence to the category Schema so just fill in the values
    const orderCount = await Order.countDocuments((count) => count)
    if(!orderCount){
        return res.status(500).json({success:false,msg:"No Order Found"})
    }
    return res.status(200).json({success:true,msg:"orderCount found",orderCount:orderCount})
})


router.get(`/get/usersOrders/:id`, async (req, res) =>{
    const userOrderList = await Order.find({user:req.params.id}).populate({path:'orderItems',populate: {path:'product',populate:'category'}}).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})





module.exports =router;