const express = require('express')
const {connection} = require('../db/conn')
const {UserModel} = require('../models/User.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()

// middlewares
app.use(express.json())

app.get('/' , async(req,res) => {
    res.send("Home page")
})

app.post('/signup' , async(req,res) => {
    const {name , password , city} = req.body
    try{
        const user = new UserModel({
            name,
            password : bcrypt.hashSync(password,10),
            city
        })
        const userInsert  = await user.save()
        if(userInsert){
            return res.status(200).send({userInsert})
        }else{
            return res.status(500).send({status : false , message : 'User cannot be created'})
        }
    }catch(e){
        console.log(e)
        console.log("Data POST failed")
        res.status(404).send({status : false , message : 'Internal server error User cannot be created'})
    }
})

app.post('/signin' , async(req,res) => {
    const {name , password} = req.body
    try{
        const user = await UserModel.findOne(name)
        if(!user){
            return res.status(400).send({status : false , message : 'User not found.Please do register frist'})
        }
        if(user && bcrypt.compareSync(password,user.password)){
            // User is successfully logged in now let't provide him with token
            const token = jwt.sign(
                {
                    user : user._id,
                    name : name
                },
                process.env.SECRET_KEY,
                {expiresIn : '1d'}
            )
            return res.status(200).send({user : name , token : token})
        }
        else{
            return res.status(404).send({status : false , message : 'Please provide a correct password'})
        }
    }catch(e){
        console.log(e)
        console.log('Some Problems in the login part server')
    }
})

app.listen(3000 , async() => {
    try{
        await connection
        console.log('Database connected successfully')
    }catch(e){
        console.log(e)
        console.log("Problems in connecting with database")
    }
    console.log('Server started successfully')
})
