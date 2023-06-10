/* 3rd Party Modules */
const express = require("express");
const router = express.Router();
const multer = require('multer');

/* Unpack Modules */
const { 
    registerUser,
    loginUser,
    updateUserInfo,
    uploadProfilePicture
} = require("../controllers/userController");

const storage = multer.diskStorage({});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb('invalid image file', false)
    }
}
const uploads = multer({ storage, fileFilter });

// Implement the user routes:
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/upload-profile", uploads.single('profile'), uploadProfilePicture);
router.put("/update", updateUserInfo);

module.exports = router;