const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Users')
const config = require('../config/index')
config.get('secret.jwtSecret')
const isAuth = require('../middleware/isAuth')
const handleErrorAsync = require('../utils/handleErrorAsync')
const userController = require('../controllers/user')

// 新增使用者
router.post('/signup', handleErrorAsync(userController.postUserSignup))

router.post('/login', handleErrorAsync(userController.postUserLogin))

router.get('/profile', isAuth, handleErrorAsync(userController.getUserProfile))

router.put('/profile', isAuth, handleErrorAsync(userController.putUserProfile))

module.exports = router