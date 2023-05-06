const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    name:{
        type : String,
        required : true
    },
    category:{
        type: String ,          // mongoose.Schema.Types.ObjectId,
       // ref: 'Category',
        required : true
    },
    company:{
        type : String,
        required : true
    },
    price:{
        type : Number,
        required : true
    },
    description:{
        type : String,
        required : true
    },
    images : [
        {
            type :  String
        }
    ]

},{
    timestamps:true
})

module.exports = mongoose.model('Product',productSchema)