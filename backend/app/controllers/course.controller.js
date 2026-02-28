const db = require("../models");
const Course = db.courses;
const Case = db.cases;
const Op = db.Sequelize.Op;

const getPagination = (page, size) => {
  const limit = size ? +size : 30;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: courses } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, courses, totalPages, currentPage };
};

exports.create = async (req, res) => {
  try {
    const { title, description, category, subcategory } = req.body;

    if (!title) {
      return res.status(422).send({ message: "课程标题不能为空。" });
    }

    const data = await Course.create({ title, description, category, subcategory });
    return res.send(data);
  } catch (err) {
    return res.status(500).send({
      message: err.message || "创建课程时发生错误。",
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const { page, size, keyword } = req.query;
    const { limit, offset } = getPagination(page, size);

    const condition = keyword
      ? {
          [Op.or]: [
            { title: { [Op.like]: `%${keyword}%` } },
            { description: { [Op.like]: `%${keyword}%` } },
            { category: { [Op.like]: `%${keyword}%` } },
            { subcategory: { [Op.like]: `%${keyword}%` } },
          ],
        }
      : null;

    const data = await Course.findAndCountAll({
      where: condition,
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    return res.send(getPagingData(data, page, limit));
  } catch (err) {
    return res.status(500).send({
      message: err.message || "查询课程列表时发生错误。",
    });
  }
};

exports.findOne = async (req, res) => {
  try {
    const data = await Course.findByPk(req.params.id);
    if (!data) {
      return res.status(404).send({ message: `未找到课程 id=${req.params.id}。` });
    }
    return res.send(data);
  } catch (err) {
    return res.status(500).send({
      message: err.message || `查询课程 id=${req.params.id} 时发生错误。`,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const [num] = await Course.update(req.body, { where: { id } });

    if (num === 1) {
      return res.send({ message: "课程更新成功。" });
    }

    return res.send({
      message: `无法更新课程 id=${id}，可能不存在或请求体为空。`,
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message || `更新课程 id=${req.params.id} 时发生错误。`,
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const count = await Case.count({ where: { courseId: id } });
    if (count > 0) {
      return res.status(422).send({
        message: "该课程已被案例引用，不能删除。",
      });
    }

    const num = await Course.destroy({ where: { id } });
    if (num === 1) {
      return res.send({ message: "课程删除成功。" });
    }

    return res.send({
      message: `无法删除课程 id=${id}，可能不存在。`,
    });
  } catch (err) {
    return res.status(500).send({
      message: err.message || `删除课程 id=${req.params.id} 时发生错误。`,
    });
  }
};
