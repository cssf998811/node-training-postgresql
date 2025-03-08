const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')
const logger = require('../utils/logger')('AdminController')
const {isUndefined, isNotValidString, isNotValidInteger, areValidDates} = require('../utils/validUtils')

const adminController = {
  async postCoachCourse (req, res, next)  {
    const {
        user_id: userId, skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
        max_participants: maxParticipants, meeting_url: meetingUrl
      } = req.body
      if (isUndefined(userId) || isNotValidString(userId) ||
        isUndefined(skillId) || isNotValidString(skillId) ||
        isUndefined(name) || isNotValidString(name) ||
        isUndefined(description) || isNotValidString(description) ||
        isUndefined(startAt) || isNotValidString(startAt) ||
        isUndefined(endAt) || isNotValidString(endAt) ||
        isUndefined(maxParticipants) || isNotValidInteger(maxParticipants) ||
        isUndefined(meetingUrl) || isNotValidString(meetingUrl) || !meetingUrl.startsWith('https') ||
        !areValidDates(startAt, endAt)) {
        logger.warn('欄位未填寫正確')
        next(appError(400, '欄位未填寫正確'))
        return
      }
    
      const userRepository = dataSource.getRepository('User')
      const existingUser = await userRepository.findOne({
        select: ['id', 'name', 'role'],
        where: { id: userId }
      })
      if (!existingUser) {
        logger.warn('使用者不存在')
        next(appError(400, '使用者不存在'))
        return
      } else if (existingUser.role !== 'COACH') {
        logger.warn('使用者尚未成為教練')
        next(appError(400, '使用者尚未成為教練'))
        return
      }
      const courseRepo = dataSource.getRepository('Course')
      const newCourse = courseRepo.create({
        user_id: userId,
        skill_id: skillId,
        name,
        description,
        start_at: startAt,
        end_at: endAt,
        max_participants: maxParticipants,
        meeting_url: meetingUrl
      })
      const savedCourse = await courseRepo.save(newCourse)
      const course = await courseRepo.findOne({
        where: { id: savedCourse.id }
      })
      res.status(201).json({
        status: 'success',
        data: {
          course
        }
      })
  },

  async putCoachCourse (req, res, next)  {
    const { courseId } = req.params
    const {
      skill_id: skillId, name, description, start_at: startAt, end_at: endAt,
      max_participants: maxParticipants, meeting_url: meetingUrl
    } = req.body
    if (isNotValidString(courseId) ||
      isUndefined(skillId) || isNotValidString(skillId) ||
      isUndefined(name) || isNotValidString(name) ||
      isUndefined(description) || isNotValidString(description) ||
      isUndefined(startAt) || isNotValidString(startAt) ||
      isUndefined(endAt) || isNotValidString(endAt) ||
      isUndefined(maxParticipants) || isNotValidInteger(maxParticipants) ||
      isUndefined(meetingUrl) || isNotValidString(meetingUrl) || !meetingUrl.startsWith('https') ||
      areValidDates(startAt, endAt)) {
      logger.warn('欄位未填寫正確')
      return next(appError(400, '欄位未填寫正確'))
    }
    const courseRepo = dataSource.getRepository('Course')
    const existingCourse = await courseRepo.findOne({
      where: { id: courseId }
    })
    if (!existingCourse) {
      logger.warn('課程不存在')
      return next(appError(400, '課程不存在'))
    }
    const updateCourse = await courseRepo.update({
      id: courseId
    }, {
      skill_id: skillId,
      name,
      description,
      start_at: startAt,
      end_at: endAt,
      max_participants: maxParticipants,
      meeting_url: meetingUrl
    })
    if (updateCourse.affected === 0) {
      logger.warn('更新課程失敗')
      return next(appError(400, '更新課程失敗'))
    }
    const savedCourse = await courseRepo.findOne({
      where: { id: courseId }
    })
    res.status(200).json({
      status: 'success',
      data: {
        course: savedCourse
      }
    })
  },

  async putCoachRole (req, res, next)  {
    const imageUrlPattern = /\.(jpg|jpeg|png)$/i;
    const { userId } = req.params
    const { experience_years: experienceYears, description, profile_image_url: profileImageUrl = null } = req.body
    if (isUndefined(experienceYears) || isNotValidInteger(experienceYears) || isUndefined(description) || isNotValidString(description)) {
      logger.warn('欄位未填寫正確')
      return next(appError(400, '欄位未填寫正確'))
    }
    if (profileImageUrl && !isNotValidString(profileImageUrl) && !profileImageUrl.startsWith('https')) {
      logger.warn('大頭貼網址錯誤')
      return next(appError(400, '欄位未填寫正確'))
    }
    if(!imageUrlPattern.test(profileImageUrl)){
      logger.warn('大頭貼格式錯誤')
      return next(appError(400, '大頭貼格式錯誤，僅接受.jpg, .jpeg, .png等格式'))
    }
    const userRepository = dataSource.getRepository('User')
    const existingUser = await userRepository.findOne({
      select: ['id', 'name', 'role'],
      where: { id: userId }
    })
    if (!existingUser) {
      logger.warn('使用者不存在')
      return next(appError(400, '使用者不存在'))
    } else if (existingUser.role === 'COACH') {
      logger.warn('使用者已經是教練')
      return next(appError(409, '使用者已經是教練'))
    }
    const coachRepo = dataSource.getRepository('Coach')
    const newCoach = coachRepo.create({
      user_id: userId,
      experience_years: experienceYears,
      description,
      profile_image_url: profileImageUrl
    })
    const updatedUser = await userRepository.update({
      id: userId,
      role: 'USER'
    }, {
      role: 'COACH'
    })
    if (updatedUser.affected === 0) {
      logger.warn('更新使用者失敗')
      return next(appError(400, '更新使用者失敗'))
    }
    const savedCoach = await coachRepo.save(newCoach)
    const savedUser = await userRepository.findOne({
      select: ['name', 'role'],
      where: { id: userId }
    })
    res.status(201).json({
      status: 'success',
      data: {
        user: savedUser,
        coach: {
          id: savedCoach.id,
          user_id: savedCoach.user_id,
          experience_years: savedCoach.experience_years,
          description: savedCoach.description,
          profile_image_url: savedCoach.profile_image_url,
          created_at: savedCoach.created_at,
          updated_at: savedCoach.updated_at
        }
      }
    })
  }

}

module.exports = adminController