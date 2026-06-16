const JWT =  require("jsonwebtoken")
require("dotenv");

function authMiddleware(req, res, next){
    const token = req.headers.token;

    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    if(userId){
        req.userId = userId
        next()
    }else{
        res.status(403).json({
            message: "Incorrect token"
        })
        return;
    }
}

module.exports = {authMiddleware};