const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleWare/auth");

router.post("/register", async (req, res) => {

    try{
        let { email, password, passwordCheck, displayName } = req.body;


        //validation

        //If these fields are not populated, display this as bad request
        if(!email || !password || !passwordCheck)
        {
            return res.status(400).json({msg: "Not all fields have entered"});
        }

        if(password.length < 5 )
        {
            return res.status(400).json({msg: "Password need to be at least 5 characters or more"});
        }

        if(password !== passwordCheck)
        {
            return res.status(400).json({msg: "Enter the same password twice for verification"});
        }

        const existingUSer = await User.findOne({ email: email })

        if(existingUSer)
            return res.status(400).json({msg: "Account with this email already exist"});

        if(!displayName) displayName = email;

        /* MUST STORE PASSWORDS IN HASH */
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("Password hashing: ",passwordHash)

        //saving the new user
        const newUser = new User({
            email,
            password: passwordHash,
            displayName,
        });

        const savedUser = await newUser.save();
        res.json(savedUser);
    }
    catch(err) {
        //500 is server error
        res.status(500).json({error: err.message});
    }
})

/* LOGIN route */

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        //validation
        if(!email || !password)
            return res.status(400).json({msg: "Not all fields have entered"});

        /*Find and see if the user exist (if email matches email being brought in)
            if user not exist */
        const user = await User.findOne({email: email});
        if(!user)
            return res.status(400).json({msg: "No account with this email has been registered"});

        //user.password is the hashed version of password from above post request.
        const isMatched = await bcrypt.compare(password, user.password);
        if(!isMatched)
            return res.status(400).json({msg: "Invalid credential"});
        
        //user._id is a unique ID generated when the user is created
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({
            token,
            user: {
                id: user._id,
                displayName: user.displayName,
            }
        })

        //token is used to validate the user upon login
        console.log("This is the JWT token: ", token);

        
    }
    catch(err) {
        //500 is server error
        res.status(500).json({error: err.message});
    }
})

/**
 * The auth is a middleware used to detect which user is logged in
 */
router.delete("/delete", auth, async (req, res) => {
    try {
        console.log(req.user)
        const deletedUser = await User.findByIdAndDelete(req.user);
        res.json(deletedUser);
    }
    catch(err) {
        //500 is server error
        res.status(500).json({error: err.message});
    }
})

/*
    This is just an extra method for validating the token, not necessary. Just for testing
*/
router.post("/tokenIsValid", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if(!token) return res.json(false)
            
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        if(!verified) return res.json(false);
        
        const user = await User.findById(verified.id);
        if(!user) return res.json(false);

        return res.json(true);
        
    }
    catch(err) {
        //500 is server error
        res.status(500).json({error: err.message});
    }
})


router.get("/", auth, async (req, res) => {
    const user = await User.findById(req.user);
    res.json({
        displayName: user.displayName, 
        id: user._id,
    });
} )


module.exports = router;