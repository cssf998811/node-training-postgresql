const express = require('express')

const router = express.Router()
const logger = require('../utils/logger')('CreditPackage')
const handleErrorAsync = require('../utils/handleErrorAsync')
const creditPackageController = require('../controllers/creditPackage')

router.get('/', handleErrorAsync(creditPackageController.getCreditPackageList))

router.post('/', handleErrorAsync(creditPackageController.postNewCreditPackage))

router.delete('/:creditPackageId', handleErrorAsync(creditPackageController.deleteCreditPackage))

module.exports = router