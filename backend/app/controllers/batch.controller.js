const ExcelJS = require('exceljs');

const upload = require("../middleware/upload");

const db = require("../models");

const School = db.schools;
const Project = db.projects;
const Donor = db.donors;
const Donation = db.donations;
const fs = require('fs');
const Op = db.Sequelize.Op;

const batchUpload = async (req, res) => {
  try {
    await upload(req, res);
    console.log(req.files);

    if (!req.files) return;

    var query = require('url').parse(req.url, true).query;
    if (query.type === 'donations')
      await uploadDonations(req, res);

    if (query.type === 'projects')
      await uploadProjects(req, res);

    if (query.type === 'projectsXR')
      await uploadProjectsXR(req, res);

  } catch (error) {
    console.log(error);
    return res.status(500).send(`Error when trying upload files: ${error}`);
    if (req.files[0].path)
      fs.unlinkSync(req.files[0].path);
  }
};

const uploadProjectsXR = async (req, res) => {

   const NON_NULL_COLUMN = 1;

  const t = await db.sequelize.transaction();
  const wb = new ExcelJS.Workbook();
  wb.xlsx.readFile(req.files[0].path)
  .then(async () => {

    const ws = wb.getWorksheet(1);

    let headers = ws.getRow(1);
    let total = 0;
    let updatedTotal = 0;
    var updates = [];
    for (let index = 2; index <= ws.rowCount; index++) {
      let row = ws.getRow(index);

      if (!row.getCell(NON_NULL_COLUMN).value) break;

      total++;

      let startAt = row.getCell(1).value;
      let code = row.getCell(2).value;
      //let pCategory = row.getCell(2).value;
      let name = row.getCell(4).value;
      let description = row.getCell(5).value;
      //let budget = row.getCell(6).value;

      let schools = await School.findAll({
        where: {code},
        }, { transaction: t }
      );

      if (schools && schools[0]) {
        updates.push({startAt: startAt + '-01-10', schoolId: schools[0].id, name, description, xr: 1});
        updatedTotal++;
      }
    }
    await Project.bulkCreate(updates, { transaction: t });
    await t.commit();

    let message = '批量上传向荣项目总数：' + total +
      `;\n 更新数：` + updatedTotal;

    console.log(message);
    res.json(message);
    //res.json({ success: true, data: 'image' });
    fs.unlinkSync(req.files[0].path);

  })
  .catch(async (err) => {
    console.log(err.message);
    await t.rollback();
    return res.status(500).send(`Error when updating projects: ${err}`);

    if (req.files[0].path)
      fs.unlinkSync(req.files[0].path);
  });

};

