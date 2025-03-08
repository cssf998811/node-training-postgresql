const express = require("express");

const router = express.Router();
const logger = require("../utils/logger")("Coaches");
const handleErrorAsync = require("../utils/handleErrorAsync");
const coachesController = require("../controllers/coaches");

router.get("/", handleErrorAsync(coachesController.getCoachList))

router.get("/:coachId", handleErrorAsync(coachesController.getCoachProfile))

module.exports = router;
