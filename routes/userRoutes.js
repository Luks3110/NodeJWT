
const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Open Route GET
router.get('/', async (req, res) => {
    try {
        const user = await User.find()
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({error: error})
        console.error(error)
    }
})

//Register
router.post('/auth/register', async(req,res) => {
    const { name, email, password, confirmPassword} = req.body
    if(password !== confirmPassword){
        return res.status(422).json({message: 'Passwords do not match'})
    }
    if(!name || !email || !password || !confirmPassword){
        return res.status(422).json({message: 'Please fill in all fields'})
    }

    const userExist = await User.findOne({ email: email})
    if(userExist){
        return res.status(422).json({message: 'User already exists'})
    }
    try {
        //create password
        const salt = await bcrypt.genSalt(12)
        const hashedPassword = await bcrypt.hash(password, salt)
        //create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })
        //send res
        res.status(201).json({message: 'User created successfully', Dados: {user} })
    } catch (error) {
        console.error(error)
        return res.status(500).json({message: 'Something went wrong'})
    }
})

//Login User
router.post("/auth/login", async(req,res) => {
    const { email, password} = req.body
    const userExist = await User.findOne({ email: email})
    const checkPassword = await bcrypt.compare(password, userExist.password)

    //validations
    //check fields
    if (!email || !password){
        return res.status(422).json({message: 'Please fill in all fields'})
    }
    //search by email
    if(!userExist){
        return res.status(422).json({message: 'User does not exist'})
    }
    //check if passwords match
    if(!checkPassword){
        return res.status(422).json({message: 'Password is incorrect'})
    }

    try {
        const secret = process.env.SECRET
        //create token
        const token = jwt.sign({_id: userExist._id}, secret)
        res.status(200).json({msg: 'Login successful', token: {token}})
    } catch (error) {
        console.error(error)
        return res.status(422).json({message: 'Something went wrong'})
    }
})

//Private Route
//Check Token
function checkToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({error: 'No token, authorization denied'})
    }

    try {
        const secret = process.env.SECRET
        jwt.verify(token, secret)
        next()
    } catch (error) {
        console.error(error)
        res.status(400).json({error: 'Invalid Token'})
    }
}

router.get('/user/:id', checkToken, async (req, res) =>{
    const {id} = req.params
    //check if user exists
    const userExist = await User.findById(id, '-password')
    if(!userExist){
        return res.status(404).json({error: 'User not found'})
    }

    try {
        res.status(200).json({message: 'Authorized'})
    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'Something went wrong'})
    }

})

module.exports = router