const uploadProjects = async (req, res) => {
  PROJECT_CATEGORIES_ID = JSON.parse(req.body.PROJECT_CATEGORIES_ID);

  const SAVE_encodeSub = (subsFull, selected) => {
    if (!subsFull || !selected)
      return null;

    let result = 0;
    for (var i = subsFull.length; i > 0; i--)
      for (var j = selected.length; j > 0 ; j--)
        if (subsFull[i-1] === selected[j-1]) {
          result = (10 * result) + (i-1);          
          break;
        }

    return result;
  }

  const encodeSub = (subsFull, selected) => {
    if (!subsFull || !selected || selected.length == 0)
      return null;

    let result = 0;
    let hit = false;
    for (var i = subsFull.length; i > 0; i--)
      for (var j = selected.length; j > 0 ; j--)
        if (subsFull[i-1] === selected[j-1]) {
          result = (10 * result) + (i-1);
          hit = true;          
          break;
        }

    if (!hit) return null;

    return result;
  }

  const getCategoryAndSub = (pCategory, pSubCategory) => {
    let pCategoryId = null;
    let pSubCategoryId = null;
  
    for (var i = 0; i < PROJECT_CATEGORIES_ID.length; i++)
      if (PROJECT_CATEGORIES_ID[i].name == pCategory) {
        pCategoryId = i;
        if (PROJECT_CATEGORIES_ID[i].sub) {
          /** 
          let index = PROJECT_CATEGORIES_ID[i].sub.findIndex((element) => element == pSubCategory);
          if (index >= 0)
            pSubCategoryId = index;
          */
         let pSubCategoryArray = null;
         if (pSubCategory)
          if (pSubCategory.indexOf('，') > 0)
            pSubCategoryArray = pSubCategory.split('，');
          else
            pSubCategoryArray = pSubCategory.split(',');

          pSubCategoryId = encodeSub(PROJECT_CATEGORIES_ID[i].sub, pSubCategoryArray);
        }
      }
    return {pCategoryId, pSubCategoryId};
  }
  
  const NON_NULL_COLUMN = 1;

  const t = await db.sequelize.transaction();
  const wb = new ExcelJS.Workbook();
  wb.xlsx.readFile(req.files[0].path)
  .then(async () => {

    const ws = wb.getWorksheet(1);

    let headers = ws.getRow(1);
    let total = 0;
    let updatedTotal = 0;
    let notFoundTotal = 0;
    let duplicatedTotal = 0;
    let notFoundSchoolCodes = null;
    let duplicatedSchoolCodes = null;

    for (let index = 2; index <= ws.rowCount; index++) {
      let row = ws.getRow(index);

      if (!row.getCell(NON_NULL_COLUMN).value) break;

      total++;

      let startAt = row.getCell(1).value;
      let pCategory = row.getCell(2).value;
      let pSubCategory = row.getCell(3).value;      
      let name = row.getCell(4).value;
      let status = row.getCell(5).value;
      let description = row.getCell(6).value;
      let budget = row.getCell(7).value;
      let code = row.getCell(8).value;

      const {pCategoryId, pSubCategoryId} = getCategoryAndSub(pCategory, pSubCategory);

      console.log({pCategoryId, pSubCategoryId});

      var condition = {
        [Op.and]: [
          name ? { name: { [Op.eq]: `${name}` } } : null,
          //(pCategoryId || pCategoryId === 0) ? { pCategoryId: { [Op.eq]: `${pCategoryId}` } } : null,
          //(pSubCategoryId || pSubCategoryId === 0) ? { pSubCategoryId: { [Op.eq]: `${pSubCategoryId}` } } : null,
          code ? { '$school.code$': { [Op.eq]: `${code}` } } : null,
          startAt ? { "": { [Op.eq]: db.Sequelize.where(db.Sequelize.fn('YEAR', db.Sequelize.col('projects.startAt')), `${startAt}`) } } : null,
        ]
      };

      var include = [
        {
          model: School,
          attributes: ['id', 'code'],
          required: false,
        },
      ];

      let projects = await Project.findAll({
        where: condition,
        include: include,
        }, { transaction: t }
      );

      if (!projects || projects.length === 0) {
        notFoundTotal++;
        notFoundSchoolCodes = notFoundSchoolCodes
          ? notFoundSchoolCodes + ', ' + code
          : code;
      } else if (projects.length > 1) {
        duplicatedTotal++;
        duplicatedSchoolCodes = duplicatedSchoolCodes
          ? duplicatedSchoolCodes + ', ' + code
          : code;

        for (var i = 1; i < projects.length; i++) {
          await Project.destroy({where: { id: projects[i].id }}, { transaction: t });
        }
        await Project.update({description, budget, status, pCategoryId, pSubCategoryId, responseId: null}, {where: { id: projects[0].id }}, { transaction: t });
      } else {
        //projects[0].description = description;
        //projects[0].budget = budget;
        //projects[0].update( { transaction: t });
        await Project.update({description, budget, status, pCategoryId, pSubCategoryId}, {where: { id: projects[0].id }}, { transaction: t });
        updatedTotal++;
      }

    }

    await t.commit();

    let message = '批量上传学校项目总数：' + total +
      `;\n 更新数：` + updatedTotal +
      `;\n 无项目数：` + notFoundTotal + (notFoundSchoolCodes ? ' (学校：' + notFoundSchoolCodes + ')' : '') +
      `;\n 重复项目数：` + duplicatedTotal // + (duplicatedSchoolCodes ? ' (学校：' + duplicatedSchoolCodes + ')' : '');

    console.log(message);
    res.json(message);
    //res.json({ success: true, data: 'image' });
    fs.unlinkSync(req.files[0].path);

  })
  .catch(async (err) => {
    console.log(err.message);
    await t.rollback();
    return res.status(500).send(`Error when updating projects: ${err}`);

    if (req.files[0].path)
      fs.unlinkSync(req.files[0].path);
  });

};

const uploadDonations = async (req, res) => {

  const NON_NULL_COLUMN = 2;

  const net = async (newDonations, t) => {
    if (!newDonations || !newDonations[0]) return newDonations;

    let result = [];
    for (var i = 0; i < newDonations.length; i++) {

      const condition = {
        [Op.and]: [
          { donorId: { [Op.eq]: newDonations[i].donorId} } ,
          { startAt: { [Op.eq]: newDonations[i].startAt} } ,
          { transaction: { [Op.eq]: newDonations[i].transaction} } ,
      ]};

      let donations = await Donation.findAll({
        where: condition
      }, { transaction: t });

      if (donations.length === 0)
        result.push(newDonations[i]);
    }

    return result;
  }


  const t = await db.sequelize.transaction();
  const wb = new ExcelJS.Workbook();
  wb.xlsx.readFile(req.files[0].path)
  .then(async () => {

    const ws = wb.getWorksheet(1);

    let headers = ws.getRow(1);
    let currentDonor = null;
    let currentDonorId = null;
    let total = 0;
    let newDonor = 0;
    let newDonations = [];

    for (let index = 2; index <= ws.rowCount; index++) {
      let row = ws.getRow(index);
      let cell = row.getCell(1);

      if (cell.value) { // donor line
        currentDonor = cell.value;

        const condition = {
          [Op.or]: [
            { donor: { [Op.like]: `%${currentDonor}%` } } ,
            { name: { [Op.like]: `%${currentDonor}%` } } ,
        ]};

        let donor = await Donor.findAll({
          where: condition
        })

        if (donor.length === 0) {
          let newDonor = await Donor.create({donor: currentDonor, name: currentDonor}, { transaction: t });
          currentDonorId = newDonor['id'];
          newDonor++;
        } else {
          currentDonorId = donor[0].id;
        }

      } else { // donation line
        if (!currentDonorId) continue;

        let rowObj = {donorId: currentDonorId};

        for (let cn = 1; cn <= 6; cn++) {
          let c = row.getCell(cn);
          if (headers.getCell(cn).value === 'donor') continue;
          rowObj[headers.getCell(cn).value] = c.value;
        }

        if (rowObj[headers.getCell(NON_NULL_COLUMN).value]) {
          console.log(rowObj);
          total++;
          newDonations.push(rowObj)
        }
      }
    }

    let netUpdates = await net(newDonations, t);
    await Donation.bulkCreate(netUpdates, { transaction: t });
    await t.commit();

    let message = '批量上传捐款款项总数：' + total + '，新增数：' + netUpdates.length + '； 新增捐款人数：' + newDonor;
    console.log(message);
    res.json(message);
    //res.json({ success: true, data: 'image' });
    fs.unlinkSync(req.files[0].path);

  })
  .catch(async (err) => {
    console.log(err.message);
    await t.rollback();
    return res.status(500).send(`Error when trying upload files: ${err}`);

    if (req.files[0].path)
      fs.unlinkSync(req.files[0].path);
  });

};

