const fs = require('fs');
const path = require('path');

const upload = (req, res) => {
  const filename = req.params.filename;  
  const jsonData = req.body; // ✅ your JSON payload is here

// Convert the JS object to a JSON string
  const jsonString = JSON.stringify(jsonData, null, 2); // `null, 2` for pretty formatting

  // Define the output file path
  const filePath = path.join(`${__dirname}/../../upload/geo`, filename + '.json');

  // Ensure the directory exists (optional but safe)
  fs.mkdir(path.dirname(filePath), { recursive: true }, (err) => {
    if (err) {
      res.status(500).send(err);
      throw err;
    }

    // Write the file
    fs.writeFile(filePath, jsonString, (err) => {
      if (err) {
        console.error('Error writing file:', err);
        res.status(500).send(err);
      } else {
        console.log('JSON saved to', filePath);
      }
    });

    //console.log('Received JSON:', jsonData);
    res.status(200).send('Data received');
  })
}

// Serve JSON file as an API
const download = (req, res) => {
  const filename = req.params.filename;

  console.log("============ ready to serve local map ...");

  const filePath = path.join(`${__dirname}/../../upload/geo`, filename + '.json');
  fs.readFile(filePath, 'utf-8', (err, jsonData) => {
    if (err) {
      res.status(500).json({ error: 'Failed to read file' });
      console.log('Error reading file:', err);
    } else {
      res.json(JSON.parse(jsonData));
      console.log("============ local map sent ...");
    }
  });
};

module.exports = {
  upload: upload,
  download: download
};
