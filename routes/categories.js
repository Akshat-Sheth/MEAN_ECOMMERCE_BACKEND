const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(categoryList);
})

router.get('/:id',async(req,res)=>[
    await Category.findById(req.params.id)
        .then(category =>{
            if(category){
                return res.status(200).json({success:true,msg:"category found",category:category})
            }
        })
        .catch(err =>{
            res.status(400).json({success:false,err:err})
        })
])

router.post('/', async (req,res)=>{
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    category = await category.save();

    if(!category)
    return res.status(400).send('the category cannot be created!')

    res.send(category);
})


router.put('/:id',async(req,res)=>{
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            icon:req.body.icon,
            color:req.body.color
        },
        {
            new:true
        }
    )
    if(!category){
        res.status(400).json({success:false,msg:"category cannot be updated"})
    }
    res.send(category)
})


router.delete('/:id',async(req,res)=>{
    await Category.findByIdAndRemove(req.params.id)
        .then(category =>{
            if(category){
                return res.status(200).json({succes:true,msg:"category is deleted"})
            }else{
                return res.status(404).json({success:false,msg:"category not found !"})
            }
        })
        .catch(err =>{
            return res.status(400).json({success:false,err:err})
        })
})



module.exports =router;