const router = require("express").Router();

const auth = require("../middleware/authMiddleware");

const {
    saveToken
} = require("../controllers/notificationController");

router.post("/save-token",auth,saveToken);

module.exports = router;