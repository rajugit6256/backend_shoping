// utils/parseCSV.js
const fs = require("fs");
const csv = require("csv-parser");

const parseEmailsFromCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const emails = [];
    const errors = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // ✅ support columns named: email, Email, EMAIL, e-mail
        const email = Object.values(row).find((val) =>
          /\S+@\S+\.\S+/.test(val?.trim()),
        );

        if (email) {
          emails.push(email.toLowerCase().trim());
        } else {
          errors.push(`Invalid row: ${JSON.stringify(row)}`);
        }
      })
      .on("end", () => resolve({ emails, errors }))
      .on("error", reject);
  });
};

module.exports = { parseEmailsFromCSV };
