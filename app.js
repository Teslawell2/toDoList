
const express=require("express");
const bodyParser=require("body-parser")

const app=express()
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}))

var todolist=new Set();

app.get("/",function(req, res){
  res.sendFile(__dirname+"/index.html");
  console.log("Server received a GET request");
})

app.post("/",function(req, res){
  console.log("Server received a POST request");
  Object.keys(req.body).forEach(function(Key){
    if(req.body[Key]==='deleted'){
      todolist.delete(Key);
    }
  });
  if(req.body['new_item']!=''){
    todolist.add(req.body['new_item']);
  }
  console.log(todolist);
  res.sendFile(__dirname+"/index.html");
})

app.listen(3333,function(){
  console.log("Server is running on port 3333");
})
