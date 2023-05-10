const Address = require('../models/addressSchema')
const Cart = require('../models/cartSchema')
const Order = require('../models/orderSchema')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;


exports.getAddress = async (req,res)=>{
 
     let user = req.session.user;
    let userId = req.session.user._id;  
    userId = userId.toString();
    console.log(user, "user here");
  
    const cartCount = req.session.user.count;
    // console.log(cartCount,"++++++++++++++++++++++++++++++++++++++++++++++++++");
    const addressData = await Address.find({ user: user._id });
  
    if (addressData && addressData.length > 0) {
      const address = addressData[0].address;
      console.log(address, "address got");
  
      try {
        res.render("user/address", {
          user,
          cartCount,
          address,
        });
      } catch (error) {
        console.log(error);
      }
; 
    } else {
        console.log("No address data found");
        res.render("user/savedAddress", {
          user,
          cartCount,
          address: [],
        });
      } 

}  
exports.addAddress = async (req,res)=>{
    user= req.session.user._id
    console.log("lllllllllllllllllllllllllllllllllllllllllllllllllllllll");
    console.log(user)
    // console.log(req.session.user._id,"kkkkkkkkkkkk")
    // console.log(req.body); 
   const addaddress = {
    firstName:req.body.firstname,
    lastName:req.body.lastname,
    email:req.body.email,
    number:req.body.mobile,
    streetAddress:req.body.address,
    appartment:req.body.appartment,
    town:req.body.town,
    district:req.body.district,
    state:req.body.state,
    pin:req.body.pin
   }

   try{ 
    console.log("hellooo");
     const data = await Address.findOne({user:user})
     console.log(data);
     if(data){
        console.log("if case")
        data.address.push(addaddress); 
      const updated_data = await Address.findOneAndUpdate(
        { user: user },
        { $set: { address: data.address } },
       
      ); 
      console.log(updated_data, "updated address collection");
       
         

     }else{
        console.log("else conditionnn");
        const address =new Address(
            {
                user:req.session.user._id,
                address:[addaddress]
            }
        )
        const address_data = await address.save();
        console.log(address_data, "address collection"); 
     }
 res.json(true)
   }catch(err){
    console.log(err);
   }
}

exports.deleteAddress = async (req,res)=>{
    console.log("deleteing addresss");
    userId = req.session.user._id
    addressId = req.params.id 
    const result= await Address.updateOne({user:userId },{$pull:{address:{_id: new ObjectId(addressId)}}})
    res.json(true)
    console.log(result)
    if(result){
        console.log("helloooooooooooooooo");
    }
} 
exports.editAddress = async (req,res)=>{
    try {
        let user = req.session.user;
        const address = await Address.findOne({ "address._id": req.params.id });

        const selectedAddress = address.address.find(
          (addr) => addr._id.toString() === req.params.id
        );
        console.log(selectedAddress, "selectedAddress");
        res.render("user/edit-address", {
         user,
          address: selectedAddress,
        });
    } catch (error) {
        console.log(error);
    }
}

exports.postEditAddress = async (req,res)=>{
console.log("post edit addresss");
    try{
        console.log("inside try");
    userId= req.session.user._id
    addressId = req.params.id

    const user = await Address.find({user:userId})
    // const address = user.address.findOne((a)=>a._id.toString === addressId)
    const updateAddress ={
        firstName:req.body.firstname,
        lastName:req.body.lastname,
        email:req.body.email,
        number:req.body.mobile,
        streetAddress:req.body.address,
        appartment:req.body.appartment,
        town:req.body.town,
        district:req.body.district,
        state:req.body.state,
        pin:req.body.pin
    }
    const updated_address= await Address.updateOne({user : userId , "address._id": new ObjectId(addressId)} ,
    { $set:{"address.$":updateAddress}})
    console.log(updateAddress);

    res.redirect('/address')
   }catch(er){
    console.log(er);
   } 
}

