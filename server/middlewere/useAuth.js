import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    //we get the token from the cookies
    const token = req.cookies.token;
    //if the token is not present, we return an error message
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        //we use verify method to decode the token. Then we find a user id email 

        const tokenDecoded = jwt.verify(token, process.env.SECRET_KEY);
        //if the token is verified, we set the user id in the request body
        //and call the next function the next function used to call the next middleware. In this case, the next middleware is the controller function. The controller function is the function that is called when the route is hit.
        if(tokenDecoded.id) {
            req.body.userID = tokenDecoded.id;
            console.log(req.body.userID);
            console.log("tokenDecoded",tokenDecoded);
            console.log("tokenDecoded.id",tokenDecoded.id);
        } else {
            return res.status(401).json({ success: false, message: "Unauthorized Login Again" });
        }
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
export default userAuth;