const express = require("express"),
      app     = express(),
      LocalStrategy = require("passport-local"),
      User = require("./models/user.js"),
      mongoose = require("mongoose"),
      session = require("express-session"),
      passport = require("passport");

//=========
//MIDDLEWARE
//=========

//Session
app.use(session({
    secret: "ThisIsASecret",
    resave: false,
    saveUninitialized: false
}));

//Passport

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




//Mongoose middleware
mongoose.connect("mongodb://localhost:27017/passport", {useNewUrlParser: true});

//EJS
app.set("view engine", "ejs");

//Body Parser
app.use(express.urlencoded({extended:false}));

//Login required middleware


//=========
//ROUTES
//=========

app.get("/",(req,res) => res.render("home"));

app.get("/register", (req,res) => res.render("register"));

app.post("/register", (req,res) => {
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err) {
            console.log(err);
            return res.render("register");
        }

        passport.authenticate('local')(req,res,function(){
            res.redirect("/dashboard");
        })

    })
})


app.get("/login", (req,res) => {
    res.render("login");
})

app.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/register"
}), (req,res) => {
});

app.get("/dashboard",isLoggedIn, (req,res) => {
    res.render("dashboard")
})

app.get("/logout", (req,res) => {
    req.logout();
    res.redirect("/");
})

function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

//Server
app.listen(3000, () => console.log("Server is listening"));

