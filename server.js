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
const exphbs = require('express-handlebars');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const stripJs = require('strip-js');
const blogData = require("./blog-service");

var app = express();
const upload = multer();

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers:{
        //helper will automatically render the correct <li> element add the class "active" 
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        //evaluate conditions for equality
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        //removes unwanted JavaScript code from our post body string
        safeHTML: function(context){
            return stripJs(context);
        }             
    }}));
app.set('view engine', '.hbs');

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

//Fixing the Navigation Bar to Show the correct "active" item
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.get("/", function(req ,res){
    res.redirect("/blog");
})

app.get("/about", function(req, res){
    res.render("about", {about:data});
})

//Previous work:
//app.get("/blog", function(req, res){
//    data.getPublishedPosts().then((data) =>{
//        res.json(data);
//    }).catch((err) => {
//        res.send("Message: Something went wrong, " + err);
//    })
//})

app.get('/blog', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
    try{
        // declare empty array to hold "post" objects
        let posts = [];
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }
        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 
        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;
    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

app.get('/blog/:id', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
    try{
        // declare empty array to hold "post" objects
        let posts = [];
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }
        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

app.get("/posts", function(req, res){
    if(req.query.category){
        data.getPostsByCategory(req.query.category).then((data)=>{
            res.render("posts", {posts: data});
        }).catch((err)=>{
            res.render("posts", {message: "Message: Something went wrong, " + err});
        })
    }  
    else if(req.query.minDate){
        data.getPostsByMinDate(req.query.minDate).then((data) =>{
            res.render("posts", {posts: data});
        }).catch((err)=>{
            res.render("posts", {message: "Message: Something went wrong, " + err});
        })
    }
    else{
        data.getAllPosts().then((data) => {
            res.render("posts", {posts: data});
        }).catch((err) => {
            res.render("posts", {message: "Message: Something went wrong, " + err});
        })    
    }
})

app.get("/categories", function(req, res){
    data.getCategories().then((data) => {
        res.render("categories", {categories: data});
    }).catch((err)=>{
        res.render("categories", {message: "no results"});
    }) 
})

app.get("/posts/add", (req, res) => { 
    res.render("addPost", {addPost:data});
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
    res.status(404).render("404", {404: data});
})

data.initialize().then(function(){
    app.listen(HTTP_PORT, onHttpStart); //only call listen function after initialize() method is successful
}).catch(function(err){
    console.log("Unable to start the server: " + err + ", Please contact the help desk!");
})
