const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// Server-side AI Proxies (Never exposes API keys to client)
router.post("/chat", aiController.chat);
router.post("/vision-ocr", aiController.visionOCR);

module.exports = router;
