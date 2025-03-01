if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express= require("express");
const app= express();
const mongoose=require("mongoose");
const path= require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash= require("connect-flash");
const methodOverride = require("method-override");

const ExpressError = require("./utils/ExpressError.js");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const ejsMate = require("ejs-mate");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter= require("./routes/reviews.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.DB_URL;

main().then(()=>{
    console.log("connecting successfully");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// const sessionOptions = {
//     secret: "mysupersecrectcode",
//     resave: false,
//     saveUnintialized: true,
// };

// app.use(session(sessionOptions));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", function(e){
    console.log("Session Store Error", e);
});

app.use(session({
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    //expires: Date.now() + 7 * 24* 60*60*1000,
    maxAge:7 * 24* 60*60*1000,
    httpOnly:true,
  },
}));


app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
 

// app.get("/", (req,res)=>{
//   res.send("Iam ready");
// });

// app.get("/demouser", async(req, res)=>{
//   let fakeUser = new User({email:"student@gmail.com",
//   username:"student"});
//  let registeredUser= await User.register(fakeUser,"student");
//  res.send(registeredUser);
// });


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// app.get("/testListing", wrapAsync(async(req,res)=>{
//     let sampleListing = new Listing({
//         title: "My new villa",
//         desription: "By the beach",
//         price:1500,
//         location:"Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// }));

app.all("*", (req, res, next) =>{
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next)=>{
    let { statusCode=500, message="Something Went Wrong!" } = err;
    //res.status(statusCode).send(message);
    res.render("error.ejs",{message});
});

app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
});