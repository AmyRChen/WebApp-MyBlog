const fs = require("fs");

var posts = [];
var categories = [];

module.exports.initialize = function(){
    const promise1 = new Promise((resolve, reject)=>{
        fs.readFile('./data/posts.json', (err, data)=>{
            if(err){
                reject("Unable to read the file, please contact the help desk!");
            }
            else{
                posts = JSON.parse(data);
                resolve();
            }
        })
    })

    if(promise1){
        return new Promise((resolve, reject)=>{
            fs.readFile('./data/categories.json', (err, data)=>{
                if(err){
                    reject("Unable to read the file, please contact the help desk!");
                }
                else{
                    categories = JSON.parse(data);
                    resolve();
                }
            })
        })
    }
}

module.exports.getAllPosts = function(){
    return new Promise((resolve, reject) => {
        if(posts.length == 0){
            reject("No posts found! Please check this page later or contact the help desk.");
        }
        else{
            resolve(posts);
        }
    })
}

module.exports.getPublishedPosts = function(){
    return new Promise((resolve, reject) =>{
        var filteredPosts = [];
        for(let i = 0; i < posts.length; i++){
            if(posts[i].published){
                filteredPosts.push(posts[i]);
            }
        }
        if(filteredPosts.length == 0){
            reject("No published posts found! Please check this page later or contact the help desk.");
        }
        else{
            resolve(filteredPosts);
        }
    })
}

module.exports.getPublishedPostsByCategory =function(category){
    return new Promise((resolve, reject) =>{
        var filteredPosts = [];
        for(let i = 0; i < posts.length; i++){
            if(posts[i].published && posts[i].category == category){
                filteredPosts.push(posts[i]);
            }
        }
        if(filteredPosts.length == 0){
            reject("No published posts found! Please check this page later or contact the help desk.");
        }
        else{
            resolve(filteredPosts);
        }
    })
}

module.exports.getCategories = function(){
    return new Promise((resolve, reject) =>{
        if(categories.length == 0){
            reject("No categories found! Please check this page later or contact the help desk.");
        }
        else{
            resolve(categories);
        }
    })
}

module.exports.addPost = function(postData){
    return new Promise((resolve, reject) =>{
        var currentDate = (new Date()).toISOString().split('T')[0];
        if(postData.published === undefined){
            postData.published = false;
        }
        else{
            postData.published = true;  //checkbox not sending 'false' if it's unchecked
        }
        postData.id = posts.length + 1;
        postData.postDate = currentDate;
        posts.push(postData);
        resolve();
    })
}

module.exports.getPostsByCategory = function(category){
    return new Promise((resolve, reject) =>{
        var filteredByCategory = [];
        for(let i = 0; i < posts.length; i++){
            if(posts[i].category == category){
                filteredByCategory.push(posts[i]);
            }
        }
        if(filteredByCategory.length == 0){
            reject("No post are found under this category! Please check this page later or contact the help desk.");
        }
        else{
            resolve(filteredByCategory);
        }
    })
}

module.exports.getPostsByMinDate = function(minDateStr){
    return new Promise((resolve, reject) => {
        var filteredByMinDate = [];
        for(let i = 0; i < posts.length; i++){
            if(new Date(posts[i].postDate) >= new Date(minDateStr)){
                filteredByMinDate.push(posts[i]);
            }
        }
        if(filteredByMinDate.length == 0){
            reject("No post are found after the date! Please check this page later or contact the help desk.");
        }
        else{
            resolve(filteredByMinDate);
        }
    })
}

module.exports.getPostById = function(id){
    return new Promise((resolve, reject) => {
        var match = false;
        var matchedPost;
        for(let i = 0; i < posts.length && !match; i++){
            if(posts[i].id == id){
                matchedPost = posts[i];
                match = true;
            }
        }
        if(!match){
            reject("No post are found under this id! Please check this page later or contact the help desk.");
        }
        else{
            resolve(matchedPost);
        }
    })
}