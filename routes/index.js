var express = require('express');
var router = express.Router();
var userModel = require('../models/usermodel')
var postModel = require('../models/postmodel')
var passport = require('passport')
var mongoose = require('mongoose')
const path = require("path");
const multer = require('multer')
var Razorpay=require('razorpay');



var localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()))

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
    cb(null, uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

router.post('/upload', isLoggedIn, upload.single("image"), function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (userdets) {
      if (userdets.image !== 'def.png') {
        fs.unlinkSync(`./public/images/uploads/${userdets.image}`)
      }
      userdets.image = req.file.filename;
      userdets.save()
        .then(function () {
          res.redirect("back")
        })
    })
})

var instance = new Razorpay({
  key_id: 'rzp_test_VKBWnUuvnx9dr2',
  key_secret: 'c2SYBC8k1LRkoas4k2ApgiBq',
});


router.post('/create/orderId',function(req,res,next){
  var options = {
    amount: req.body.amount*100 ,  // amount in the smallest currency unit i.e. in paise
    currency: "INR",
    receipt: "order_rcptid_11"
  };
  instance.orders.create(options, function(err, order) {
    console.log(order);
    res.send(order);
  });
})

router.post('/api/payment/verify',(req,res)=>{
  const razorpayOrderId=req.body.response.razorpay_order_id;
  const razorpayPaymentId=req.body.response.razorpay_payment_id;
  const signature=req.body.response.razorpay_signature;
  const secret='c2SYBC8k1LRkoas4k2ApgiBq';
  var { validatePaymentVerification, validateWebhookSignature } = 
  require('../node_modules/razorpay/dist/utils/razorpay-utils');
  const result = validatePaymentVerification({"order_id": razorpayOrderId, 
  "payment_id": razorpayPaymentId } , signature, secret);
  res.send(result);
})

router.get('/success',(req,res)=>{  
  res.render('success');
})


mongoose.connect('mongodb://0.0.0.0/ecommerce').then(() => {
  console.log("connected to database")
}).catch(err => {
  console.log(err)
})


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

// router.get('/home', isLoggedIn, function(req, res){
//   userModel.findOne({username: req.session.passport.user})
//   .then(function(user){
// postModel.find()
// .then(function(allposts){
// res.render('home', {allposts, user})
// })
//   })
// })

router.get('/home', isLoggedIn, async function(req, res){
  
res.render('home')  
})




router.get('/collection', isLoggedIn, function(req, res){
  userModel.findOne({username: req.session.passport.user})
  .then(function(user){
postModel.find()
.then(function(allposts){
res.render('collection', {allposts, user})
})
  })
})



router.get('/men', isLoggedIn, function(req, res){
  userModel.findOne({username: req.session.passport.user})
    .then(function(user){
      postModel.find({tag: "male"})
        .then(function(posts){
          res.render('men', { user, posts });
        })
        .catch(function(error){
          console.error(error);
          res.status(500).send('Internal Server Error');
        });
    })
    .catch(function(error){
      console.error(error);
      res.status(500).send('Internal Server Error');
    });
});



router.get('/women', isLoggedIn, function(req, res){
  userModel.findOne({username: req.session.passport.user})
  .then(function(user){
    postModel.find({tag:"female"})
    .then(function(posts){
      res.render('women', {user, posts});
    })
    .catch(function(error){
      res.status(500).send("Internal Server Error")
    })
  })
  .catch(function(error){
    res.status(500).send("Internal Server Error")
  })
})

router.post('/post', isLoggedIn, upload.single("postimage"), function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      postModel.create({
        postimage: req.file.filename,
        data: req.body.post,
        userid: user._id,
        price: req.body.price,
        brand: req.body.brand,
        tag:req.body.tag

      })
        .then(function (post) {
console.log(post)
          user.posts.push(post._id)
          user.save()
            .then(function () {
              res.redirect("back")
            })
        })
    })
})

