console.log('this is verifyemail page');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const verifemail =async (name,email,id)=>{
const transporter = nodemailer.createTransport({
    service:'gmail',
    port:567,
    secure:false,
    auth:{
        user:'gursevaksinghgill21@gmail.com',
        pass:process.env.GMAIL_PASSWORD
    }
})
const mailOption ={
    from:'gursevaksinghgill21@gmail.com',
    to:email,
    subject:'email verification',
    html:'<p> hii '+name+' click on <a href ="http://13.233.72.26:3000/verify?id='+id+'">Verify</a></p>'
}
transporter.sendMail(mailOption,(error,value)=>{
    if(error){
        console.log(error);
    }
    else{
        console.log(value);
    }
})
}
//reset password
const sendResetEmail =async (name,email,token)=>{
    const transporter = nodemailer.createTransport({
        service:'gmail',
        port:567,
        secure:false,
        auth:{
            user:'gursevaksinghgill21@gmail.com',
            pass:process.env.GMAIL_PASSWORD
        }
    })
    const mailOption ={
        from:'gursevaksinghgill21@gmail.com',
        to:email,
        subject:'Password Reset',
        html:'<p> hii '+name+' click on <a href ="http://127.0.0.1:3000/forget-password?token='+token+'">Verify</a></p>'
    }
    transporter.sendMail(mailOption,(error,value)=>{
        if(error){
            console.log(error);
        }
        else{
            console.log(value);
        }
    })
    }
    const addnewuser = async (name,email,id,password)=>{
        const transpoter = nodemailer.createTransport({
            service:"gmail",
            port:567,
            auth:{
                user:"gursevaksinghgill21@gmail.com",
                pass:process.env.GMAIL_PASSWORD
            }
        })
        const mailoption = {
            from:"gursevaksinghgill21@gmail.com",
            to:email,
            subject:'mail verificaion',
            html:'Hii '+ name+' please click to <a href="http://127.0.0.1:3000/verify?id='+id+'">verify</a> <br> your password is '+password+''
        }
        transpoter.sendMail(mailoption,(err,value)=>{
            if(value){
                console.log("mail send successfully")
            }
            else{
                console.log("mail not send successfully");
            }
        })
    }
module.exports = {verifemail,sendResetEmail,addnewuser};