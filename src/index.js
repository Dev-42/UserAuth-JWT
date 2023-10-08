const express = require('express')
const {connection} = require('../db/conn')
const {UserModel} = require('../models/User.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

// middlewares
app.use(express.json())

const authenticate = (req,res,next) => {
    const token = req.headers.authorization?.split(" ")[1]
    if(!token){
        res.send({status : false , message : "Please login"})
    }
    jwt.verify(token,process.env.SECRET_KEY,function(err,decoded){
        if(decoded){
            const { user } = decoded
            req.user = user
            next()
        }else{
            res.send({status : false , message : "Please Login"})
            console.log(err)
        }
    })
}

app.get('/' , async(req,res) => {
    res.send("Home page")
})

app.post('/signup' , async(req,res) => {
    const {name , password , city , role} = req.body
    try{
        const user = new UserModel({
            name,
            password : bcrypt.hashSync(password,10),
            city,
            role
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
        const user = await UserModel.findOne({name})
        if(!user){
            return res.status(400).send({status : false , message : 'User not found.Please do register frist'})
        }
        if(user && bcrypt.compareSync(password,user.password)){
            // User is successfully logged in now let't provide him with token
            const token = jwt.sign(
                {
                    user : user._id,
                    name : user.name
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

// protected route
app.get('/reports' , authenticate , async(req,res) => {
   res.send({status : true , message : "Token authenticated.You can access reports endpoint"})
})

// protected route
app.get('/finances' , authenticate, async(req,res) => {
    res.send("Finance details")
})
// non-protected route
app.get('/about' , async(req,res) => {
    res.send('About details')
})

// everyone's can access who is authenticated
app.get('/products' ,authenticate, async(req,res) => {
    res.send("everyone who has logged in can veiw this page.")
})
// seller
app.get('/products/create',authenticate, async (req, res) => {
    // Fetching the user through the user's token
    const user = req.user
    const userDB = await UserModel.findOne({ _id: user})
    console.log(userDB)

    if(userDB.role === 'seller'){
        res.send("Product created")   
    }else{
        res.send("You are not a seller.Product can't be created")
    }
})

// admin
app.get('/products/delete' , async(req,res) => {
    res.send("Product deleted")
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
