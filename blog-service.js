const Sequelize = require("sequelize");

var sequelize = new Sequelize('ifrndfqz', 'ifrndfqz', 'Ng7sVTrkMm2NCNp4t95iZ10Fol1qbGgI', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

var Post = sequelize.define('Post',{
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
})

var Category = sequelize.define('Category',{
    category: Sequelize.STRING
})

Post.belongsTo(Category, {foreignKey: 'category'});

module.exports.initialize = function(){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(()=>{
            resolve();
        }).catch(()=>{
            reject("Error: Unable to sync the database.");
        })
    });
}

module.exports.getAllPosts = function(){
    return new Promise((resolve, reject) => {
        Post.findAll().then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No posts found! Please check this page later or contact the help desk.");
        })
    });
}

module.exports.getPublishedPosts = function(){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                published: true
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No published posts found! Please check this page later or contact the help desk.");
        })
    });
}

module.exports.getPublishedPostsByCategory =function(category){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                published:true,
                category: category
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No published posts found! Please check this page later or contact the help desk.");
        })
    });
}

module.exports.getCategories = function(){
    return new Promise((resolve, reject) => {
        Category.findAll().then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No categories found! Please check this page later or contact the help desk.");
        })
    });
}

module.exports.addPost = function(postData){
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for(var ele in postData){
            if(postData[ele] == ''){
                postData[ele] = null;
            }
        }
        postData.postDate = new Date();
        Post.create(postData).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("Unable to create a new post! Please check this page later or contact the help desk.");
        })
    });
}

module.exports.getPostsByCategory = function(category){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                category: category
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No post are found under this category! Please check this page later or contact the help desk.");
        })
    });
}

module.exports.getPostsByMinDate = function(minDateStr){
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then(function(data){
            resolve(data);
        }).catch((err)=>{
            reject("No post are found after the date! Please check this page later or contact the help desk.");
        })
        
        reject();
    });
}

module.exports.getPostById = function(id){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{
                id: id
            }
        }).then(function(data){
            resolve(data[0]);
        }).catch((err)=>{
            reject("No post are found under this id! Please check this page later or contact the help desk.");
        })
    });
}

module.exports.addCategory = function(categoryData){
    return new Promise((resolve,reject) => {
        for(var ele in categoryData){
            if(categoryData[ele] == ''){
                categoryData[ele] = null;
            }
        }
        Category.create(categoryData).then(()=>{
            resolve();
        }).catch((err) => {
            reject("Unable to create a new category! Please check this page later or contact the help desk.")
        })

    });
}

module.exports.deleteCategoryById = function(id){
    return new Promise((resolve, reject) => {
        Category.destroy({
            where:{
                id: id
            }
        }).then(function(data){
            resolve(data);
        }).catch((err) => {
            reject("Unable to delete the category! Please check this page later or contact the help desk.");
        })
    });
}

module.exports.deletePostById = function(id){
    return new Promise((resolve, reject)=> {
        Post.destroy({
            where:{
                id: id
            }
        }).then(function(data){
            resolve(data);
        }).catch((err) => {
            reject("Unable to delete the post! Please check this page later or contact the help desk.");
        })
    })
}