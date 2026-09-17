const mongoose = require("mongoose");
const mongodbConnect = async () => {
  await mongoose.connect(process.env.mongoURI);
}
mongodbConnect()
  .then(() => {
    console.log("db is connect");
  })
  .catch((err) => {
    console.log("error in db", err);
  })

module.exports = mongodbConnect