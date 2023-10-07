const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    name : {type : String},
    password : {type : String},
    city : {type : String},
    role : {type : String , default : 'customer' , enum : ["customer","seller"]}
})
const UserModel = mongoose.model('user' , UserSchema)

module.exports = {UserModel}