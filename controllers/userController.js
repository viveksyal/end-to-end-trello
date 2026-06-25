const {userModel} = require("../models/models")
const bcrypt = require("bcrypt")
require("dotenv").config();
const JWT = require("jsonwebtoken");

const { UserSchema } = require("../schemas/schemas")


async function signup(req, res){
    try {
        const result = UserSchema.safeParse(req.body)

        if(!result.success){
            return res.status(403).json({
                message: "Invalid username or password format"
            })
        }

        const {username, password} = result.data;

        const userExists = await userModel.findOne({username})

        if(userExists){
            return res.status(409).json({
                message: "User with username already exists"
            })
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await userModel.create({
            username: username,
            password: hashedPassword
        })
        res.json({
            message: "You have signed up successfully",
            id: newUser._id
        })
    } catch (e) {
        console.error(e)
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

async function signin(req, res){
    try {
        const result = UserSchema.safeParse(req.body)

        if(!result.success){
            return res.status(403).json({
                message: "Invalid username or password format"
            })
        }

        const {username, password} = result.data;

        const userExists = await userModel.findOne({ username });
        
        if(!userExists){
            res.status(403).json({
                message: "Wrong credentials"
            })
            return;
        }

        const correctPassword = await bcrypt.compare(password, userExists.password)

        if(!correctPassword){
            return res.status(403).json({
                message: "Wrong credentials"
            })
        }

        const token = JWT.sign({
            userId: userExists._id
        }, process.env.JWT_SECRET);

        res.json({
            message: "You have signed in successfully",
            token
        })
    } catch (e) {
        console.error(e)
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

module.exports = {
    signup: signup,
    signin: signin
}