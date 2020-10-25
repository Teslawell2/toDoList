const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt=require("bcrypt");
const saltround=10;
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

const userSchema = {
  username: String,
  hash: String
}
const User = mongoose.model("User", userSchema);

const listSchema = {
  username: String,
  items: {
    type: Map,
    of: String
  }
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
    User.findOne({
      username: req.body.username
    }, function(err, foundUser) {
      if (foundUser != null) {
        bcrypt.compare(req.body.password,foundUser.hash,(err,result)=>{
          if(result){
            res.redirect("/:" + req.body.username);
          }else{
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
      }else{
        bcrypt.hash(req.body.password,saltround, (err,hash)=>{
          const user = new User({
            username: req.body.username,
            hash: hash
          });
          user.save();
          const userlist = new List({
            username: req.body.username,
            items: {}
          })
          userlist.save();
          res.redirect('/:' + req.body.username);
        })
      }
    })
  })

app.route('/:UserName')
  .get((req, res) => {
    List.findOne({
      username: req.params.UserName.slice(1)
    }, (err, foundlist) => {
      res.render("page", {
        inputArray: Array.from(foundlist.items.keys()),
        postAddress: "/" + req.params.UserName
      });
    })
  })
  .post(async (req, res) => {
    const promises = Object.keys(req.body).map((Key) => {
      return new Promise((resolve, reject) => {
        if (Key == 'new_item' && req.body['new_item'] != '') {
          List.findOne({
            username: req.params.UserName.slice(1)
          }, (err, foundlist) => {
            foundlist.items.set(req.body['new_item'], "");
            foundlist.save();
            resolve();
          })
        } else if (req.body[Key] === 'deleted') {
          List.findOne({
            username: req.params.UserName.slice(1)
          }, (err, foundlist) => {
            foundlist.items.delete(Key);
            foundlist.save();
            resolve();
          })
        } else {
          resolve();
        }
      })
    })
    await Promise.all(promises);
    res.redirect("/" + req.params.UserName);
  })

app.listen(3333, function() {
  console.log("Server is running on port 3333");
})
