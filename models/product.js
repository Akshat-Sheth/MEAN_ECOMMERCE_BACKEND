const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    richDescription:{
        type:String,
        default:''
    },
    image:{
        type:String,
        default:''
    },
    images:[{
        typ:String
    }],
    price:{
        type:String,
        default:0
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    },
    countInStock:{
        type:String,
        required:true,
        min:0,
        max:255
    },
    rating:{
        type:Number,
        default:0
    },
    numsOfReviews:{
        type:Number,
        default:0
    },
    isFeatured:{
        type:Boolean,
        default:false
    },
    dateCreated:{
        type:Date,
        default:Date.now
    }
})

// this 2 are used to create a virtual field called "id" from "_id"

// productSchema.virtual('id').get(function() {
//     return this._id.toHexString()
// })

// productSchema.set('toJSON',{
//     virtuals: true
// })



exports.Product = mongoose.model('Product', productSchema);
