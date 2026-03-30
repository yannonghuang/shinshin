const fs = require("fs");
const db = require("../models");
const Case = db.cases;
const School = db.schools;
const Artifact = db.artifacts;
const Op = db.Sequelize.Op;

const COURSE_OPTIONS = ["语文", "数学", "乡土课程", "PBL美化校园"];
const COMMON_GRADE_OPTIONS = ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级"];
const COURSE_CATEGORY_OPTIONS = {
  语文: COMMON_GRADE_OPTIONS,
  数学: COMMON_GRADE_OPTIONS,
  PBL美化校园: ["制作装置", "美化墙面", "改造区域"],
  乡土课程: [
    "家乡美食与饮食文化",
    "非遗与传统手工艺",
    "乡土游戏与童年记忆",
    "传统节日与民俗活动",
    "家乡名人与文化传承",
    "植物探索与劳动实践",
    "乡土艺术与创意表达",
    "家乡物产与经济生活",
    "家乡地理与生态保护",
    "家乡历史与地方记忆",
    "民谣方言/家乡服饰/家乡特色建筑",
  ],
};

const getPagination = (page, size) => {
  const limit = size ? +size : 30;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: cases } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, cases, totalPages, currentPage };
};

const parseSchoolId = (schoolId) => {
  if (schoolId === undefined || schoolId === null || schoolId === "") return null;
  const n = Number(schoolId);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const parseYear = (year) => {
  if (year === undefined || year === null || year === "") return null;
  const y = Number(year);
  if (!Number.isInteger(y)) return null;
  if (y < 1900 || y > 2100) return null;
  return y;
};

const mustConfirm = (value) => value === true || value === "true" || value === "1";

const normalizeInput = (value) => (typeof value === "string" ? value.trim() : "");

const validateCourseAndCategory = (course, category) => {
  if (!COURSE_OPTIONS.includes(course)) {
    return "课程 无效。";
  }
  const categories = COURSE_CATEGORY_OPTIONS[course] || [];
  if (!categories.includes(category)) {
    return "类型 与 课程 不匹配。";
  }
  return null;
};

exports.getOptions = (req, res) => {
  return res.send({
    courses: COURSE_OPTIONS,
    categoriesByCourse: COURSE_CATEGORY_OPTIONS,
    fields: COURSE_OPTIONS,
    topicsByField: COURSE_CATEGORY_OPTIONS,
  });
};

exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { description, year, course, category, field, topic, schoolId, schoolIds } = req.body;
    if (!description) {
      await t.rollback();
      return res.status(422).send({ message: "案例描述不能为空。" });
    }
    const parsedYear = parseYear(year);
    if (!parsedYear) {
      await t.rollback();
      return res.status(422).send({ message: "年份无效，必须是 1900-2100 的整数。" });
    }

    const normalizedCourse = normalizeInput(course !== undefined ? course : field);
    const normalizedCategory = normalizeInput(category !== undefined ? category : topic);
    if (!normalizedCourse) {
      await t.rollback();
      return res.status(422).send({ message: "课程 不能为空。" });
    }
    if (!normalizedCategory) {
      await t.rollback();
      return res.status(422).send({ message: "类型 不能为空。" });
    }

    const courseCategoryError = validateCourseAndCategory(normalizedCourse, normalizedCategory);
    if (courseCategoryError) {
      await t.rollback();
      return res.status(422).send({ message: courseCategoryError });
    }

    const inputSchoolId =
      schoolId !== undefined
        ? schoolId
        : Array.isArray(schoolIds) && schoolIds.length > 0
          ? schoolIds[0]
          : null;

    const parsedSchoolId = parseSchoolId(inputSchoolId);
    if (schoolId !== undefined && schoolId !== null && schoolId !== "" && !parsedSchoolId) {
      await t.rollback();
      return res.status(422).send({ message: "schoolId 无效。" });
    }
    if (parsedSchoolId) {
      const school = await School.findByPk(parsedSchoolId, { transaction: t });
      if (!school) {
        await t.rollback();
        return res.status(422).send({ message: "学校不存在。" });
      }
    }

    const data = await Case.create(
      { description, year: parsedYear, course: normalizedCourse, category: normalizedCategory, schoolId: parsedSchoolId },
      { transaction: t }
    );

    await t.commit();
    return res.send(data);
  } catch (err) {
    await t.rollback();
    return res.status(500).send({
      message: err.message || "创建案例时发生错误。",
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const { page, size, keyword, course, category, field, topic, year } = req.query;
    const { limit, offset } = getPagination(page, size);
    const parsedYear = parseYear(year);
    const effectiveCourse = course !== undefined ? course : field;
    const effectiveCategory = category !== undefined ? category : topic;
    if (year !== undefined && year !== null && year !== "" && !parsedYear) {
      return res.status(422).send({ message: "年份筛选无效，必须是 1900-2100 的整数。" });
    }

    const condition = {
      [Op.and]: [
        keyword
          ? {
              [Op.or]: [
                { description: { [Op.like]: `%${keyword}%` } },
                { course: { [Op.like]: `%${keyword}%` } },
                { category: { [Op.like]: `%${keyword}%` } },
              ],
            }
          : null,
        effectiveCourse ? { course: { [Op.eq]: `${effectiveCourse}` } } : null,
        effectiveCategory ? { category: { [Op.eq]: `${effectiveCategory}` } } : null,
        year !== undefined && year !== null && year !== "" && parsedYear ? { year: { [Op.eq]: parsedYear } } : null,
      ],
    };

    const data = await Case.findAndCountAll({
      where: condition,
      include: [{ model: School, attributes: ["id", "code", "name"] }],
      distinct: true,
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    return res.send(getPagingData(data, page, limit));
  } catch (err) {
    return res.status(500).send({
      message: err.message || "查询案例列表时发生错误。",
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    const data = await Case.findByPk(req.params.id, {
      include: [
        { model: School, attributes: ["id", "code", "name"] },
        {
          model: Artifact,
          as: "Artifacts",
          attributes: [
            "id",
            "description",
            "category",
            "type",
            "attachmentName",
            "attachmentMime",
            "attachmentSize",
            "createdAt",
          ],
        },
      ],
      order: [[{ model: Artifact, as: "Artifacts" }, "id", "DESC"]],
    });

    if (!data) {
      return res.status(404).send({ message: `未找到案例 id=${req.params.id}。` });
    }

    return res.send(data);
  } catch (err) {
    return res.status(500).send({
      message: err.message || `查询案例 id=${req.params.id} 时发生错误。`,
    });
  }
};

exports.update = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const id = req.params.id;
    const { schoolId, schoolIds, field, topic, course, category, description, year } = req.body;

    const data = await Case.findByPk(id, { transaction: t });
    if (!data) {
      await t.rollback();
      return res.status(404).send({ message: `未找到案例 id=${id}。` });
    }

    const inputSchoolId =
      schoolId !== undefined
        ? schoolId
        : Array.isArray(schoolIds) && schoolIds.length > 0
          ? schoolIds[0]
          : schoolIds !== undefined
            ? null
            : undefined;

    const parsedSchoolId = parseSchoolId(inputSchoolId);
    if (inputSchoolId !== undefined && inputSchoolId !== null && inputSchoolId !== "" && !parsedSchoolId) {
      await t.rollback();
      return res.status(422).send({ message: "schoolId 无效。" });
    }
    if (parsedSchoolId) {
      const school = await School.findByPk(parsedSchoolId, { transaction: t });
      if (!school) {
        await t.rollback();
        return res.status(422).send({ message: "学校不存在。" });
      }
    }

    const normalizedCourse = (course !== undefined || field !== undefined)
      ? normalizeInput(course !== undefined ? course : field)
      : undefined;
    const normalizedCategory = (category !== undefined || topic !== undefined)
      ? normalizeInput(category !== undefined ? category : topic)
      : undefined;
    const parsedYear = year !== undefined ? parseYear(year) : undefined;

    if ((field !== undefined || course !== undefined) && !normalizedCourse) {
      await t.rollback();
      return res.status(422).send({ message: "课程 不能为空。" });
    }
    if ((topic !== undefined || category !== undefined) && !normalizedCategory) {
      await t.rollback();
      return res.status(422).send({ message: "类型 不能为空。" });
    }
    if (year !== undefined && !parsedYear) {
      await t.rollback();
      return res.status(422).send({ message: "年份无效，必须是 1900-2100 的整数。" });
    }

    const effectiveCourse = normalizedCourse !== undefined ? normalizedCourse : data.course;
    const effectiveCategory = normalizedCategory !== undefined ? normalizedCategory : data.category;

    if (normalizedCourse !== undefined || normalizedCategory !== undefined) {
      const courseCategoryError = validateCourseAndCategory(effectiveCourse, effectiveCategory);
      if (courseCategoryError) {
        await t.rollback();
        return res.status(422).send({ message: courseCategoryError });
      }
    }

    const payload = {};
    if (description !== undefined) payload.description = description;
    if (parsedYear !== undefined) payload.year = parsedYear;
    if (normalizedCourse !== undefined) payload.course = normalizedCourse;
    if (normalizedCategory !== undefined) payload.category = normalizedCategory;
    if (inputSchoolId !== undefined) payload.schoolId = parsedSchoolId;

    if (Object.keys(payload).length > 0) {
      await Case.update(payload, { where: { id }, transaction: t });
    }

    await t.commit();
    return res.send({ message: "案例更新成功。" });
  } catch (err) {
    await t.rollback();
    return res.status(500).send({
      message: err.message || `更新案例 id=${req.params.id} 时发生错误。`,
    });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  if (!mustConfirm(req.query.confirmCascade)) {
    return res.status(400).send({
      message:
        "危险操作：将永久删除该案例及其所有附件。请使用 confirmCascade=true 重新提交。",
    });
  }

  const t = await db.sequelize.transaction();
  try {
    const data = await Case.findByPk(id, { transaction: t });
    if (!data) {
      await t.rollback();
      return res.status(404).send({ message: `未找到案例 id=${id}。` });
    }

    const artifacts = await Artifact.findAll({
      where: { caseId: id },
      attributes: ["id", "attachmentPath"],
      transaction: t,
    });
    const artifactPaths = (artifacts || []).map((x) => x.attachmentPath).filter(Boolean);

    // Application-level cascade for compatibility even if DB FK is missing.
    await Artifact.destroy({ where: { caseId: id }, transaction: t });
    await Case.destroy({ where: { id }, transaction: t });
    await t.commit();

    for (const p of artifactPaths) {
      try {
        if (fs.existsSync(p)) fs.unlinkSync(p);
      } catch (e) {
        console.error("删除附件文件失败:", p, e.message);
      }
    }

    return res.send({ message: "案例及其关联数据已删除。" });
  } catch (err) {
    await t.rollback();
    return res.status(500).send({
      message: err.message || `删除案例 id=${id} 时发生错误。`,
    });
  }
};
