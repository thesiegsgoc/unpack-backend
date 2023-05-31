/* 3rd Party Modules */
const express = require("express");
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const { isUserAuth } = require('../auth/isAuth');

/* Unpack Modules */
const { registerUser, loginUser, uploadProfilePicture } = require("../controllers/userController");

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
router.post("/upload-profile", uploads.single('profile'), uploadProfilePicture)

module.exports = router;