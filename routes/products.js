const {Product} = require('../models/product');
const {Category} = require('../routes/categories');
const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });


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

router.post(`/`, uploadOptions.single('image'),async(req, res) =>{

    const category = await Category.findById(req.body.category)
    if(!category){
        return res.status(500).json({success:false,msg:"Invalid category !!"})
    }
    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const product = new Product({
        name: req.body.name,
        image: `${basePath}${fileName}`,
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
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            image: imagepath,
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
    if(!updatedProduct){
        res.status(500).json({success:false,msg:"product cannot be updated"})
    }
    res.json({success:true,msg:"product created SuccessFully !!",updatedProduct:updatedProduct})
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


router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!product) return res.status(500).send('the gallery cannot be updated!');

    res.send(product);
});

module.exports =router;