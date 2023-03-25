const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.get('/:id',async(req,res)=>[
    await User.findById(req.params.id).select('-passwordHash')
        .then(user =>{
            if(user){
                return res.status(200).json({success:true,msg:"user found",category:user})
            }
        })
        .catch(err =>{
            res.status(400).json({success:false,err:err})
        })
])

router.post('/',async(req,res)=>{
    const { name,email,password,street,apartment,zip,country,phone,isAdmin } = req.body
    const passwordHash = bcrypt.hashSync(password,10)
    let user = new User({
        name,
        email,
        passwordHash,
        phone,
        isAdmin,
        street,
        apartment,
        zip,
        country
    })
    user = await user.save()
    if(!user){
        return res.status('400').json({success:false,msg:"user cannot be created"})
    }
    return res.json({success:true,msg:"user created successsfully",user:user})
})

router.put('/:id',async(req,res)=>{
    const { name,email,password,street,apartment,zip,country,phone,isAdmin } = req.body
    const userExist = await User.findById(req.params.id)
    let newPassword;
    if(req.body.password){
        newPassword = bcrypt.hashSync(password,10)
    }else{
        newPassword = userExist.passwordHash
    }
    const user = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name,
            email,
            passwordHash: newPassword,
            phone,
            isAdmin,
            street,
            apartment,
            zip,
            country
        },
        {
            new:true
        }
    )
    if(!user){
        res.status(400).json({success:false,msg:"user cannot be updated"})
    }
    res.send(category)
})

router.post('/login',async(req,res)=>{
    const user = await User.findOne({email:req.body.email})

    if(!user){
        return res.status(404).json({success:false,msg:"User does not exist"})
    }
    console.log(req.body.password)
    console.log(user.passwordHash)
    console.log(bcrypt.compareSync(req.body.password,user.passwordHash))
    if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){
        const token = jwt.sign(
            {
                userId : user._id,
                isAdmin:user.isAdmin
            },
            process.env.SECRET,
            {
                expiresIn: '1d'
            }
        )
        return res.status(200).json({success:true,msg:"login successfull",email:user.email,token:token})
    }else{
        return res.json({success:false,msg:"email or password is incorrect !!"})
    }


})

router.post('/register',async(req,res)=>{
    const { name,email,password,street,apartment,zip,country,phone,isAdmin } = req.body
    const passwordHash = bcrypt.hashSync(password,10)
    let user = new User({
        name,
        email,
        passwordHash,
        phone,
        isAdmin,
        street,
        apartment,
        zip,
        country
    })
    user = await user.save()
    if(!user){
        return res.status('400').json({success:false,msg:"user cannot be created"})
    }
    return res.json({success:true,msg:"user created successsfully",user:user})
})

router.get('/get/count',async(req,res)=>{
    // .populate('category') is used because in the product Schema there is a refrence to the category Schema so just fill in the values
    const usersCount = await User.countDocuments((count) => count)
    if(!usersCount){
        return res.status(500).json({success:false,msg:"No users Found"})
    }
    return res.status(200).json({success:true,msg:"usersCount found",usersCount:usersCount})
})

router.delete('/:id',async(req,res)=>{
    await User.findByIdAndRemove(req.params.id)
        .then(user =>{
            if(user){
                return res.status(200).json({succes:true,msg:"user is deleted"})
            }else{
                return res.status(404).json({success:false,msg:"user not found !"})
            }
        })
        .catch(err =>{
            return res.status(400).json({success:false,err:err})
        })
})



module.exports =router;