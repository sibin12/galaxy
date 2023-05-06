const Cart = require('../models/cartSchema')


exports.verifyLogin=async(req,res,next)=>{
    if(req.session.user){
        next()
    }else{
        res.redirect('/signin')
    }
  }

// exports.verifySignup = async (req,res,next)=>{
//     if(req.session.user){
//         next()
//     }
//     res.redirect('/signup')
// }


exports.cartCount = async (req,res,next)=>{
    // console.log('helloooooooooooooooooooooooooo')
    if(req.session.user){

        let count = 0;
        let cart = await Cart.findOne({userId:req.session.user._id})
        console.log(cart);
        if(cart){
            count = cart.product.reduce((acc,product)=>acc+product.quantity,0);
            console.log(count)
            req.session.user.count = count;

            res.locals.count = req.session.user.count

        }
        next()
    }else{
        next()
    }
  }
 