exports.checkOut = async (req,res)=>{

    try{

    let userId= req.session.user._id
   
        let address = await Address.findOne({user:userId})
        address= address.address
        console.log(address,"////////////////")
        
        // let userId = req.session.user._id
        userId = userId.toString()
        console.log(userId)
        let cartItems=[];
   
    
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
        res.render('user/checkout',{user:req.session.user,address,cartItems,total})
        
        // console.log(total)
    }catch(err){
        console.log(err);
    }

}
exports.postCheckOut = async (req,res)=>{
    try {
        // console.log("///////////////////////////////////////////tttttttttttttttttttttttttttt");
     const order = req.body
    //  console.log(order ,"jhfjsfdhjdfshhhhhhhhhhhhhhhhhhhhhhhhh")
     let cod = req.body['payment-method']
//   console.log(cod)
  let addressId= order['address-check'];
//   let addressId = new mongoose.Types.ObjectId(req.body.address);
//   console.log(addressId)

   const addressDetails = await Address.findOne(
      { "address._id": addressId },
      { "address.$": 1 }
    );

//   console.log(addressDetails,"addressdetail");

  let filteredAddress = addressDetails.address[0]
//   console.log(filt,"lllllllllllllllll");
let userId =req.session.user._id;
let cart = await Cart.findOne({userId:req.session.user._id});

    // console.log(cart.product,"-----------------------------");
 //   total by aggregation 
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

//status
    let status = req.body['payment-method'] === 'COD' ? 'placed' : 'pending'
// console.log(status);

// console.log(filteredAddress.firstName,'+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    let orderObj = new Order({
        deliveryDetails: {
            firstName: filteredAddress.firstName,
            lastName: filteredAddress.lastName,
            state: filteredAddress.state,
            district: filteredAddress.district,
            streetAddress: filteredAddress.streetAddress,
            appartment: filteredAddress.appartment,
            town: filteredAddress.town,
            pin: filteredAddress.pin,
            number: filteredAddress.number,
            email: filteredAddress.email,
        },
        userId: cart.userId,
        paymentMethod: req.body['payment-method'],
        products: cart.product,
        totalAmount: total[0].total,
        paymentstatus: status,
        deliverystatus:'not shipped',
        createdAt: new Date()
    })
    // console.log(orderObj,"")
    let orderDoc = await Order.create(orderObj);
    req.session.user.count = 0;

    console.log("******************",orderDoc,"**********************************");
     await Cart.findOneAndDelete({userId:cart.userId})
     if(req.body['payment-method'] == 'COD'){
        res.json({CODSuccess:true})
     }else{
        alert("select the cod option")
     }

    } catch (error) {
        console.log(error);
    }
}

exports.orderPlaced = async (req,res)=>{
    try {
        res.render('user/order-placed',{user:req.session.user})
        
    } catch (error) {
        console.log(error);
    }
}
exports.orderDetails = async (req,res)=>{
    try {
        let userId = req.session.user._id;
        let orders = await Order.find({userId:userId})
        res.render('user/orders',{user:req.session.user,orders})
    } catch (error) {
        console.log(error);
    }
}

exports.viewOrderProducts = async (req,res)=>{
    try {

    // console.log("vieworderedproducts")
    let order = req.params.id
    // console.log(order,"order id ");

      let orderId = new ObjectId(order)
     
    let orders = await Order.aggregate([
{$match:{ _id: orderId}},

{ $lookup:{
    from:"products",
    localField:"products.item",
    foreignField:"_id",
    as:"productInfo"
}}
    ]
    )
    // console.log(orders,"proudctssssssssssss")
    // console.log(orders[0].productInfo);
       orders[0].productInfo.forEach((product,index)=>{
        product.quantity = orders[0].products[index].quantity
    })
    console.log(orders[0].productInfo,"////////////////////////")

        res.render('user/view-orders',{ products : orders[0].productInfo , user:req.session.user})
        
    } catch (error) {
        console.log(error);
    }
}