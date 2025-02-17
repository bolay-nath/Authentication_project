import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE} from '../config/emailTemplate.js';

//this function is used to register the user
export const register = async (req, res) => {
    //first we get the name, email and password from the request body
    const { name, email, password } = req.body;
    //then we check if any of the fields is empty
    if(!name || !email || !password) {
        return res.status(400).json({success: false, message: "Please fill all fields"});
    }
    try {
        //we check if the user already exists
        const existingUser = await userModel.findOne({email});
        //if the user exists, we return an error message
        if(existingUser) {
            return res.status(400).json({success: false, message: "User already exists"});
        }
        //if the user does not exist, we hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        //then we create a new user with the name, email and hashed password
        const user = new userModel({name, email, password: hashedPassword});
        //then we save the user to the database
        await user.save();
        //then we generate a token for the user
        // the token contains the user's email and id
        const token = jwt.sign({email: user.email, id: user._id}, process.env.SECRET_KEY, {expiresIn: "7d"});
        //then we set the token as a cookie in the browser.
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            //this is user for cross site scripting
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        //then we send a verification email to the user
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: "Account Verification",
            text: `Click this link to verify your account: ${process.env.CLIENT_URL}/verify/${token}`,
        };
        await transporter.sendMail(mailOptions);

        //then we return a success message
        return res.status(200).json({success: true, message: "User created successfully"});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};

//this function is used to login the user
export const login = async (req, res) => { 
    const { email, password } = req.body;
    if(!email || !password) {
        return res.status(400).json({success: false, message: "Please fill all fields"});
    }
    try {
        const existingUser = await userModel.findOne({email});
        if(!existingUser) {
            return res.status(400).json({success: false, message: "Invalid User"});
        }
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if(!isMatch) {
            return res.status(400).json({success: false, message: "Wrong password"});
        }
        const token = jwt.sign({email: existingUser.email, id: existingUser._id}, process.env.SECRET_KEY, {expiresIn: "7d"});
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({success: true, message: "Login successful"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

//this function is used to logout the user
export const logout = (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });
        return res.status(200).json({success: true, message: "Logged out successfully"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

//this function is used to verify the user's account
//send the user a verification code to the user via email 
export const sendVerifyOtp = async (req, res) => {
    try{
        const {userID} = req.body;
        console.log(req.body);
        const user = await userModel.findById(userID);
        console.log("user",user);
        if(user.isAccountVerified){
            return res.status(400).json({success: false, message: "Account already verified"});
        }
        //generate a 6 digit otp
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
        await user.save();
        //send the otp to the user via email
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: user.email,
            subject: "Account Verification",
            //text: `Your OTP is ${otp}`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        };
        await transporter.sendMail(mailOptions);
        //return a success message
        return res.status(200).json({success: true, message: "OTP sent successfully"});
    } catch (error){
        res.json({success: false, message: error.message});
    }
};

//this function is used to verify the otp sent to the user
export const verifyEmail = async (req, res) => {
    const {userID, otp} = req.body;
    console.log(req.body);
    console.log("otp",otp);
    if(!otp || !userID){
        return res.status(400).json({success: false, message: "Please provide OTP"});
    } 

    try{
        const user = await userModel.findById(userID);
        console.log(user)
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }        
        if(user.isAccountVerified){
            return res.status(400).json({success: false, message: "Account already verified"});
        }
        if(user.verifyOtp === "" || user.verifyOtp !== otp){
            return res.status(400).json({success: false, message: "Invalid OTP"});
        }
        if(user.verifyOtpExpireAt < Date.now()){
            return res.status(400).json({success: false, message: "OTP expired"});
        }
        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;
        await user.save();
        return res.status(200).json({success: true, message: "Account verified successfully"});
    } catch (error){
        res.json({success: false, message: error.message});
    }
};

//check if the user is authenticated or not meaning if the user is logged-in or not
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({success: true, message: "Authenticated"});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};
//send the user a reset password otp
export const sendResetOtp = async (req, res) => {
    const {email} = req.body;
        if(!email){
            return res.status(400).json({success: false, message: "Please provide email"});
        };
        //find the user with the email
    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
        await user.save();
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: user.email,
            subject: "Reset Password",
            //text: `Your OTP is ${otp}`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        };
        await transporter.sendMail(mailOptions);
        return res.status(200).json({success: true, message: "OTP sent successfully"});
    } catch (error){
        res.json({success: false, message: error.message});
    }   
};
//reset the user's password
export const resetPassword = async (req, res) => {
    console.log(req.body);
    const {email, otp, newPassword} = req.body;
    console.log(email, otp, newPassword);
    if(!email || !otp || !newPassword){
        return res.status(400).json({success: false, message: "Please provide email, OTP and password 5"});
    }
    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }
        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.status(400).json({success: false, message: "Invalid OTP"});
        }
        if(user.verifyOtpExpireAt < Date.now()){
            return res.status(400).json({success: false, message: "OTP expired"});
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = "";
        user.verifyOtpExpireAt = 0;
        await user.save();
        return res.status(200).json({success: true, message: "Password reset successfully"});
    } catch (error){
        res.json({success: false, message: error.message});
    }
}