if (process.env.NODE_ENV !== 'production') require('dotenv').config()

var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    flash       = require("connect-flash"),
    LocalStrategy = require("passport-local"),
    Campground  = require("./models/campground"),
    User        = require("./models/user"),
    Comment     = require("./models/comment"),
    methodOverride = require("method-override"),
    seedDB      = require("./seeds")

// requiring routes
var commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");

var databaseUrl = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v12";
mongoose.connect(databaseUrl);
// mongoose.connect("mongodb://localhost/yelp_camp_v11_1");
// mongoose.connect("mongodb://brianhsux:yelp1007@ds233531.mlab.com:33531/yelpcampcamp");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");;
   next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("YelpCamp Server Started!!");
});