const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltround = 10;
require('dotenv').config();

const app = express();
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');

// mongoose.connect("mongodb://localhost:27017/todolistDB", {
mongoose.connect("mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@cluster0.p6nn4.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const listSchema = {
  username: String,
  hash: String,
  items: [String]
};
const List = mongoose.model("List", listSchema);

//route handlers
app.route('/')
  .get((req, res) => {
    res.render("home", {});
  })

app.route('/login')
  .get((req, res) => {
    res.render("login", {})
  })
  .post((req, res) => {
    List.findOne({
      username: req.body.username
    }, function(err, foundUser) {
      if (foundUser != null) {
        bcrypt.compare(req.body.password, foundUser.hash, (err, result) => {
          if (result) {
            res.render("page", {
              inputArray: foundUser.items,
              postAddress: "/:" + foundUser.username
            });
          } else {
            console.log("Wrong Password");
            res.redirect('/login');
          }
        })

      } else {
        console.log("No such user");
        res.redirect('/login');
      }
    })
  })

app.route('/register')
  .get((req, res) => {
    res.render("register", {})
  })
  .post((req, res) => {
    List.findOne({
      username: req.body.username
    }, (err, foundlist) => {
      if (foundlist != null) {
        console.log("Username exists!");
        res.redirect('/register');
      } else {
        bcrypt.hash(req.body.password, saltround, (err, hash) => {
          const userlist = new List({
            username: req.body.username,
            hash: hash,
            items: []
          })
          userlist.save();
          res.render("page", {
            inputArray: userlist.items,
            postAddress: "/:" + userlist.username
          });
        })
      }
    })
  })

app.route('/:username')
  .post((req, res) => {
    List.findOne({
      username: req.params.username.slice(1)
    }, (err, founduser) => {
      if (founduser != null) {
        for (Key of Object.keys(req.body)) {
          if (Key == 'new_item' && req.body['new_item'] != '') {
            founduser.items.push(req.body['new_item']);
          } else if (req.body[Key] === 'deleted') {
            console.log(Key);
            var index=founduser.items.indexOf(Key);
            if(index != -1){
              founduser.items.splice(index,1);
            }
          }
        }
        founduser.save();
        res.render("page", {
          inputArray: founduser.items,
          postAddress: "/" + req.params.username
        });
      } else {
        res.redirect("/login");
      }
    })
  })

app.listen(3333, function() {
  console.log("Server is running on port 3333");
})
