const express=require("express");

const router=express.Router();

const authMiddleware=require("../middleware/authMiddleware");

const {addReview}=require("../controllers/reviewController");

router.post(
  "/:workerId",
  authMiddleware,
  addReview
);

module.exports=router;