import userModel from "../models/userModel.js";


export const getUserData = async (req, res) => {
    try {
        const {userID} = req.body;
        const user = await userModel.findById(userID);
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }
        res.json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
            }
        })
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};