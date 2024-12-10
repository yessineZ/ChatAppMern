import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import generateTokenAndSetCookie from '../utils/generateToken.js';

export const signup = async (req, res) => {
    try {
        const { fullName, username, email, password, confirmPassword, gender ,profilePic } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).send({ error: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

       

        const hashedPassword = bcrypt.hashSync(password, 8);

        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword,
            gender,
            profilePic
        });
        generateTokenAndSetCookie(newUser._id,res) ; 
        if(newUser) {
            await newUser.save();
            res.status(201).json({
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            profilePic: newUser.profilePic , 
            gender : newUser.gender ,
            profilePic : newUser.profilePic, 
        });

        

        }

        

        
    } catch (error) {
        console.log("Error in signup controller:", error.message);
        res.status(500).send({ error: "Invalid request" });
    }

};

export const login  = async (req, res) => {
    try {
        const { username , password} = req.body ; 
        const user = await User.findOne({username}) ; 
        const isPasswordCorrect = await bcrypt.compareSync(password,user?.password  || "" ) ;  
        if(!isPasswordCorrect || !user) {
            console.log(isPasswordCorrect,user.username) ; 
            return res.status(401).json({ error: "Invalid credentials" });

        }
        generateTokenAndSetCookie(user._id,res) ;
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic
        })
    }catch(error) {
        console.log("Error in login controller:", error.message);
        res.status(500).send({ error: "Invalid request" });
    } 
};

export const logout = (req, res) => {
    try {
    res.clearCookie("jwt")  ;
    res.status(200).json({message : "logged out successfully "});
    }catch(error) {
        console.log("Error in logout controller:", error.message);
        res.status(500).send({ error: "Invalid request" });
    }

};


