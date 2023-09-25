const sendVerifyEmail = require('./../middleware/verifyemail');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const session =require('express-session');
const random =require('randomstring');
const passport = require('passport');

const registration = async (req,res)=>{
    try {
        res.render('./../views/users/registeration.ejs');
    } catch (error) {
        console.log(error.message);
    }
}
const sercurepassword = (password)=>{
    try {
        const salt =  bcrypt.genSaltSync(10);
        const hash =  bcrypt.hashSync(password,salt);
        return hash;
    } catch (error) {
        console.log(error.message);
    }
}
const inserdata=async (req,res)=>{
    try {
        const hashpassword = sercurepassword(req.body.password);
       const alreadyuser = await User.findOne({email:req.body.email});
       if(alreadyuser){
        res.redirect('http://13.233.72.26:3000/signUp');
        return
       }
        const users =new User({
            name:req.body.name,
            email:req.body.email,
            PhoneNumber:req.body.mno,
            image:req.file.filename,
            password:hashpassword,
            plainPassword:req.body.password,
            isverified:0,
            isadmin:0
        })
        const userdata = await users.save();
        console.log(userdata);
        if(userdata){
            sendVerifyEmail.verifemail(userdata.name,userdata.email,userdata._id);
            res.render('./../views/users/registeration.ejs',{message:'Your registeration is successfull,please verify your email'});
           
        }
        else{
            console.log('Data insertion error',err.message);
        }
    } catch (error) {
        console.log(error.message);
    }
}
const emailVerified = async (req,res)=>{
    const updated = await User.updateOne({_id:req.query.id},{isverified:1})
    if(updated){
        console.log('email verified successfully');
    }
    else{
        console.log('email has not been verified sorry');
    }
}
const loginLoad = async (req,res)=>{
    res.render('./../views/users/login.ejs');
}
const loginverify =async (req,res)=>{
    try {
        try {
        const checkemail = await User.findOne({email:req.body.email});
        if(checkemail){
            const checkpass = await bcrypt.compare(req.body.password,checkemail.password);
            if(!checkpass){
                console.log('email and password are incorrect');
            }
            else{
                const token =  jwt.sign({_id:checkemail._id},'Gursevak');
                const update =await User.findByIdAndUpdate({_id:checkemail._id},{$set:{jwtToken:token}});
                if(!update){
                    console.log('this is error in generation token');
                }
                else{
                    const verified = await User.findOne({_id:checkemail._id});
                    if(verified.isverified=== 0){
                        console.log('email is not verified');
                    }
                    else{
                        req.session.User_Id=checkemail._id;
                        console.log('Login successfully');
                        res.redirect('/home');
                    }
                }
            }
        }
        else{
            console.error('error');
        }
        } catch (error) {
           console.log(error) ;
        }
    } catch (error) {
      console.log(error)  ;
    }
 
}
const userlogout = async (req,res)=>{
try {
req.session.destroy();
res.redirect('/signup');
} catch (error) {
    console.log(error);
}
}
const home =async (req,res)=>
{
    const user_id =req.session.User_Id;
        const userdata = await User.findOne({_id:user_id});
    console.log(userdata)
    res.render('./../views/users/home.ejs',{user:userdata});
}
const forgetpassword = async (req,res)=>{
    res.render('./../views/users/forget.ejs');
}
const resetlink = async (req,res)=>{
    try {
        let checkmail = await User.findOne({email:req.body.email});
        if(!checkmail){
            console.log('invaild email');
        }
        const token = await random.generate();
        const update =await User.findByIdAndUpdate({_id:checkmail._id},{$set:{randomstring:token}});
       const reset=await sendVerifyEmail.sendResetEmail(checkmail.name,checkmail.email,token)
       if(!reset){
        console.log('This is error for your configuration');
       }
       else{
        console.log('verification email send successfully');
       }
;    } catch (error) {
        console.log(error);
    }
}
const resetpassword = async (req,res)=>{
    try {
        const token = await User.findOne({randomstring:req.query.token});
        if(token){
            res.render('./../views/users/resetpassword.ejs',{user_id:token._id});
        }
        
    } catch (error) {
        console.log(error);
    }
}
const updatepassword=async (req,res)=>{
    console.log(req.body);
    try {
        const checkuser = await User.findOne({_id:req.body.user_id});
        const password = await sercurepassword(req.body.password);
    if(!checkuser){
        console.log('invaild user');
    }
    const update = await User.findByIdAndUpdate({_id:checkuser._id},{$set:{password:password}});
    console.log('password has been changed');
    } catch (error) {
        console.log('error');
    }
}
const verificationload = async (req,res)=>{
    res.render('./../views/users/verification.ejs');
}
const sendverificaionmail = async (req,res)=>{
    try {
        const email = req.body.email;
        let usercheck = await User.findOne({email:email});
        if(!usercheck){
            console.log('user is not registered'); 
        }
        const verifiedmaill = await sendVerifyEmail.verifemail(usercheck.name,usercheck.email,usercheck._id);
        if(verifiedmaill){
            console.log('email verified successfully');
        }
    } catch (error) {
        
    }
}
const editload =async (req,res)=>{
    try {
        const user_id= req.query.id;
        const userdata =await User.findOne({_id:user_id});
        if(!userdata){
            res.send("user not found");
        }
        const tokenid = req.session.User_Id;
        const tokendata = await User.findOne({_id:tokenid});
        res.render('./../views/users/edituser.ejs',{token:tokendata.jwtToken});
    } catch (error) {
        
    }
}
const updateuser = async (req,res)=>{
    console.log(req.body.email)
    const mail =await User.findOne({email:req.body.email});
    if(!mail){
        console.log('email incorrect please provied vaild email id');
    }
    const token = req.body.token;
    const istoken = jwt.verify(token,'Gursevak');
    if(!istoken){
        console.log('token has been expeired');
    }
    const securepassword =await sercurepassword(req.body.password);
    const update = await User.findByIdAndUpdate({_id:mail._id},{$set:{name:req.body.name,email:req.body.email,PhoneNumber:req.body.mon,image:req.body.image,password:securepassword}},{$unset:{jwtToken:''}})
    console.log(update);
}   
const otpverification = (req,res)=>{
   // Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
const accountSid = "AC256f83d87f342584de05f35cfa16876c";
const authToken = "16e1b0735b9ea6d3c56e8e208ef21074";
const verifySid = "VA284b84942f108a68c311350c5a4640ed";
const client = require("twilio")(accountSid, authToken);

client.verify.v2
  .services(verifySid)
  .verifications.create({ to: "+917037772781", channel: "sms" })
  .then((verification) => console.log(verification.status))
  .then(() => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    readline.question("Please enter the OTP:", (otpCode) => {
      client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: "+917037772781", code: otpCode })
        .then((verification_check) => console.log(verification_check.status))
        .then(() => readline.close());
    });
  });
}
module.exports = {
    registration,
    inserdata,
    emailVerified,
    loginLoad,
    loginverify,
    userlogout,
    home,
    forgetpassword,
    resetlink,
    resetpassword,
    updatepassword,
    verificationload,
    sendverificaionmail,
    editload,updateuser,
    sercurepassword,
    otpverification
    
}