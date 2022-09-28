const mongoose = require("mongoose");

// mongoose
//   .connect("mongodb://localhost:27017/todolistDB")
//   .then(() => console.log("Connected to DB"))
//   .catch((e) => console.log(e));

const { itemSchema } = require("./itemSchema");

const { listSchema } = require("./listSchema");

const Item = mongoose.model("Item", itemSchema);

// const makeItems = async () => {
//   await Item.insertMany({ name: "Eat Food" });
// };

// makeItems()
//   .then(() => console.log("Successfully inserted"))
//   .catch((e) => console.log(e));

const List = mongoose.model("List", listSchema);

module.exports.Item = Item;
module.exports.List = List;
