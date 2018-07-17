var express = require("express")
var router = express.Router();
var Campground  = require("../models/campground");
var middleware = require("../middleware")
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
    cloud_name: 'brianhsux', 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get("/", function(req, res) {
    // find the camgrounds from DB
    Campground.find({}, function(err, campgrounds) {
        if (err) {
            console.log("Something wrong when get campgrounds from DB");
            console.log(err);
        } else {
            console.log("Get campgrounds data Success");
            console.log(campgrounds);
            res.render("campgrounds/index", {campgrounds: campgrounds});
        }
    });
});

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        console.log("=====Uploader=====");
        console.log(result);
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        // add author to campground
        req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
        }
        
        Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
        });
    });
});

router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
    //find the campground with provided ID
    var id = req.params.id;
    Campground.findById(id).populate("comments").exec(function(err, foundCampground) {
        if (err) {
            console.log("Found mission fail!");
            console.log(err);
        } else {
            console.log("Found mission success");
            console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnerShip, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/edit", {campground: campground});
        }
    })
});

// UPDATE ROUTE
router.put("/:id", middleware.checkCampgroundOwnerShip, function(req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, newCampground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DELETE ROUTE
router.delete("/:id", middleware.checkCampgroundOwnerShip, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            campground.remove();
            req.flash("success", "Campground deleted");
            res.redirect("/campgrounds");
        }
    })
});

module.exports = router; 