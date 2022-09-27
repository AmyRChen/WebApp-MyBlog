const fs = require("fs");
const { resolve } = require("path");

var posts = [];
var categories = [];

module.exports.initialize = function(){
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json'), (err, data) => {
            if(err){
                reject("Unable to read the file, please contact the help desk!");
            }
            else{
                posts = JSON.parse(data);
                resolve();
                fs.readFile('./data/categories.json'), (err, data) =>{
                    if(err){
                        reject("Unable to read the file, please contact the help desk!");
                    }
                    else{
                        categories = JSON.parse(data);
                        resolve();
                    }        
                }       
            }
        }
    })
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