router.post('/post/:id', isLoggedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      postModel.findOne({  _id: req.params.postid})
        .then(function (post) {
          user.posts.push(post._id)
          user.save()
            .then(function () {
              res.redirect("back")
            })
        })
    })
})
router.get('/post/:id', isLoggedIn, function (req, res) {
  userModel.findOne({ username: req.session.passport.user })
    .then(function (user) {
      postModel.findOne({ _id: req.params.id })
        .then(function (post) {
          res.render('postDetails', { user, post });
        })
        .catch(function (error) {
          // Handle errors
          console.error(error);
          res.status(500).send('Internal Server Error');
        });
    })
    .catch(function (error) {
      // Handle errors
      console.error(error);
      res.status(500).send('Internal Server Error');
    });
});





router.get('/profile', isLoggedIn, function (req, res) {

  userModel.findOne({ username: req.session.passport.user })
    .then(function (userdets) {
      res.render('profile', { userdets })
    })

})

//  router.get('/likepost/:postid', isLoggedIn, async function(req, res, next){
//    const foundUser = await userModel.findOne({username: req.session.passport.user})
//    if(foundUser.likes.indexOf(req.params.postid) === -1){
//      foundUser.likes.push(req.params.postid)
//    }
//   else{
//      foundUser.likes.splice(foundUser.likes.indexOf(req.params.postid), 1)
//    }
//  await foundUser.save()

//    const foundPost = await postModel.findOne({_id: req.params.postid})
//    if(foundPost.likes.indexOf(foundUser._id) === -1){
//      foundPost.likes.push(foundUser._id)
//    }
// else{
//     foundPost.likes.splice(foundPost.likes.indexOf(foundUser._id), 1)
//   }
//   await foundPost.save()
//   res.redirect('back')
//  })


// router.get('/likedPost', isLoggedIn, async (req, res, next)=> {
// const postData = await userModel.findOne({username:req.session.passport.user})
// .populate("likes")
// res.render("likedPost", {postData})
// })



// .populate("userid comment.userid" )



router.get('/likepost/:postid', isLoggedIn, async function(req, res, next) {
  try {
    const foundUser = await userModel.findOne({ username: req.session.passport.user });

    // Check if the post is already liked by the user
    const likedIndex = foundUser.likes.indexOf(req.params.postid);

    if (likedIndex === -1) {
      // If not liked, add to user's likes
      foundUser.likes.push(req.params.postid);
    } else {
      // If liked, remove from user's likes
      foundUser.likes.splice(likedIndex, 1);
    }

    // Save the user
    await foundUser.save();

    // Find the post
    const foundPost = await postModel.findOne({ _id: req.params.postid });

    // Check if the user has already liked the post
    const userLikedIndex = foundPost.likes.indexOf(foundUser._id);

    if (userLikedIndex === -1) {
      // If not liked, add user to post's likes
      foundPost.likes.push(foundUser._id);
    } else {
      // If liked, remove user from post's likes
      foundPost.likes.splice(userLikedIndex, 1);
    }

    // Save the post
    await foundPost.save();

    // Redirect back to the previous page
    res.redirect('back');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



 router.get('/likedPost', isLoggedIn, async (req, res, next)=> {
 const postData = await userModel.findOne({username:req.session.passport.user})
 .populate("likes")
 res.render("likedPost", {postData})
 })



router.get('/login', function (req, res) {
  res.render('login')

})

router.post('/register', function (req, res) {
  let newuser = new userModel({
    username: req.body.username,
    email: req.body.email,
    password: req.body.passport,
  })
  userModel.register(newuser, req.body.password)
    .then(function () {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile')

      })
    })
    .catch(function (e) {
      res.send(e)
    })
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}), function (req, res, next) { })

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/login')
  }
}

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err) }
    res.redirect('/login');
  })
})

router.get('/logout', function (req, res, next) {
  req.logout();
  res.redirect('/login')

})

module.exports = router;
