const express = require('express');
const route = express.Router();
const path = require('path');
const admincontroller = require('./../controller/admincontroller.js');
const adminauth = require('./../middleware/adminauth.js');
const { islogin } = require('../middleware/auth.js');
const multer = require('multer');
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'/../public/userImage'));
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+''+file.originalname);
    }
})
const upload = multer({storage:storage});

route.get('/',adminauth.islogout, admincontroller.loadlogin);
route.post('/adminlogin',adminauth.islogout,admincontroller.verifiylogin);
route.get('/home',adminauth.islogin,admincontroller.adminhome);
route.get('/logout',adminauth.islogin,admincontroller.logout);
route.get('/forget',adminauth.islogout,admincontroller.forgetload);
route.post('/forget',adminauth.islogout,admincontroller.sendforgetpasswordlink)
route.get('/dashboard',adminauth.islogin,admincontroller.admindashboard)
route.get('/newuser',adminauth.islogin,admincontroller.loadnewuser);
route.post('/addnewuser',adminauth.islogin,upload.single('image'), admincontroller.addnewuser);
route.get('/edit',adminauth.islogin,admincontroller.editpageload);
route.post('/edituser',adminauth.islogin,admincontroller.edituser)
route.get('/delete',adminauth.islogin,admincontroller.deleteuser)
route.get('/exportuser',adminauth.islogin,admincontroller.exportuser);
route.get('/pdf',adminauth.islogin,admincontroller.exportuserpdf)
route.all('*',(req,res)=>{ res.redirect('/admin');})
module.exports ={
    route
}