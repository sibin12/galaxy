const { RequestClient } = require('twilio')
const { ObjectId } = require('bson');
const Product = require('../models/productSchema')
const Category = require('../models/categorySchema')
const Cart=require('../models/cartSchema')
const multer = require('multer')
const fs = require('fs');
const { log } = require('console');
const { success } = require('toastr');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./public/uploads")
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({ storage }) 


// exports.productList = async (req, res) => {
//     res.render('admin/view-products', { admin: true })
// }
exports.categoryList = async (req, res) => {
    let categories = await Category.find({})

    res.render('admin/category-list', { admin: true,categories, categoryErr:req.session.categoryErr })
}
exports.postCategory = async (req,res)=>{
    try {
        console.log("hello")
        const categoryData = await Category.find({})
        console.log(categoryData)
        if(categoryData){
            let check =false
            console.log(req.body.categoryName)
            if (req.body.categoryName && typeof req.body.categoryName === 'string') {
                for (let i = 0; i < categoryData.length; i++) {
                  if (categoryData[i]["categoryName"].toLowerCase() === req.body.categoryName.toLowerCase()) {
                    check = true;
                    // req.session.categoryError =true
                    req.session.categoryErr = "This Category name is already exists"
                    console.log('category exists');
                    console.log(req.session.categoryErr)
                    res.redirect("/admin/category-list")
                    break;
                  }
                }
              } else {
                 req.session.categoryErr = "Category's type is not correct"
                console.log('categoryName is not defined or is not a string');
                res.redirect("/admin/category-list")
              }
              
            if(check ===false){
                req.session.categoryErr = false
                let newCategory = new Category({
                    categoryName:req.body.categoryName  
                })
                await Category.create(newCategory)
                
                res.redirect("/admin/category-list")
            }
        }
    } catch (error) {
        console.log(error)
    }
}
exports.deleteCategory = async(req,res)=>{
    try {
        console.log("finding the category")
        await Category.deleteOne({_id:req.params.id})
        console.log("category deleted")
        res.redirect('/admin/category-list')
    } catch (error) {
     console.log(error);   
    }
    

}

exports.addProduct = async (req, res) => {
    const categories = await Category.find({})

    res.render('admin/add-product', { admin: true,categories })
}
exports.postProduct = async (req, res, next) => {

upload.array('image', 5)(req, res, async (err) => {
        if (err) {
            console.log(err)
            return next(err)
        }
        console.log(req.body)
        console.log(req.file)
    
    try{
        
        console.log(req.body.name);
        let newProduct = new Product({
            
            name:req.body.name,
            category:req.body.category,
            company:req.body.company,
            description:req.body.description,
            price:req.body.price,
            images:req.files.map(file => file.filename)
        })
        await Product.create(newProduct)
        res.redirect('/admin/view-products')
        console.log(newProduct)
    }catch(error){
        console.log("creation error" )
        console.log(error)
    }
})
}


exports.getAllProducts = async (req,res)=>{
    try{
    let products = await Product.find({})
    res.render('admin/view-products',{admin:true,products})
    }catch(err){
        console.log(err)
    }
}
exports.editProduct = async (req,res)=>{
    let product = await Product.findOne({_id: req.params.id})
    let category= await Category.find({})
    if(product){
        res.render('admin/edit-product',{category,product,admin:true})
    }else{
        console.log('not find product')
    }
}
exports.postEditProduct = async (req,res)=>{
    const product = await Product.findById(req.params.id)
    // fs.unlink('./public/uploads' + image.filename, (err) => {
    //     if (err) throw err
    //     console.log("product image Deleted");
    // })
    const existingImages = product.images;

  
  
   console.log(existingImages,"images")
    upload.array('image',5)(req,res,async(err)=>{
        if(err){
            console.log('upload error in edit product')
            console.log(err)
        }
        try{
            const product = await Product.findById(req.params.id)
            let imageFiles = [];
  
      
            if (req.files && req.files.length > 0) {
              // If new images are uploaded, set them as the imageFiles
              imageFiles = req.files.map(file => file.filename);
            } else {
              // If no new images are uploaded, keep the existing ones
              imageFiles = product.images;
            }

            let items =await Product.updateOne({_id:req.params.id},{
                name:req.body.name,
                category:req.body.category,
                company:req.body.company,
                description:req.body.description,
                price:req.body.price,
                images:imageFiles,
            })
            console.log(items)

            const newImages = req.files.map(file=>file.filename)
            console.log(newImages);
            if(newImages.length>0){
                const deletedImages =existingImages.filter(image => !newImages.includes(image))
                console.log(deletedImages);
   
               for (const image of deletedImages) {
                   fs.unlink('./public/uploads/' + image, (err) => {
                     if (err) throw err;
                     console.log(`${image} deleted successfully`);
                   });
                 }
            }else{
                console.log('nothing to delete')
            }
          

            await res.redirect('/admin/view-products')

        }catch(err){
            console.log(err)
        }

    })
   
}
exports.deleteProduct  = async (req,res)=>{
    await Product.deleteOne({_id:req.params.id})
    res.redirect('/admin/view-products')
}