const TO_DELETE_uploadDonations = async (req, res) => {

  const NON_NULL_COLUMN = 2;

  const rowCount = (ws) => {
    let i = 0;
    for (i = 1; i <= ws.rowCount; i++)
      if (!ws.getRow(i).getCell(NON_NULL_COLUMN).value && !ws.getRow(i + 1).getCell(NON_NULL_COLUMN).value) {
        return i;
      }
    return i;
  }

  const next = (ws, index) => {
    let i = ws.rowCount + 1;
    for (i = index; i <= rowCount(ws); i++)
      if (ws.getRow(i).getCell(1).value) {
        return i;
      }
    return i;
  }

  const net = async (newDonations, t) => {
    if (!newDonations || !newDonations[0]) return newDonations;

    let result = [];
    for (var i = 0; i < newDonations.length; i++) {

      const condition = {
        [Op.and]: [
          { donorId: { [Op.eq]: newDonations[i].donorId} } ,
          { startAt: { [Op.eq]: newDonations[i].startAt} } ,
          { transaction: { [Op.eq]: newDonations[i].transaction} } ,
      ]};

      let donations = await Donation.findAll({
        where: condition
      }, { transaction: t });

      if (donations.length === 0)
        result.push(newDonations[i]);
    }

    return result;
  }


  const t = await db.sequelize.transaction();
  const wb = new ExcelJS.Workbook();
  wb.xlsx.readFile(req.files[0].path)
  .then(async () => {

    const ws = wb.getWorksheet(1);

    let headers = ws.getRow(1);
    let currentDonor = null;
    let currentDonorId = null;
    let total = 0;
    let newDonor = 0;
    let newDonations = [];

    for (let index = 1; index <= ws.rowCount; index++) {

      let cell = ws.getRow(index).getCell(1);
      if (index === 1 || !cell.value) continue;

      currentDonor = cell.value;

      const condition = {
        [Op.or]: [
          { donor: { [Op.like]: `%${currentDonor}%` } } ,
          { name: { [Op.like]: `%${currentDonor}%` } } ,
      ]};

      let donor = await Donor.findAll({
        where: condition
      })

      if (donor.length === 0) {
        let newDonor = await Donor.create({donor: currentDonor, name: currentDonor}, { transaction: t });
        currentDonorId = newDonor['id'];
        ++newDonor;
      } else {
        currentDonorId = donor[0].id;
      }

      for (let i = index + 1; i < next(ws, index + 1); i++) {
        let row = ws.getRow(i);
        let rowObj = {donorId: currentDonorId};

        for (let cn = 1; cn <= 6; cn++) {
          let c = row.getCell(cn);
          if (headers.getCell(cn).value === 'donor') continue;
          rowObj[headers.getCell(cn).value] = c.value;
        }

        if (rowObj[headers.getCell(NON_NULL_COLUMN).value]) {
          console.log(rowObj);
          total++;
          newDonations.push(rowObj)
        }
      }
    }

    let netUpdates = await net(newDonations, t);
    await Donation.bulkCreate(netUpdates, { transaction: t });
    await t.commit();

    let message = '批量上传捐款款项总数：' + total + '，新增数：' + netUpdates.length + '； 新增捐款人数：' + newDonor;
    console.log(message);
    res.json(message);
    //res.json({ success: true, data: 'image' });
    fs.unlinkSync(req.files[0].path);

  })
  .catch(async (err) => {
    console.log(err.message);
    await t.rollback();
    return res.status(500).send(`Error when trying upload files: ${err}`);

    if (req.files[0].path)
      fs.unlinkSync(req.files[0].path);
  });

};

module.exports = {
  batchUpload: batchUpload,
};
