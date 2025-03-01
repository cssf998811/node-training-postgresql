const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')

const logger = require('../utils/logger')('Skill')
const {isUndefined, isNotValidString} = require('../utils/validUtils')
const appError = require('../utils/appError')
const handleErrorAsync = require('../utils/handleErrorAsync')

router.get('/', handleErrorAsync(async (req, res, next) => {
  const skill = await dataSource.getRepository('Skill').find({
    select: ['id', 'name']
  })
  res.status(200).json({
    status: 'success',
    data: skill
  })
}))

router.post('/', handleErrorAsync(async (req, res, next) => {
  const { name } = req.body
  if (isUndefined(name) || isNotValidString(name)) {
    return next(appError(400, '欄位未填寫正確'))
  }
  const skillRepo = await dataSource.getRepository('Skill')
  const existSkill = await skillRepo.find({
    where: {
      name
    }
  })
  if (existSkill.length > 0) {
    return next(appError(409, '資料重複'))
  }
  const newSkill = await skillRepo.create({
    name
  })
  const result = await skillRepo.save(newSkill)
  res.status(200).json({
    status: 'success',
    data: result
  })
}))

router.delete('/:skillId', handleErrorAsync(async (req, res, next) => {
  const skillId = req.params
  if (isUndefined(skillId) || isNotValidString(skillId)) {
    return next(appError(400, 'ID錯誤'))
  }
  const result = await dataSource.getRepository('Skill').delete(skillId)
  if (result.affected === 0) {
    return next(appError(400, 'ID錯誤'))
  }
  res.status(200).json({
    status: 'success',
    data: result
  })
  res.end()
}))

module.exports = router