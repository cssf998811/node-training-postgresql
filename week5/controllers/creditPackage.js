const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')
const logger = require('../utils/logger')('CreditPackageController')
const { isUndefined, isNotValidString, isNotValidInteger } = require('../utils/validUtils')

const creditPackageController = {
  async getCreditPackageList (req, res, next)  {
    const creditPackage = await dataSource.getRepository('CreditPackage').find({
        select: ['id', 'name', 'credit_amount', 'price']
      })
      res.status(200).json({
        status: 'success',
        data: creditPackage
      })
  },

  async postNewCreditPackage (req, res, next)  {
    const { name, credit_amount: creditAmount, price } = req.body
    if (isUndefined(name) || isNotValidString(name) ||
      isUndefined(creditAmount) || isNotValidInteger(creditAmount) ||
            isUndefined(price) || isNotValidInteger(price)) {
      return next(appError(400, '欄位未填寫正確'))
    }
    const creditPurchaseRepo = await dataSource.getRepository('CreditPackage')
    const existCreditPurchase = await creditPurchaseRepo.find({
      where: {
        name
      }
    })
    if (existCreditPurchase.length > 0) {
      return next(appError(409, '資料重複'))
    }
    const newCreditPurchase = await creditPurchaseRepo.create({
      name,
      credit_amount: creditAmount,
      price
    })
    const result = await creditPurchaseRepo.save(newCreditPurchase)
    res.status(200).json({
      status: 'success',
      data: result
    })
  },

  async deleteCreditPackage (req, res, next)  {
    const { creditPackageId } = req.params
    if (isUndefined(creditPackageId) || isNotValidString(creditPackageId)) {
      return next(appError(400, '欄位未填寫正確'))
    }
    const result = await dataSource.getRepository('CreditPackage').delete(creditPackageId)
    if (result.affected === 0) {
      return next(appError(400, 'ID錯誤'))
    }
    res.status(200).json({
      status: 'success'
    })
  }

}

module.exports = creditPackageController