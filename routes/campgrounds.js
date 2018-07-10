var express = require("express")
var router = express.Router();
var Campground  = require("../models/campground");
var middleware = require("../middleware")

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

router.post("/", middleware.isLoggedIn, function(req, res) {
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    
    var newCampground = {name: name, price: price, image: image, description: description, author: author};
    // campgrounds.push(newCampground);
    
    console.log(newCampground);
    
    Campground.create(newCampground, function(err, campground) {
        if (err) {
            req.flash("error", "Something went wrong");
            console.log(err);
        } else {
            console.log("Create campground successful, congrats!!!");
            req.flash("success", "Successfully added Campground");
            console.log(campground);
        }
    });
    
    res.redirect("/campgrounds");
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