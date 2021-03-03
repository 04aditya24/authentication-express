const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose =require("mongoose");
const session = require('express-session')
const app=express()
const bcrypt = require('bcrypt');
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
const saltRounds = 10;
const path=require('path');
app.use(express.static(__dirname+'/public'));
 app.set('views', path.join(__dirname, 'views'));

 app.use(session({
   secret:"Our little secret.",
   resave:false,
   saveUninitialized:false
 }))

 mongoose.connect("mongodb+srv://admin-aditya:aditya1234@authantication.qxewx.mongodb.net/Authantication", {useNewUrlParser: true,useUnifiedTopology: true });

 mongoose.connection.once('open',function(){
   console.log("connction has been made");
 }).on('error',function(error){
   console.log('connection error',error);
 })
 mongoose.set("useCreateIndex",true)

 const userSchema=new mongoose.Schema({
   email:String,
   password:String,
   name:String
 });


 //userSchema.plugin(encrypt,{secret:process.env.SECRET , encryptedFields:["password"] })
 const User=new mongoose.model("User",userSchema);


app.get("/",function(req,res){
res.render("signup");
});
app.get("/Logout",function(req,res){
  req.session.destroy(function(err) {
  res.redirect('/login');
});
});
app.get("/login",function(req,res){
res.render("login");
});
app.get("/welcome",function(req,res){
    email = req.session.email_of_loggedin_user;
    User.findOne({email: email},function(err, foundforgot){
    if(err){
      console.log(err);
    }else{
      if(foundforgot){
          console.log(foundforgot.name);
       }
      else{
        console.log("not found");
      }
    }
  res.render("welcome",{name: foundforgot})
});
});
// SignIn Post Mehod
app.post("/",function(req,res){
    bcrypt.hash(req.body.pass,saltRounds,function(err,hash){
  const newUser=new User({
         name:req.body.name,
          email:req.body.email,
          password:hash,

});

    newUser.save(function(err){
      if(err){
        console.log(err);
      }else{
      res.send(true);
      }
    });
  });
});

app.post("/login",function(req,res){
  const email=req.body.email;
  console.log("email",email);
  const password=req.body.password;
  console.log(password);
  User.findOne({email:email},function(err,foundUser){
    console.log(foundUser);
    if(err){
      console.log(err);
    }
    else{

      if(foundUser){

        bcrypt.compare(password,foundUser.password,function(err,result){
console.log(result);
    if(result === true){
         req.session.email_of_loggedin_user = email;
            console.log("user login");
                 res.send({foundUser:true});
                   }
                   else{
             console.log("not login");
               res.send({foundUser:false});
          }
        })



        }

      }

  });
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,function(){
                    console.log("Server started on Port 3000");
});
