function errorHandler(err,req,res,next) {
    if(err.message === 'UnauthorizedError'){
        return res.status(401).json({success:false,msg:"user is not Authorized"})
    }
    if(err.message === 'ValidationError'){
        return res.status(401).json({success:false,msg:err})
    }
    return res.status(500).json({success:false,msg:"internal Server Error",err:err})
}

module.exports = errorHandler