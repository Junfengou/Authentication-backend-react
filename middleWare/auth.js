//The purpose of this javascript class is to check which authenticated user is currently logged in
const jwt = require("jsonwebtoken");

//next is used to execute whenever the user is authenticated
const auth = (req, res, next) => {
    try {
        const token = req.header("x-auth-token");
        if(!token)
            return res.status(401).json({msg: "No authentication token, authorization denied"}) //status 401 is unauthorized access

        const verified = jwt.verify(token, process.env.JWT_SECRET)
        if(!verified)
            return res.status(401).json({msg: "Token verification failed, authorization denied"})

        console.log("verified: ", verified);
        req.user = verified.id;    
        //console.log("res user", res.user);
        next();
    }
    catch(err) {
        //500 is server error
        res.status(500).json({error: err.message});
    }
}

module.exports = auth;