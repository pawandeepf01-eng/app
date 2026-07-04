const Review = require("../models/Review");
const Booking = require("../models/Booking");
const User = require("../models/User");

const addReview = async (req, res) => {
  try {

    const { bookingId } = req.params;

    const { rating, review } = req.body;

    if (req.user.role !== "customer") {
      return res.status(403).json({
        success:false,
        message:"Only customers can review."
      });
    }

    const booking = await Booking.findById(bookingId);

    if(!booking){
      return res.status(404).json({
        success:false,
        message:"Booking not found"
      });
    }

    if(booking.customerId.toString() !== req.user.id){
      return res.status(403).json({
        success:false,
        message:"Unauthorized"
      });
    }

    if(booking.status !== "Accepted" && booking.status !== "Completed"){
      return res.status(400).json({
        success:false,
        message:"Cannot review before booking is accepted."
      });
    }

    const alreadyReviewed = await Review.findOne({
      bookingId
    });

    if(alreadyReviewed){
      return res.status(400).json({
        success:false,
        message:"Review already submitted."
      });
    }

    await Review.create({
      customerId:req.user.id,
      workerId:booking.workerId,
      bookingId,
      rating,
      review,
    });

    const reviews = await Review.find({
      workerId:booking.workerId
    });

    const totalReviews = reviews.length;

    const averageRating =
      reviews.reduce((sum,item)=>sum+item.rating,0) / totalReviews;

    await User.findByIdAndUpdate(
      booking.workerId,
      {
        averageRating:averageRating.toFixed(1),
        totalReviews,
      }
    );

    res.status(201).json({
      success:true,
      message:"Review submitted successfully"
    });

  } catch (error) {

    res.status(500).json({
      success:false,
      message:error.message
    });

  }
};

module.exports={addReview};