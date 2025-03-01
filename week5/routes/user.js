const express = require('express')
const bcrypt = require('bcrypt')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Users')
const {isUndefined, isNotValidString, isValidPassword} = require('../utils/validUtils')
const appError = require('../utils/appError')
const { generateJWT } = require('../utils/jwtUtils')
const config = require('../config/index')
config.get('secret.jwtSecret')
const isAuth = require('../middleware/isAuth')
const handleErrorAsync = require('../utils/handleErrorAsync')
const saltRounds = 10

// 新增使用者
router.post('/signup', handleErrorAsync(async (req, res, next) => {
  const { name, email, password } = req.body
  // 驗證必填欄位
  if (isUndefined(name) || isNotValidString(name) || isUndefined(email) || isNotValidString(email) || isUndefined(password) || isNotValidString(password)) {
    logger.warn('欄位未填寫正確')
    return next(appError(400, '欄位未填寫正確'))
  }
  if (!isValidPassword(password)) {
    logger.warn('建立使用者錯誤: 密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
    return next(appError(400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'))
  }
  const userRepository = dataSource.getRepository('User')
  // 檢查 email 是否已存在
  const existingUser = await userRepository.findOne({
    where: { email }
  })

  if (existingUser) {
    logger.warn('建立使用者錯誤: Email 已被使用')
    return next(appError(409, 'Email 已被使用'))
  }

  // 建立新使用者
  const hashPassword = await bcrypt.hash(password, saltRounds)
  const newUser = userRepository.create({
    name,
    email,
    role: 'USER',
    password: hashPassword
  })

  const savedUser = await userRepository.save(newUser)
  logger.info('新建立的使用者ID:', savedUser.id)

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        id: savedUser.id,
        name: savedUser.name
      }
    }
  })
}))

router.post('/login', handleErrorAsync(async (req, res, next) => {
  const { email, password } = req.body
  if (isNotValidString(email) || isNotValidString(password)) {
    next(appError(400, '欄位未填寫正確'))
    return
  }
  if(!isValidPassword(password)) {
    next(appError(400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'))
    return
  }

  const userRepo = dataSource.getRepository('User')
  const findUser = await userRepo.findOne({
    select: ['id', 'name', 'password'],
    where: { email }
  })
  // 使用者不存在或密碼輸入錯誤
  if(!findUser) {
    next(appError(400, '使用者不存在或密碼輸入錯誤'))
    return
  }

  const isPasswordValid = await bcrypt.compare(password, findUser.password)
  if(!isPasswordValid) {
    next(appError(400, '使用者不存在或密碼輸入錯誤'))
    return
  }

  // TODO JWT
  // 產生 token
  const token = generateJWT({
    id: findUser.id,
    role: findUser.role
  })


  res.status(201).json({
    status: 'success',
    data: {
      token,
      user: {
        name: findUser.name
      }
    } 
  })
}))

router.get('/profile', isAuth, handleErrorAsync(async (req, res, next) => {
  const { id } = req.user
    if (isNotValidString(id)) {
      return next(appError(400, '欄位未填寫正確'))
    }
    const findUser = await dataSource.getRepository('User').findOneBy({ id })

    res.status(200).json({
      status: 'success',
      data: {
        email: findUser.email,
        name: findUser.name
      }
    })
}))

  router.put('/profile', isAuth, handleErrorAsync(async (req, res, next) => {
    const { id } = req.user
    const { name } = req.body
    if (isNotValidString(name)) {
      return next(appError(400, '欄位未填寫正確'))
    }

    const userRepo = dataSource.getRepository('User')
    // 檢查使用者名稱未變更
    const findUser = await userRepo.findOneBy({ id })
    if (findUser.name === name) {
      return next(appError(400, '使用者名稱未變更'))
    }
    
    const updateUser = await userRepo.update({
      id
    }, {
      name
    })

    if (updateUser.affected === 0) {
      return next(appError(400, '更新使用者失敗'))
    }
    
    res.status(200).json({
      status: 'success',
    })
  }))

module.exports = router