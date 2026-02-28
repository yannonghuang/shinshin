const fs = require("fs");
const db = require("../models");
const Case = db.cases;
const Course = db.courses;
const School = db.schools;
const Artifact = db.artifacts;
const Op = db.Sequelize.Op;

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

const mustConfirm = (value) => value === true || value === "true" || value === "1";

exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { description, courseId, schoolId, schoolIds } = req.body;
    if (!description) {
      await t.rollback();
      return res.status(422).send({ message: "案例描述不能为空。" });
    }
    if (!courseId) {
      await t.rollback();
      return res.status(422).send({ message: "courseId 不能为空。" });
    }

    const course = await Course.findByPk(courseId, { transaction: t });
    if (!course) {
      await t.rollback();
      return res.status(422).send({ message: "课程不存在。" });
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

    const data = await Case.create({ description, courseId, schoolId: parsedSchoolId }, { transaction: t });

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
    const { page, size, keyword, courseId, category, subcategory } = req.query;
    const { limit, offset } = getPagination(page, size);

    const condition = {
      [Op.and]: [
        keyword
          ? {
              [Op.or]: [
                { description: { [Op.like]: `%${keyword}%` } },
                { "$course.title$": { [Op.like]: `%${keyword}%` } },
              ],
            }
          : null,
        courseId ? { courseId: { [Op.eq]: `${courseId}` } } : null,
        category ? { "$course.category$": { [Op.eq]: `${category}` } } : null,
        subcategory ? { "$course.subcategory$": { [Op.eq]: `${subcategory}` } } : null,
      ],
    };

    const data = await Case.findAndCountAll({
      where: condition,
      include: [
        { model: Course, attributes: ["id", "title", "category", "subcategory"] },
        { model: School, attributes: ["id", "code", "name"] },
      ],
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
        { model: Course, attributes: ["id", "title", "description", "category", "subcategory"] },
        { model: School, attributes: ["id", "code", "name"] },
        {
          model: Artifact,
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
      order: [[Artifact, "id", "DESC"]],
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
    const { schoolId, schoolIds, courseId, description } = req.body;

    const data = await Case.findByPk(id, { transaction: t });
    if (!data) {
      await t.rollback();
      return res.status(404).send({ message: `未找到案例 id=${id}。` });
    }

    if (courseId) {
      const course = await Course.findByPk(courseId, { transaction: t });
      if (!course) {
        await t.rollback();
        return res.status(422).send({ message: "课程不存在。" });
      }
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

    const payload = {};
    if (description !== undefined) payload.description = description;
    if (courseId !== undefined) payload.courseId = courseId;
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
    const data = await Case.findByPk(id, {
      include: [{ model: Artifact, attributes: ["id", "attachmentPath"] }],
      transaction: t,
    });
    if (!data) {
      await t.rollback();
      return res.status(404).send({ message: `未找到案例 id=${id}。` });
    }

    const artifactPaths = (data.artifacts || []).map((x) => x.attachmentPath).filter(Boolean);
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
