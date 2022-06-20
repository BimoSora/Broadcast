const db = require('../config/connection')
const collection = require('../config/collection')

module.exports={

    //saving user deatils to db

    saveUser:(user)=>{
        db.get().collection(collection.USER_COLLECTION).createIndex({userId:1},{unique:true})
        db.get().collection(collection.USER_COLLECTION).insertOne(user).catch((err)=>{
            console.log('already existing user');
        })
    },

    //getting user data for statitics and broadcast purpose

    getUser:()=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).find().toArray().then((res)=>{
                resolve(res);
                
            })
        })
    },

    //updating user database by removing blocked users details from the database

    updateUser:(userId)=>{
        db.get().collection(collection.USER_COLLECTION).deleteOne({userId:userId}).then((res)=>{
            console.log('updated user database');
        })
    }
}
