
const express=require("express");
const bodyParser=require("body-parser")

const app=express()
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine','ejs')

var todolist=new Set();

app.get("/",function(req, res){
  res.render("page", {inputArray: Array.from(todolist)});
})

app.post("/",function(req, res){
  Object.keys(req.body).forEach(function(Key){
    if(req.body[Key]==='deleted'){
      todolist.delete(Key);
    }
  });
  if(req.body['new_item']!=''){
    todolist.add(req.body['new_item']);
  }
  res.redirect("/");
})

app.listen(3333,function(){
  console.log("Server is running on port 3333");
})
