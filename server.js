var express = require("express");
var data = require("./blog-service");
var app = express();
var path = require("path");

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart(){
    console.log("Express http server listening on " + HTTP_PORT);
}

//Request to a static resource - img and css file(need to be requested from the site and loaded on the page)
app.use(express.static('public'));

app.get("/", function(req ,res){
    res.redirect("/about"); //check
})

app.get("/about", function(req, res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
})

app.get("/blog", function(req, res){
    data.getPublishedPosts().then((data) =>{
        res.json(data);
    }).catch((err) => {
        res.send("Message: Something went wrong, " + err);
    })
})

app.get("/posts", function(req, res){
    data.getAllPosts().then((data) => {
        res.json(data);
    }).catch((err) => {
        res.send("Message: Something went wrong, " + err);
    })
})

app.get("/categories", function(req, res){
    data.getCategories().then((data) => {
        res.json(data);
    }).catch((err)=>{
        res.send("Message: Something went wrong, " + err);
    })
})

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname,"/views/404.html"));
})

data.initialize().then(function(){
    app.listen(HTTP_PORT, onHttpStart); //only call listen function after initialize() method is successful
}).catch(function(err){
    console.log("Unable to start the server: " + err + ", Please contact the help desk!");
})

