const express = require("express");

const router = express.Router();
const { dataSource } = require("../db/data-source");
const Coach = require("../entities/Coach");
const logger = require("../utils/logger")("Coaches");
const { isNotValidInteger, isNotValidString } = require("../utils/validUtils");

router.get("/", async (req, res, next) => {
  try {
    const per = parseInt(req.query.per) || 10;  // 預設值為 10
    const page = parseInt(req.query.page) || 1; // 預設值為 1

    if (isNotValidInteger(per) || isNotValidInteger(page)) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
      return;
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

    // 另一種使用 QueryBuilder 抓 id , users.name的寫法(Gen by GPT4o)
    // const coaches = await dataSource
    // .getRepository('Coach')
    // .createQueryBuilder('coach')
    // .innerJoinAndSelect('User', 'user', 'coach.user_id = user.id')
    // .select([
    //   'coach.id AS id',
    //   'user.name AS name'
    // ])
    // .skip((parseInt(page) - 1) * parseInt(per)) // 計算起始筆數，假設 per = 10 且 page = 2，則 skip(10), 會跳過前 10 筆資料，從第 11 筆開始取。
    // .take(parseInt(per)) // 限制回傳筆數
    // .getRawMany();

    res.status(200).json({
      status: "success",
      data: formattedCoaches,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

router.get("/:coachId", async (req, res, next) => {
  try {
    const { coachId } = req.params;

    if (isNotValidString(coachId)) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
      return;
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
      return res.status(400).json({
        status: "failed",
        message: "找不到該教練",
      });
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
  } catch (error) {
    logger.error(error);
    next(error);
  }
});
module.exports = router;
