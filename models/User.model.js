const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    name : {type : String},
    password : {type : String},
    city : {type : String}
})
const UserModel = mongoose.model('user' , UserSchema)

module.exports = {UserModel}