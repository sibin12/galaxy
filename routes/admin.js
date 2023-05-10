var express = require('express');
var router = express.Router();
var adminController =require('../controllers/adminControllers')
var productController = require('../controllers/productControllers')
const Category= require('../models/categorySchema')

const adminVerify = require('../middleware/adminverify')

/* */
router.get('/',adminController.adminLogin);
router.post('/adminLogin',adminController.postLogin)

//set middlewares  for admin 
router.use(adminVerify.verifyAdmin)

router.get('/view-users',adminController.usersList)

router.get('/view-products',productController.getAllProducts)

router.get('/add-product',productController.addProduct)
router.post('/add-product',productController.postProduct)
router.get('/edit-product/:id',productController.editProduct)
router.post('/edit-product/:id',productController.postEditProduct)
router.get('/delete-product/:id',productController.deleteProduct)


router.get('/category-list',productController.categoryList)
router.post('/add-category',productController.postCategory)
router.get('/delete-category/:id',productController.deleteCategory)


router.get('/view-banner',adminController.viewBanner)
router.get('/add-banner',adminController.addBanner)
router.post('/add-banner',adminController.postAddBanner)
router.get('/delete-banner/:id',adminController.deleteBanner)

router.get('/view-orders',adminController.viewOrders)
router.post('/delivery-status/',adminController.deliveryStatus)


router.get('/adminlogout',adminController.adminLogout)

router.get('/blockUser/:id',adminController.blockUser)
router.get('/unblockUser/:id',adminController.unblockUser)
router.get('/deleteUser/:id',adminController.deleteUser)

module.exports = router;
