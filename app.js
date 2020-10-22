const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    let todolist = new Set();
    foundItems.forEach((e) => {
      todolist.add(e.name)
    });
    res.render("page", {
      inputArray: Array.from(todolist)
    });
  })
})

app.post("/", function(req, res) {
  Object.keys(req.body).forEach(function(Key) {
    if (req.body[Key] === 'deleted') {
      Item.deleteOne({
        name: Key
      }, function(err) {
        if (err) return handleError(err);
      });
    }
  });
  if (req.body['new_item'] != '') {
    const oneItem = new Item({
      name: req.body['new_item']
    });
    oneItem.save(function(err) {
      if (err) return handleError(err);
    });
  }
  res.redirect("/");
})

app.listen(3333, function() {
  console.log("Server is running on port 3333");
})
