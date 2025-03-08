const express = require('express')
const router = express.Router()
const logger = require('../utils/logger')('Skill')
const handleErrorAsync = require('../utils/handleErrorAsync')
const skillController = require('../controllers/skill')

router.get('/', handleErrorAsync(skillController.getSkillList))

router.post('/', handleErrorAsync(skillController.postNewSkill))

router.delete('/:skillId', handleErrorAsync(skillController.deleteSkill))

module.exports = router