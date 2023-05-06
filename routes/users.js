var express = require('express');
var router = express.Router();
var userController = require('../controllers/userControllers')
var productController = require('../controllers/productControllers');
const nocache = require('nocache');
const userVerify= require('../middleware/userverify')


router.use(userVerify.cartCount)
/* GET home page. */

router.get('/', userController.userIndex)

router.get('/index',userVerify.verifyLogin, userController.homePage)

router.get('/mobile',function(req,res){
  res.render('user/mobile',{user:req.session.user})
})


router.get('/contact',(req,res)=>{
  res.render('user/contact',{user:req.session.user})
})
router.get('/checkout',(req,res)=>{
  res.render('user/checkout',{user:req.session.user})
})
router.get('/signin', userController.getSignIn)

router.post('/signin', userController.postSignIn)

router.get('/signup',userController.getSignUp)

router.post('/signup',userController.postSignUP)

router.post('/otpverify',userController.postVerify)

router.get('/logout',userController.logOut)

// product 

router.get('/product-view/:id',productController.productView)

router.get('/cart',userVerify.verifyLogin, productController.getCartProducts)
router.get('/addToCart/:id',userVerify.verifyLogin,productController.addToCart)

router.post('/removeItem',productController.removeItem)
router.post('/changeProductQuantity',productController.changeProductQuantity)

module.exports = router;

