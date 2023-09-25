const Admin = require("./../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendResetEmail = require("../middleware/verifyemail");
const randomstring = require("randomstring");
const User = require("./../models/userModel");
const securepassword = require("./userController");
const exceljs = require('exceljs');
const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const { response } = require("express");
const loadlogin = async (req, res) => {
  try {
    res.render("./../views/admin/loginview.ejs");
  } catch (error) {
    console.log(error);
  }
};
const verifiylogin = async (req, res) => {
  try {
    const admindata = await Admin.findOne({ email: req.body.email });
    console.log(admindata);
    if (!admindata) {
      console.log("invaild email or password");
    }
    const ispassword = await bcrypt.compare(
      req.body.password,
      admindata.password
    );
    console.log(ispassword);
    if (!ispassword) {
      console.log("email or password is incorrect");
      res.redirect("/admin");
    }
    if (admindata.isadmin === 0) {
      console.log("you are not admin");
      res.redirect("/admin");
    }
    req.session.admin_id = admindata._id;
    return res.redirect("/admin/home");
  } catch (error) {
    console.log(error);
  }
};
const adminhome = async (req, res) => {
  const admindata = await Admin.findById({ _id: req.session.admin_id });
  res.render("./../views/admin/home.ejs", { admin: admindata });
};
const logout = async (req, res) => {
  const logout = await req.session.destroy();
  console.log(logout);
  res.redirect("/admin/");
};
const forgetload = async (req, res) => {
  res.render("./../views/forget.ejs");
};
const sendforgetpasswordlink = async (req, res) => {
  const checkemail = await Admin.findOne({ email: req.body.email });
  if (!checkemail) {
    res.status(404).json({
      status: "fail",
      checkemail,
    });
  }
  const rndstring = randomstring.generate();
  const updatedtoken = await Admin.findByIdAndUpdate(
    { _id: checkemail._id },
    { $set: { randomstring: rndstring } }
  );
  sendResetEmail.sendResetEmail(checkemail.name, checkemail.email, rndstring);
};
const admindashboard = async (req, res) => {
  try {
    const users = await User.find();
    res.render("./../views/admin/dashboard.ejs", { users: users });
  } catch (error) {
    console.log(error);
  }
};
const loadnewuser = async (req, res) => {
  res.render("./../views/admin/new-user.ejs");
};
const addnewuser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mno;
    const password = randomstring.generate();
    const user = await new User({
      name: name,
      email: email,
      PhoneNumber: mobile,
      password: securepassword.sercurepassword(req.body.password),
      image: req.file.filename,
      isadmin: 0,
    });
    user.save().then((user) => {
      if (user) {
        const verifymail = sendResetEmail.addnewuser(
          user.name,
          user.email,
          user._id,
          user.password
        );
        res.redirect("http://13.233.72.26:3000/admin/dashboard");
        console.log("user add successfully");
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};
const editpageload = async (req, res) => {
  const id = req.query.id;
  const userdata = await User.findById({ _id: id });

  res.render("./../views/admin/edituser.ejs", { user: userdata });
};
const edituser = async (req, res) => {
  const user_id = req.body.id;
  console.log(user_id)
  const user = await User.findById({ _id: user_id });

  if (!user) {
    console.log("user not found");
  }
  const updated = await User.findByIdAndUpdate(
    { _id: user_id },
    {
      $set: {
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.mno,
        isverified: req.body.verified,
      },
    }
  );
};
const deleteuser = async (req,res)=>{
    const userid = req.query.id;
    const isdeleted = await User.findByIdAndDelete({_id:userid});
    if(!isdeleted) {console.log("user deleted successfully");
    res.redirect('/admin/dashboard');}
    res.redirect('/admin/dashboard');
}
const  exportuser = async (req,res)=>{
try {
    let counter =1;
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet("my users");
    worksheet.columns=[
        {header:"S.no",key:"s_no"},
        {header:"name",key:"name"},
        {header:"email",key:"email"},
        {header:"phoneNumber",key:"PhoneNumber"},
        {header:"isadmin",key:"isadmin"},
        {header:"isverified",key:"isverified"}
    ]
    const users= await User.find({isadmin:0});
    users.forEach(user=>{
        user.s_no=counter;
        worksheet.addRow(user);
        counter++;
    })
    worksheet.getRow(1).eachCell(cell=>{
        cell.font={bold:true}
    });
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheatml.sheet')
    res.setHeader('Content-Disposition',`attachment;filename=users.xlsx`)
    return workbook.xlsx.write(res).then(()=>{
        res.status(200);
    })
} catch (error) {
    console.log(error.message);
}
}
const exportuserpdf = async (req,res)=>{
const users = await User.find();
const data = {
  users:users
}
const filepathname = path.resolve(__dirname,'../views/admin/pdf.ejs');
const htmlstring = fs.readFileSync(filepathname).toString();
const options={
  format:"letter"
}
const ejsdata = ejs.render(htmlstring,data);
pdf.create(ejsdata,options).toFile('users.pdf',(err,response)=>{
  if(err)console.log(err.message);
  console.log("pdf genrated");
 })
 const pathname = path.resolve(__dirname,'../users.pdf');
 fs.readFile(pathname,(err,file)=>{
  if(err){
    console.log(err.message);
  }
  res.setHeader('Content-Type','application/pdf');
 res.setHeader('Content-Disposition','attachment;filename="users.pdf"');
 res.send(file);
 });
 
}
module.exports = {
  loadlogin,
  verifiylogin,
  admindashboard,
  logout,
  forgetload,
  sendforgetpasswordlink,
  adminhome,
  loadnewuser,
  addnewuser,
  editpageload,
  edituser,
  deleteuser,
  exportuser,
  exportuserpdf
};
