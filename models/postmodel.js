var mongoose = require('mongoose')


var postSchema = mongoose.Schema({
    userid: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user"
    }],
    tag: String,
    data:String,
    brand:String,
    price:Number,
    likes: [
        { type:mongoose.Schema.Types.ObjectId, ref:"user"}
    ],
    
    image: {
        type:String,
        userid: {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
    },

    
     detail: [
        {
            userid: {
                type:mongoose.Schema.Types.ObjectId,
                ref:"user"
            },
            msg:String,
            price:Number,
            data:String,

            username:String,
            
            image:String,
            postimage:String,

            date:{
                type: Date,
                default: Date.now()
            }
        }
    ],

    date:{
        type: Date,
        default: Date.now()
    },

    postimage:{
        type: String,
    },
   

})


module.exports = mongoose.model("post", postSchema);