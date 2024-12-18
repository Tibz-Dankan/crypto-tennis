const express = require("express");
const router = express.Router();

const getActiveStatus = async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "App is active",
  });
};

router.get("/active", getActiveStatus);

module.exports = router;
