const Admin = require('../models/adminSchema')
const User = require('../models/userSchema')
const Banner = require('../models/bannerSchema')
const Order = require('../models/orderSchema')
const bcrypt = require('bcrypt')
const multer = require('multer')
const path = require('path')
const { orderDetails } = require('./addressController')

const bannerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./public/uploads/banner")
    },
    filename: function (req, file, cb) {
        return cb(null, req.body.name + path.extname(file.originalname))
    }
})

const upload = multer() 
const uploadBanner = multer({ storage: bannerStorage })






exports.adminLogin = async (req,res)=>{
 try{
    console.log('hello login')
     
      res.render('admin/admin-login',{other:true })
 }catch(err){
    console.log(err);
 }
}
exports.adminHome = async (req,res)=>{
    if(req.session.admin){
        console.log('hello adminhome')
        res.render('admin/admin-home',{admin:true})
    }
}

exports.postLogin = async (req,res)=>{
       console.log('login check')
    console.log(req.body)
    try{
        let userName=  await Admin.findOne({email:req.body.email})

        if(userName){
            
            bcrypt.compare(req.body.password,userName.password).then((status)=>{
                if(status){
                    console.log('admin existss')
                    req.session.admin = userName
                    req.session.admin.loggedIn = true
                    req.session.admin.loginError = false
                    res.render('admin/dashboard',{admin:true})
                }else{
                    req.session.admin.loginError = "invalid password or email"

                    console.log("password error");
                    res.redirect('/admin')
                }
            })
        }else{
            req.session.admin.loginError = "invalid password or email"

            console.log("email error");
            res.redirect('/admin')
        }

    }catch(error){
        console.log(error)
        // res.redirct('/')
    }
}

exports.adminLogout = (req,res)=>{
    req.session.destroy()
    res.redirect('/admin')
}

exports.usersList = async (req,res)=>{
   try{
    console.log("admin details");
    let adminDetails =req.session.admin
    console.log(adminDetails);
    const userList = await User.find({})
    res.render('admin/view-users',{userList,admin:true,adminDetails})
   }catch(err){
    console.log(err)
   }
}

exports.blockUser = async (req,res)=>{
   await  User.updateOne({_id : req.params.id},{isActive : false})
   res.redirect('/admin/view-users')
}

exports.unblockUser = async (req,res)=>{
    await User.updateOne({_id : req.params.id},{isActive : true})
    res.redirect('/admin/view-users')
}

exports.deleteUser = async (req,res)=>{
    await User.deleteOne({_id : req.params.id})
    res.redirect('/admin/view-users')
}


//banners




exports.viewBanner = async(req,res)=>{
    try {
        let banner= await Banner.find({})
        console.log(banner ) 
            res.render('admin/view-banner',{banner,admin:true})
    } catch (error) {
        console.log(error);
    }
}
exports.addBanner =async (req,res)=>{
    try {
        res.render('admin/add-banner',{admin:true})
    } catch (error) {
        console.log(error);
    }
}
exports.postAddBanner = async (req,res)=>{
   
        console.log('body')
        console.log(req.body.name);
   
     uploadBanner.single('image')(req,res,async (err) => {
        if (err) {
            console.log(err)
            return next(err)
        }
        try{
            const newBanner= new Banner({
                name:req.body.name,
                description:req.body.description,
                image:req.body.name + path.extname(req.file.originalname)
            })
            await Banner.create(newBanner)
            res.redirect('/admin/view-banner')

        }catch(err){
            console.log(err)
            res.redirect('/admin/add-banner')
        }

    }) 
       
}
exports.deleteBanner = async (req,res)=>{
    try {
        await Banner.deleteOne({_id:req.params.id})
        res.redirect('/admin/view-banner')
    } catch (error) {
        console.log(error);
    }
}

exports.viewOrders = async (req,res)=>{
    try {

      let   orders = await Order.aggregate([{
             $lookup:{
                from:"products",
                localField:"products.item",
                foreignField:"_id",
                as:"productInfo"
            }
        }])

        console.log(orders,"+++++++++++++++++")
        console.log(orders[0].products);
        res.render('admin/view-orders',{admin:true,orders})

        
    } catch (error) {
        console.log(error);
    }
}

exports.deliveryStatus = async (req,res)=>{
    console.log(req.body);

}



