const express = require('express')

const router = express.Router()
const logger = require('../utils/logger')('Admin')
const isAuth = require('../middleware/isAuth')
const isCoach = require('../middleware/isCoach')
const handleErrorAsync = require('../utils/handleErrorAsync')
const adminController = require('../controllers/admin')

router.post('/coaches/courses', isAuth, isCoach, handleErrorAsync(adminController.postCoachCourse))

router.put('/coaches/courses/:courseId', isAuth, isCoach, handleErrorAsync(adminController.putCoachCourse))

router.post('/coaches/:userId', handleErrorAsync(adminController.putCoachRole))

module.exports = router