// user side //

exports.productView = async (req,res)=>{
    try{
    const singleProduct = await Product.findOne({_id:req.params.id})
     res.render('user/product-view',{singleProduct})
    }catch(er){
        console.log(er);
    }
}

   
// cart
exports.addToCart = async (req,res)=>{
    let productId = new ObjectId(req.params.id)
    console.log(productId)
    let userId = req.session.user._id
    console.log(userId)
    try{

         const quantity = 1;
         let proObj ={
            item:productId,
            quantity:quantity,
         }
         let userCart = await Cart.findOne({userId:new ObjectId(userId)})
         console.log(userCart);
         let cartCheckProId = req.params.id
         if(userCart){
            let proExist = userCart.product.findIndex(product =>product.item == cartCheckProId)
            if(proExist>-1){
                await Cart.updateOne({userId,"product.item":productId},{
                    $inc:{"product.$.quantity":1}
                })
            }else{
                await Cart.updateOne({userId},{$push:{product:proObj}})
            }
         }else{
                const cartObj = new Cart({
                    userId:userId,
                    product:[proObj]
                })
                console.log(cartObj)
                await Cart.create(cartObj)
                
            }
            // user=req.session.user
            console.log("added to cart");
            
            res.json(true)
                
       
        // let product = await Product.findOne({_id:req.body.id})
        // res.render('user/cart',{product})
    }catch(error){
        console.log(error) 
        res.redirect('/')

    }
}

exports.getCartProducts = async (req,res)=>{
        let userId = req.session.user._id
        userId = userId.toString()
        console.log(userId)
        let cartItems=[];
   
    try{
    //    console.log('finding cart')
        cartItems=await Cart.aggregate([
            {
                $match:{userId}
            },
            {
               $unwind:"$product"
            },
            {
                $project:{
                    item:{$toObjectId:"$product.item"},
                    quantity:"$product.quantity",
                },
            },
            {
                $lookup:{
                    from:'products',
                    localField:"item",
                    foreignField:"_id",
                    as:"productInfo",
                }
            },
            {
                $project:{
                    item:1,
                    quantity:1,
                    productInfo: { $arrayElemAt: ["$productInfo", 0] },
                }
            }
        ])
        // console.log(cartItems)

        let total = await Cart.aggregate([
            {
                $match:{userId}
            },
            {
                $unwind:"$product",
            },
            {
                $project:{
                    item:{$toObjectId:"$product.item"},
                    quantity:"$product.quantity",
                }
            },
            {
                $lookup:{
                    from:"products",
                    localField:"item",
                    foreignField:"_id",
                    as:"productInfo",
                }
            },
            {
                $project:{
                    item:1,
                    quantity:1,
                    productInfo:{$arrayElemAt:["$productInfo",0]},
                }
            },
            {
                $group:{
                    _id:null,
                    total:{$sum:{$multiply:["$quantity","$productInfo.price"]}}
                }
            }
        ])
        
        // console.log(total)

        
        // console.log(total[0].total,'total amount')
        let user=req.session.user
   
     
      res.render('user/cart',{user,cartItems,total})
  
}catch(err){
    console.log(err)
    console.log("cart error");
}
}


