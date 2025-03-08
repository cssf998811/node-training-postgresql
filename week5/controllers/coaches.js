const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')
const logger = require('../utils/logger')('CoachesController')
const { isNotValidInteger, isNotValidString } = require('../utils/validUtils')

const coachesController = {
  async getCoachList (req, res, next)  {
    const per = parseInt(req.query.per) || 10;  // 預設值為 10
    const page = parseInt(req.query.page) || 1; // 預設值為 1
  
    if (isNotValidInteger(per) || isNotValidInteger(page)) {
      return next(appError(400, '欄位未填寫正確'))
    }
  
    // 使用 skip() 和 take() 來實現分頁功能，skip() 用於設定起始點，而 take() 用於設定每頁的筆數。
    const coaches = await dataSource.getRepository("Coach").find({
      select: {
        id: true, // Coach 的 id
        user: {
          name: true, // User 的 name
        },
      },
      relations: {
        user: true, // 確保關聯的 `User` 資料一起載入
      },
      skip: (page - 1) * per, // 跳過前 (page-1)*per 筆資料
      take: per, // 限制回傳筆數
    });
  
    const formattedCoaches = coaches.map(coach => ({
      id: coach.id,
      name: coach.user?.name // 防止 user 為 null
    }));
  
    res.status(200).json({
      status: "success",
      data: formattedCoaches,
    });
  },

  async getCoachProfile (req, res, next)  {
    const { coachId } = req.params;

    if (isNotValidString(coachId)) {
      return next(appError(400, '欄位未填寫正確'))
    }
  
    const coachRepository = dataSource.getRepository("Coach");
    const existingCoach = await coachRepository.findOne({
      select: [
        "id",
        "user_id",
        "experience_years",
        "description",
        "profile_image_url",
        "created_at",
        "updated_at",
      ],
      where: { id: coachId },
    });
  
    if (!existingCoach) {
      logger.warn("找不到該教練");
      return next(appError(400, '找不到該教練'))
    }
  
    const userRepository = dataSource.getRepository("User");
    const userData = await userRepository.findOne({
      select: ["name", "role"],
      where: { id: existingCoach.user_id },
    });
  
    res.status(200).json({
      status: "success",
      data: {
        user: userData,
        coach: existingCoach,
      },
    });
  }
}

module.exports = coachesController