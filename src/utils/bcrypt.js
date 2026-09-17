const bcrypt = require("bcrypt");
const crypto = require("crypto");

const encrypt = (password) => {
  return bcrypt.hash(password, 10);
};

const match = (unencrypted, encrypted) => {
  return bcrypt.compare(unencrypted, encrypted);
};

// function generateHashedId(id) {
//   return crypto.createHash("md5").update(String(id)).digest("hex");
// }

module.exports = { encrypt, match};
