const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
const path = require("path");
const { itemSchema } = require("./itemSchema");
const { Item, List } = require("./populateItemsDocDB");
const { DB_URL } = require("./secrets");

// mongoose
//   .connect("mongodb://localhost:27017/todolistDB")
//   .then(() => console.log("Connected to DB"))
//   .catch((e) => console.log(e));

mongoose
  .connect(DB_URL)
  .then(() => console.log("Connected to DB"))
  .catch((e) => console.log(e));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "/public")));

app.use(express.urlencoded({ extended: true }));

//middleware to check if its today list or custom list route.
const checkListToUpdate = async (req, res, next) => {
  const { task, addTaskBtn } = req.body;
  if (addTaskBtn != "Today") {
    await List.findOneAndUpdate(
      { name: addTaskBtn },
      { $push: { items: { name: task } } }
    );
    res.redirect(`/lists/${addTaskBtn}`);
  } else {
    return next();
  }
};

//middle ware to check list and delete item.
const checkListAndDelete = async (req, res, next) => {
  const { listTitle } = req.body;
  const { taskID } = req.params;
  if (listTitle != "Today") {
    if (!req.body.task) {
      res.redirect(`/lists/${listTitle}`);
    } else {
      await List.findOneAndUpdate(
        { name: listTitle },
        { $pull: { items: { _id: taskID } } }
      );
      res.redirect(`/lists/${listTitle}`);
    }
  } else {
    return next();
  }
};

app.get("/", async (req, res) => {
  const tasks = await Item.find({});
  res.render("lists", { listTitle: "Today", newTasks: tasks });
});

app.post("/", checkListToUpdate, async (req, res) => {
  const { task } = req.body;
  await Item.insertMany({ name: task });
  res.redirect("/");
});

app.post("/tasks/:taskID", checkListAndDelete, async (req, res) => {
  const { taskID } = req.params;
  if (!req.body.task) {
    res.redirect("/");
  } else if (req.body.task == "on") {
    await Item.findByIdAndDelete(taskID);
    res.redirect("/");
  }
});

app.get("/lists/:listName", async (req, res) => {
  const listName = _.capitalize(req.params.listName);
  const findList = await List.findOne({ name: listName });
  if (findList) {
    res.render("lists", { listTitle: findList.name, newTasks: findList.items });
  } else {
    const newList = new List({
      name: listName,
      items: [
        { name: "Buy Food" },
        { name: "Cook Food" },
        { name: "Eat Food" },
      ],
    });
    await newList.save();
    res.render("lists", { listTitle: listName, newTasks: newList.items });
  }
});

app.use((req, res) => {
  res.render("notFound");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("Listening on port 3000");
});
