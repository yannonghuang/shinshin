const ExcelJS = require('exceljs');

const upload = require("../middleware/upload");

const db = require("../models");

const School = db.schools;
const Project = db.projects;
const Donor = db.donors;
const Donation = db.donations;
const fs = require('fs');
const Op = db.Sequelize.Op;

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

const batchUpload = async (req, res) => {
  try {
    await upload(req, res);
    console.log(req.files);

    if (!req.files) return;

    if ((new URLSearchParams(props.location.search)).get('type') === 'donations')
      await uploadDonations(req, res);
/**
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
      await Donation.bulkCreate(newDonations, { transaction: t });
      await t.commit();

      let message = '批量上传总数：' + total + ', 新增捐款人数：' + newDonor;
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
*/

  } catch (error) {
    console.log(error);
    return res.status(500).send(`Error when trying upload files: ${error}`);
    if (req.files[0].path)
      fs.unlinkSync(req.files[0].path);
  }
};

const uploadDonations = async (req, res) => {

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
      await Donation.bulkCreate(newDonations, { transaction: t });
      await t.commit();

      let message = '批量上传总数：' + total + ', 新增捐款人数：' + newDonor;
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

const _batchUpload = async (req, res) => {
  try {
    await upload(req, res);
    console.log(req.files);

    if (!req.files) return;

    //var imageData = fs.readFileSync(req.files[0].path);

    const wb = new ExcelJS.Workbook();
    //const fileName = 'items.xlsx';
    wb.xlsx.readFile(req.files[0].path)
    .then(() => {

      const ws = wb.getWorksheet('Sales by Donor Detail');

      let headers = ws.getRow(1);
      //console.log(headers.getCell(1).value);
      //console.log(headers.getCell(2).value);

      let rows = ws.getRows(2, 3).values();
      //let rows = ws.getRows(2, ws.actualRowCount).values();
      let currentDonor = null;
      let currentDonorId = null;

      for (let row of rows) {
        let rowObj = null;
        row.eachCell({includeEmpty: true}, async (cell, cn) => {

          if (headers.getCell(cn).value === 'donor') {
            if (cell.value) {
              currentDonor = cell.value;

              const condition = {
                [Op.or]: [
                  { donor: { [Op.like]: `%${currentDonor}%` } } ,
                  { name: { [Op.like]: `%${currentDonor}%` } } ,
              ]};


              let donor = await Donor.findAll({
                where: condition
              });

              if (donor.length === 0) {
                //let newDonor = await Donor.create({donor: currentDonor, name: currentDonor});
                currentDonorId = 0; //newDonor['id'];
              } else {
                currentDonorId = donor[0].id;
              }
console.log('kkkkkkkkkk = ' + currentDonorId)
            } else {

              rowObj = {donorId: currentDonorId};
            }
          } else {
            if (rowObj)
              rowObj[headers.getCell(cn).value] = cell.value;
          }
        });
        console.log(rowObj);
      }
      res.json({ success: true, data: 'image' });
      fs.unlinkSync(req.files[0].path);
    })
    .catch(err => {
      console.log(err.message);
      return res.send(`Error when trying upload files: ${err}`);
      if (req.files[0].path)
        fs.unlinkSync(req.files[0].path);
    });

  } catch (error) {
    console.log(error);
    return res.send(`Error when trying upload files: ${error}`);
    if (req.files[0].path)
      fs.unlinkSync(req.files[0].path);
  }
};

module.exports = {
  batchUpload: batchUpload,
};
