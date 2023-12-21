var mongoose = require('mongoose')
var passportLocalMongoose = require('passport-local-mongoose');


var userSchema = mongoose.Schema({
    username:String,
    email:String,
    password:String,
    image:{
        type:String,
        default:"def.png"
    },
    posts:[
        {type: mongoose.Schema.Types.ObjectId, ref:"post"}

    ],
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'post'
        }
    ],
})

userSchema.plugin(passportLocalMongoose);

const userModel = mongoose.model('user', userSchema)
module.exports = userModel;
