const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:admin@cluster0.8j5fdn6.mongodb.net/todolistDB1", {
  useNewUrlParser: true,
});

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

// const item1 = new Item({
//   name: "welcome to our todolist"
// });
const item1 = new Item({
  name: "Benvenuto/a!",
});

const item2 = new Item({
  name: "Premi + per aggiungere nuove voci alla lista",
});

const item3 = new Item({
  name: "<-- Premi per eliminare",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems)
// .then(function(){
//   console.log("default items successfully saved ti db");
// })
// .catch(function(err){
//   console.log(err);
// });

app.get("/", function (req, res) {
  Item.find({})
    .then(function (foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany([item1, item2, item3])
          .then(function () {
            // console.log("default items successfully saved ti db");
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/");
      } else {
        // console.log(foundItems);
        res.render("list", { listTitle: "Lista", newListItems: foundItems });
      }
    })
    .catch(function (err) {
      console.log(err);
    });

  // res.render("list", {listTitle: "Today", newListItems: defaultItems});
});

app.get("/:postName", async function (req, res) {
  const customListName = _.capitalize(req.params.postName);

  await List.findOne({ name: customListName })
    .exec()

    .then(function (foundList) {
      if (foundList === null) {
        //creating a new list if the custom list name does not exists
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        // console.log("e");
        //if the name already present then render the page
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/", async function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    await List.findOne({ name: listName })
      .exec()
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
  }
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Lista") {
    Item.findByIdAndRemove(checkedItemId).then(function () {
      console.log("Successfully deleted selected item.");
      res.redirect("/");
    });
  } else {
    List.findOne({ name: listName })
      .then(function (foundList) {
        foundList.items.pull({ _id: checkedItemId });

        foundList.save(), res.redirect("/" + listName);
      })

      .catch(function (err) {
        console.log(err);
      });
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
