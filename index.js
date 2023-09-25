const express = require("express");
const mongoose = require("mongoose");
const userroute = require("./routes/userroute");
const adminroute = require("./routes/adminroute");
const session = require("express-session");
const passport = require("passport");
const dotenv = require("dotenv").config({ path: ".env.production" });
const User = require("./models/userModel");
const app = express();
app.set("view engine", "ejs");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
app.use(express.static("public"));
app.use(
  session({
    secret: "Gursevaksingh",
    saveUninitialized: false,
    resave: false,
  })
);
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
const ejs = require("ejs");

//Database connectivity
mongoose
  .connect('mongodb://127.0.0.1:27017/UMS', { useNewUrlParser: true })
  .then((result) => {
    if (result) {
      console.log("database connected successfully");
    }
  });
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://13.233.72.26:3000/auth/google/callback",
    },
    (accessToken, refreshtoken, profile, done) => {
      User.findOne({ googleId: profile.id }).then((alluser) => {
        if (alluser) {
          return done(null, alluser);
        }
      });
      const user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        image: profile.photos[0].value,
        PhoneNumber: profile.PhoneNumber,
      });
      const userdata = user
        .save()
        .then(() => {
          console.log("user sign in with google successfully");
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  )
);
passport.serializeUser((user, done) => {
  return done(null, user);
});
passport.deserializeUser((user, done) => {
  return done(null, user);
});
//user routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email", "phone"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/profile",
    failureRedirect: "/signup",
  })
);
app.use("/", userroute);
app.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user;
    req.session.User_Id = user._id;
    res.redirect("/home");
  }
});
//admin routes
app.use("/admin", adminroute.route);

// <<<<<<< HEAD
// app.listen(process.env.PORT, () => {
//   console.log("server starts on port 3000");
// });
// =======
app.listen(process.env.PORT,()=>{
    console.log('server starts on port 3000');
})
// >>>>>>> dbf5bc8991f86b9e608f516de6d640dd53726dc4
