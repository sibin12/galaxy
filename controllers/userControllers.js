// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = require("twilio")(accountSid, authToken);

const User=require('../models/userSchema')
const Product = require('../models/productSchema')
const Admin=require('../models/adminSchema')
const bcrypt=require('bcrypt')
const OTP = require('../models/otpSchema')
const Cart= require('../models/cartSchema')
const Banner = require('../models/bannerSchema')



exports.userIndex = async (req,res)=>{
    let products = await Product.find({})
    let banner = await Banner.find({})
    // console.log(products)
    res.render('user/index',{products,user:req.session.user,banner})
}
exports.homePage = async (req,res)=>{
    console.log(res.locals.count+"req.sessionssssssssssssssssssssssssss")
    // console.log(req.session);
    let banner = await Banner.find({})
    let products = await Product.find({})
 let user=req.session.user
 let count = req.session.user.count

 res.render('user/index',{count,user,products,banner})
}
exports.getSignUp = (req,res)=>{
    res.render('user/signup',{other:true})
}
exports.postSignUP = async (req,res)=>{
    try{
        let existingUser = await User.findOne({email:req.body.email})
        if(existingUser){
            console.log("this email is already taken");
            req.session.loginErr ="Email is already exists"

            res.redirect('/signup')

        }else{
           
            let hashedPassword =await bcrypt.hash(req.body.password ,10)

            const newUser = new User({
                name:req.body.name,
                email:req.body.email,
                mobile:req.body.mobile,
                password:hashedPassword,
                status:false,
                isActive:true
            })

            User.create(newUser)

            // otp

            const number = req.body.mobile
            let randomN = Math.floor(Math.random() * 90000) +10000
            
        //send random numbers to users number (twilio)
            client.messages
               .create({ body: randomN, from: "+16204558311", to: "+91" + number })
               .then(otpfun());

               async function otpfun(){
                const newUser = new OTP({
                  users:req.body.mobile,
                  otp: randomN,
                });
                await OTP.create(newUser)
              }

            
            res.render('user/signupotp',{number:req.body.mobile,other:true})
        }
    }catch(error){
        console.log(error)
        res.redirect('/signup')
    }
}

exports.postVerify =  async (req,res)=>{
    let code = req.body.code
    console.log(code)
    console.log("otp");
    

   await  OTP.findOne({ otp: code })
  .then(found => {
    if (found) {
      res.redirect('/signin')
      console.log("otp success")
    } else {
        console.log("otp error")
      res.render("user/otperror",{other:true});
    }
  })


    await OTP.findOneAndDelete({ otp: code })
  .exec()
  .then((result) => {
    console.log("deleted");
  })
  .catch((err) => {
    console.log(err);
  });
}


exports.getSignIn = (req,res)=>{
    console.log("signin  get");
    if(req.session.user){
      return res.redirect('/index')  
    }
    res.render('user/signin',{other:true, loginErr : req.session.loginErr})
}

exports.postSignIn = async (req, res) => {
    // console.log(req.body);

    try {      
        let user = await User.findOne({email: req.body.email})
        if (user) {
            console.log('email valid');
            bcrypt.compare(req.body.password, user.password).then((status) => {
                if (status) {
                    if(user.isActive){
                        console.log('user exists');
                        req.session.user = user;
                        req.session.loggedIn = true;
                        res.redirect('/index');
                    }else{
                        req.session.loginErr ="User has been blocked "
                        res.redirect('/signin')
                    }
                  
                } else {
                    console.log('invalid  password')
                    req.session.loginErr="Invalid email or password"
                    res.redirect('/signin');
                }
                // console.log(req.session.user)
            })
        }else{
            req.session.loginErr = "invalid email or password"
            res.redirect('/signin')
        }
        

    } catch(error) {
        console.log("email eerror")
        console.log(error);
        res.render('signin',{other:true});
    }
}
exports.logOut = async (req,res)=>{
    try{
        req.session.destroy()
        res.redirect('/')
    }catch(err){
        console.log(err)
    }
}













