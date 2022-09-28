const mongoose = require("mongoose");
const { itemSchema } = require("./itemSchema");

module.exports.listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});
