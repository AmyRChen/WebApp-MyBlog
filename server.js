/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: PingJu Chen     Student ID: 151043205   Date: 2022/09/27
*
*  Online (Cyclic) Link: https://tense-pink-top-coat.cyclic.app
*
********************************************************************************/ 


var express = require("express");
const data = require("./blog-service.js");
const path = require("path");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

//Request to a static resource - img and css file(need to be requested from the site and loaded on the page)
app.use(express.static('public'));

function onHttpStart(){
    console.log("Express http server listening on " + HTTP_PORT);
}

app.get("/", function(req ,res){
    res.redirect("/about");
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
