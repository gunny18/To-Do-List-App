const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
const path = require("path");
const { itemSchema } = require("./itemSchema");
const { Item, List } = require("./populateItemsDocDB");

// mongoose
//   .connect("mongodb://localhost:27017/todolistDB")
//   .then(() => console.log("Connected to DB"))
//   .catch((e) => console.log(e));


mongoose
  .connect(
    "mongodb+srv://Gunny38:nCFS82SUgfZjZ7uA@cluster0.ypuepsl.mongodb.net/todolistDB",
  )
  .then(() => console.log("Connected to DB"))
  .catch((e) => console.log(e));






app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "/public")));

app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  const tasks = await Item.find({});
  res.render("lists", { listTitle: "Today", newTasks: tasks });
});

app.post("/", async (req, res) => {
  // console.log(req.body);
  const { task, addTaskBtn } = req.body;
  if (addTaskBtn == "Today") {
    await Item.insertMany({ name: task });
    res.redirect("/");
  } else {
    await List.findOneAndUpdate(
      { name: addTaskBtn },
      { $push: { items: { name: task } } }
    );
    res.redirect(`/${addTaskBtn}`);
  }
});

app.post("/tasks/:taskID", async (req, res) => {
  // console.log(req.body);
  const { listTitle } = req.body;
  const { taskID } = req.params;
  // console.log(taskID, listTitle);
  if (listTitle == "Today") {
    if (!req.body.task) {
      res.redirect("/");
    } else if (req.body.task == "on") {
      await Item.findByIdAndDelete(taskID);
      res.redirect("/");
    }
  } else {
    if (!req.body.task) {
      res.redirect(`/${listTitle}`);
    } else {
      await List.findOneAndUpdate(
        { name: listTitle },
        { $pull: { items: { _id: taskID } } }
      );
      res.redirect(`/${listTitle}`);
    }
  }
});

app.get("/:listName", async (req, res) => {
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

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
