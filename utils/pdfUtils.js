const fs = require('fs');
const pdf = require('pdf-parse');

function extractTextFromPDF(filePath) {
  return new Promise((resolve, reject) => {
    const dataBuffer = fs.readFileSync(filePath);

    pdf(dataBuffer).then(function (data) {
      resolve(data.text);  // Extracted text
    }).catch(reject);
  });
}

module.exports = { extractTextFromPDF };