exports.changeProductQuantity = async (req, res) => {
    // console.log("button clikeddddddddddddddddddd")
    const { product, cart, count, quantity } = req.body;
    const parsedCount = parseInt(count);
    const parsedQuantity = parseInt(quantity);
    // console.log(parsedQuantity,"parsed quantity");
    const cartId = cart;
    const productId = product;
    // Convert cartId to ObjectId
    const objectIdCartId = new ObjectId(cartId);
    const objectIdproductId = new ObjectId(productId);
  
    try {
    //   console.log("inside the try");


      let cart = await Cart.findOne({});
      let userId = cart.userId;
      console.log(userId); 

      console.log("parsedCount:", parsedCount);
      console.log("parsedQuantity:", parsedQuantity);
      console.log("objectIdCartId:", objectIdCartId);
      console.log("objectIdproductId:", objectIdproductId);
      
      
        //  userId = req.session.user._id;
  
  
        //   console.log(userId)
      let total = await Cart.aggregate([
        {
          $match: { userId: userId },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            item: { $toObjectId: "$product.item" },
            quantity: "$product.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            productInfo: { $arrayElemAt: ["$productInfo", 0] },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$quantity", "$productInfo.price"] } },
          },
        },
      ]).allowDiskUse(true);
  
     
     console.log(total[0].total)
     
    
      
  
      let subtotal = await Cart.aggregate([
        {
          $match: {  userId: userId }, // Replace 'userId' with the actual field that represents the user ID
        },
        {
          $unwind: "$product",                                //this is  a field 
        },
        {
          $project: {
            item: { $toObjectId: "$product.item" },
            quantity: "$product.quantity",
          },
        },
        {
          $lookup: {
            from: "products",            //form the collection products   that is in same as the db like  product => products                    refer
            localField: "item",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            productInfo: { $arrayElemAt: ["$productInfo", 0] },
          },
        },
        {
          $project: {
            _id: 0,
            item: 1,
            quantity: 1,
            subtotal: { $multiply: ["$quantity", "$productInfo.price"] },
          },
        },
      ]);
    //   console.log(subtotal);
  
      // Extract only the subtotal amount for each product
      let subtotalAmounts = subtotal.map((item) => item.subtotal);
  
      console.log("subtotalamounts",subtotalAmounts);
      console.log(subtotalAmounts[2]);
  
      if (parsedCount === -1 && parsedQuantity === 1) {
        console.log("if condition matched only 1 quantitiy");
        await Cart.updateOne(
          { _id: objectIdCartId },
          {
            $pull: { product: { item: objectIdproductId } },
          }
        );
  
        console.log("removed");
  
        res.json({
          success: true,
          removeProduct: true,
          total: total,
          subtotalAmounts: subtotalAmounts,
          subtotal: subtotal,
        }); // Send removeProduct flag as true in the response
      } else {
        // console.log("else condition");
        console.log(parsedCount);
        await Cart.updateOne(
          { _id: objectIdCartId, "product.item": objectIdproductId },
          {
            $inc: { "product.$.quantity": parsedCount },
          }
        );
      }

      console.log(total)
    //   console.log(subtotalAmounts)
      console.log("subtotal",subtotal[2])
  
    //    console.log( req.session.total);
      res.json({
        success: true,
        removeProduct: false,
        total: total,
        subtotalAmounts: subtotalAmounts,
        subtotal: subtotal,
      });
    } catch (error) {
      console.error(error);
    }
  };

exports.removeItem = async (req,res)=>{
    console.log("cart remove");
    const {cart,product,confirmResult} =req.body
    console.log(cart)
    console.log(product);
    const objectIdCartId = new ObjectId(cart)
    const objectIdProductId = new ObjectId(product)
    console.log(objectIdCartId);
    console.log(objectIdProductId);
    try {
        if(confirmResult){
            await Cart.findByIdAndUpdate(objectIdCartId,{
                $pull: { product:{item:objectIdProductId}}
            });console.log("pulled");
            res.json({success:true,removeProduct:true})
        }else{
            console.log("not pulled");
            res.json({success:false,removeProduct:false})
        }
    } catch (error) {
        console.log(error);
    }
}



