const {Product} = require('../models/product');
const {Category} = require('../routes/categories');
const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();

router.get(`/`, async (req, res) =>{
    let filter = {}
    if(req.query.categories){
        filter = { category: req.query.categories.split(',') }
    }
    const productList = await Product.find(filter);

    if(!productList) {
        return res.status(500).json({success: false})
    } 
    res.send(productList);
})

router.get('/:id',async(req,res)=>{
    // .populate('category') is used because in the product Schema there is a refrence to the category Schema so just fill in the values
    const product = await Product.findById(req.params.id).populate('category')
    if(!product){
        return res.status(500).json({success:false,msg:"No Product Found"})
    }
    return res.status(200).json({success:true,msg:"product created Successfuly",product:product})
})

router.post(`/`, async(req, res) =>{

    const category = await Category.findById(req.body.category)
    if(!category){
        return res.status(500).json({success:false,msg:"Invalid category !!"})
    }

    const product = new Product({
        name: req.body.name,
        image: req.body.image,
        description: req.body.description,
        richDescription: req.body.richDescription,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })

    product = await product.save()
    if(!product){
        return res.status(500).json({success:false,msg:"The product cannot be created !!"})
    }
    res.status(200).json({success:true,product:product})
    
})

router.put('/:id',async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).json({success:false,msg:"Invalid ID"})
    }

    const category = await Category.findById(req.body.category);

    if(!category){
        return res.status(400).json({success:true,msg:"invalid category id"})
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            image: req.body.image,
            description: req.body.description,
            richDescription: req.body.richDescription,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        {
            new:true
        }
    )
    if(!product){
        res.status(500).json({success:false,msg:"product cannot be updated"})
    }
    res.json({success:true,msg:"product created SuccessFully !!",product:product})
})

router.delete('/:id',async(req,res)=>{
    await Product.findByIdAndRemove(req.params.id)
        .then(product =>{
            if(product){
                return res.status(200).json({succes:true,msg:"product is deleted"})
            }else{
                return res.status(404).json({success:false,msg:"product not found !"})
            }
        })
        .catch(err =>{
            return res.status(400).json({success:false,err:err})
        })
})

router.get('/get/count',async(req,res)=>{
    // .populate('category') is used because in the product Schema there is a refrence to the category Schema so just fill in the values
    const productCount = await Product.countDocuments((count) => count)
    if(!productCount){
        return res.status(500).json({success:false,msg:"No Product Found"})
    }
    return res.status(200).json({success:true,msg:"ProductCount found",productCount:productCount})
})

router.get('/get/featured/:count',async(req,res)=>{
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({isfeatured:true}).limit(+count)
    if(!products){
        return res.status(500).json({success:false,msg:"No Product Found"})
    }
    return res.status(200).json({success:true,msg:"featured Product Found",productCount:products})
})

module.exports =router;