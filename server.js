/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: PingJu Chen        Student ID: 151043205      Date: 2022/10/10
*
*  Online (Cyclic) Link: https://tense-pink-top-coat.cyclic.app
*
********************************************************************************/ 


var express = require("express");
const data = require("./blog-service.js");
const path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
var app = express();
const upload = multer();    // no { storage: storage } since we are not using disk storage

var HTTP_PORT = process.env.PORT || 8080;

//Request to a static resource - img and css file(need to be requested from the site and loaded on the page)
app.use(express.static('public'));

function onHttpStart(){
    console.log("Express http server listening on " + HTTP_PORT);
}

cloudinary.config({
    cloud_name: 'dw9wbz53h',
    api_key: '827925967478178',
    api_secret: 'g_GLxQN0G9Ug73-o2iiTXYFKowc',
    secure: true
});

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
    if(req.query.category){
        data.getPostsByCategory(req.query.category).then((data)=>{
            res.json(data);
        }).catch((err)=>{
            res.send("Message: Something went wrong, " + err);
        })
    }  
    else if(req.query.minDate){
        data.getPostsByMinDate(req.query.minDate).then((data) =>{
            res.json(data);
        }).catch((err)=>{
            res.send("Message: Something went wrong, " + err);
        })
    }
    else{
        data.getAllPosts().then((data) => {
            res.json(data);
        }).catch((err) => {
            res.send("Message: Something went wrong, " + err);
        })    
    }
})

app.get("/categories", function(req, res){
    data.getCategories().then((data) => {
        res.json(data);
    }).catch((err)=>{
        res.send("Message: Something went wrong, " + err);
    }) 
})

app.get("/posts/add", (req, res) => { 
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
})

app.post("/posts/add",upload.single("featureImage"), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                    }
                );
        
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
        
        upload(req).then((uploaded)=>{
            req.body.featureImage = uploaded.url;
            data.addPost(req.body).then(()=>{
                res.redirect("/posts");
            })
        }); 
    }
    else{
        processPost("");
    }
    function processPost(imageUrl){
        req.body.featureImage = imageUrl;
        blogData.addPost(req.body).then(post =>{
            res.redirect("/posts");
        }).catch(err =>{
            res.status(500).send(err);
        })
    }
})

app.get("/post/:id", (req, res) => {
    data.getPostById(req.params.id).then((data) =>{
        res.json(data);
    }).catch((err) => {
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
