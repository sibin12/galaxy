var express = require('express');
var router = express.Router();
var userController = require('../controllers/userControllers')
var productController = require('../controllers/productControllers');
const addressController = require('../controllers/addressController')
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
router.get('/checkout',userVerify.verifyLogin,addressController.checkOut)
router.post('/checkout',userVerify.verifyLogin,addressController.postCheckOut)
router.get('/orderPlaced',userVerify.verifyLogin,addressController.orderPlaced)
router.get('/orders',userVerify.verifyLogin,addressController.orderDetails)
router.get('/viewOrderProducts/:id',userVerify.verifyLogin,addressController.viewOrderProducts)

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

router.post('/removeItem',userVerify.verifyLogin,productController.removeItem)
router.post('/changeProductQuantity',userVerify.verifyLogin,productController.changeProductQuantity)

//address
router.get('/address', userVerify.verifyLogin, addressController.getAddress)
router.post('/add-address', userVerify.verifyLogin,addressController.addAddress)
router.delete('/deleteAddress/:id', userVerify.verifyLogin,addressController.deleteAddress)
router.get('/editAddress/:id',userVerify.verifyLogin,addressController.editAddress)
router.post('/editAddress/:id',userVerify.verifyLogin,addressController.postEditAddress)


module.exports = router;

