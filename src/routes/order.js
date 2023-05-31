/* 3rd Party Modules */
const express = require("express");
const router = express.Router();

/* Unpack Modules */
const { addOrder } = require("../controllers/orderController");

// Implement the user routes:
router.post("/add-order", addOrder);
module.exports = router;