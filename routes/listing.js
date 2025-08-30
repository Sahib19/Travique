const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");

//things realted to images :)
const multer  = require('multer');
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage})


//requiring the middle to check user doing somehting is authenticated ot not
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

//requiring the differeny controllers
const listingController = require("../Controllers/listing.js");


//show route
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(validateListing,
        isLoggedIn,
        upload.single("image"),
        wrapAsync(listingController.createNewListing))


//render form to create the new route
router.get("/new", isLoggedIn, listingController.renderNewForm)

router.route("/:id")
    .get(wrapAsync(listingController.showRoute))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing))

//Rendering the form to edit the existing listing
router.get("/edit/:id", isLoggedIn, isOwner, wrapAsync(listingController.editForm))

//changing the update in the database
router.put("/update/:id", isOwner, wrapAsync((listingController.updateListingInDb)));

module.exports = router;