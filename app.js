const express = require('express') ;
const { default: mongoose } = require('mongoose');
const nodemailer = require('nodemailer') ;


const app = express() ;

app.use(express.json()) ;
app.use(express.urlencoded()) ;

app.set('view engine' , 'hbs') ;
app.set('./view' , 'view') ;
require("dotenv").config() ;

const User = require("./models/User") ;

// nodemailer setup
let transporter = nodemailer.createTransport({
    service:"gmail.com",
    host:"smtp.gmail.com",
    secure:true ,
    auth:{
        user:"singlarivanshu@gmail.com",
        pass:process.env.MAIL_PASS,
    }
});



// register page
app.get('/' , (req,res)=>{
    res.render('register') ;
});

app.post('/register' , async(req,res)=>{

    try{

            let {email , password} = req.body ;
        
            // firstly check if the user is already present or not
            let tempUser = await User.findOne({email}) ;
        
            if(tempUser){
                res.send("User already present") ;
                return ;
            };
        
        
            let otp = Math.floor( Math.random() * 10000 ) ; 
            if(otp < 1000){
                otp = otp + 1000;
            }
        
            let user = new User({
                email:email,
                password:password,
                otp:otp,
                verified:false,
            });
        
            await user.save() ;

        
            let mail = {
                to:`${email}`,
                from:"singlarivanshu@gmail.com",
                subject:"Verify OTP",
               
                
                html:`<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                </head>
                <body>
                    
                    <div class="template">
                        <div>
                        <h1 style="font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
                        text-align:center;">OTP Verification Email 😊</h1>
                        </div>

                    <div>
                        <p style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Dear User, <br>
                        Thankyou for registering with us. To complete your registration, please use the following 
                            OTP(One-Time-Password) to verify your account:
                        </p>
                        </div>
                
                        <div style="background-color: lightcyan;height: fit-content; width: 200px;
                        padding: 5px 10px;text-align: center;box-sizing:border-box;">
                        <h1 style="font-size:40px;font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
                        text-align:center;margin:5px">${otp}</h1>
                        </div>
                
                        
                        <p style="color: gray;font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">If you have any questions or need assistance, please feel free to reach out to us at
                            singlarivanshu@gmail.com. We are are here to help!
                        </p>
                    
                
                    </div>
                
                </body>
                </html>`
            };
        
            await transporter.sendMail(mail) ;
            
            res.render('verify' , {email}) ;
    }
    catch(err){
        return res.status(400).json({
            success:false ,
            message:"Error in registering the account",
        })
    }

});


// verify page
app.get('/verify' , (req,res)=>{
    res.render('verify');
});

app.post('/verify/:email' , async(req,res)=>{

    try{
        const {otp} = req.body ;
        const {email} = req.params ;

        const user = await User.findOne({email}) ;


        // check if account is present or not
        if(!user){
            res.send("Account not registered") ;
            return ;
        } ;


        // check if account is already verified
        if(user.verified == true){
            res.send("User already verified") ;
            return ;
        } ;

        // now , check if the OTP is matching or not 
        if(otp != user.otp){
            res.send("Invalid OTP") ;
            return ;
        };

        await User.findOneAndUpdate({email} , {verified:true}) ;

        let mail = {
            to:`${email}`,
            from:"singlarivanshu@gmail.com",
            subject:"Verification Successful",
            
            html:`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                
                <div class="template" style="display:flex; align-items: center;
                flex-direction: column;">
        
                    <div>
                    <h2 style="font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif">
                    ✅ Thank you for your support. We have successfully verified your email address... ✅  </h2>
                    </div>
                </div>
            
            </body>
            </html>`,
        };

        await transporter.sendMail(mail) ;

        res.send("Account Verified") ;
    }
    catch(err){
        return res.status(400).json({
            success:false,
            message:"Error in Verifying the account",
        })
    }

})



// server and database connection

mongoose.connect("mongodb://127.0.0.1/afs_st1_database")
.then(()=>{console.log("DB connected Successfully")})
.catch((err)=>{
    console.log("DB connection issues") ;
    process.exit(1) ;
});

app.listen(3000 , ()=>{
    console.log("http://localhost:3000");
});
