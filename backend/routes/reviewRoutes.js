const express=require("express");

const router=express.Router();

const authMiddleware=require("../middleware/authMiddleware");

const {addReview}=require("../controllers/reviewController");

router.post(
"/:bookingId",
authMiddleware,
addReview
);

module.exports=router;