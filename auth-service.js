const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


let Schema = mongoose.Schema;

let userSchema = new Schema({
    userName:{
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory:[{ 
        dateTime: Date, 
        userAgent: String  
    }]
});

let User;   // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://chenpr:chen1996423@amyscluster.obquvtj.mongodb.net/?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err);     // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = function(userData){   //All the user information here -> process the information
    return new Promise(function(resolve, reject){
        if(userData.password != userData.password2){    //Verify the password
            reject("Password do not match!");
        }else{
            //encrypt before save into db
            bcrypt.hash(userData.password, 10).then(hash =>{    //CHECK
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save((err) =>{
                    if(err){
                        if(err.code === "11000"){   //CEHCK
                            reject("ERROR: User Name already taken.");
                        }
                        else{
                            reject("There was an error creating the user: " + err);
                        }
                    }else{
                        resolve();
                    }
                })
            }).catch(err =>{
                reject("There was an error encrypting the password.");
            })
        }
    })
}

module.exports.checkUser = function(userData){
    return new Promise(function(resolve, reject){
        User.find({userName: userData.userName})    //Check if the user exist //Username is unique
        .exec()
        .then((users) =>{
            if(users.length == 0){
                reject("Unable to find user: " + userData.userName);
            }else{
                //Make sure the password is match!
                bcrypt.compare(userData.password, users[0].password).then((res)=>{  //only one user in users array! CHECK
                    if(res === true){
                        users[0].loginHistory.push({dateTime: (new Date()).toString(),
                                userAgent: userData.userAgent});
                        User.updateOne({userName: users[0].userName}, 
                            {$set: {loginHistory: users[0].loginHistory}}
                        ).exec()
                        .then(() =>{
                            resolve(users[0]);
                        }).catch((err) =>{
                            reject("There was an error verifying the user: " + err);
                        })
                    }else{
                        reject("Incorrect Password for user: " + userData.userName);
                    }
                })
            }
        }).catch((err) =>{
            reject("Unable to find user: " + userData.userName);
        })
    })
}
