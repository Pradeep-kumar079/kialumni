const express = require("express");
const router = express.Router();
const {
  sendRequestController,
  acceptRequestController,
  rejectRequestController,
  disconnectController,
  GetAlumniBatchController,
  resendRequestController,
} = require("../Controllers/alumniController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/send-request", authMiddleware, sendRequestController);
router.get("/accept-request/:token", acceptRequestController);
router.get("/reject-request/:token", rejectRequestController);
router.post("/disconnect", authMiddleware, disconnectController);
router.get("/all-alumni", authMiddleware, GetAlumniBatchController);
router.post("/resend-request", authMiddleware, resendRequestController);

module.exports = router;
