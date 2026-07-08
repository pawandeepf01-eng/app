const User = require("../models/User");

const saveToken = async (req, res) => {
    try {

        const { fcmToken } = req.body;

        await User.findByIdAndUpdate(
            req.user.id,
            {
                fcmToken
            }
        );

        res.json({
            success:true,
            message:"Token Saved"
        });

    } catch(err){
        res.status(500).json({
            success:false,
            message:err.message
        });
    }
}

module.exports = { saveToken };