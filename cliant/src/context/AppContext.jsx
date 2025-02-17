import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials = true;

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(false);
    
    //this function check the use authenticate or not.
    const getAuthState = async () => {
        try{
            const {data} = await axios.get(backendUrl + "/api/auth/is-auth")
            if(data.success){
                setIsLoggedIn(true)
                getUserData()
            }
        }catch(error){
            toast.error(error.message)
        }
    }
    //this function help to get the user data when user login or signup. if we find the user data we set the data in a state.
    const getUserData = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/user/data")
            data.success ? setUserData(data.userData) : toast.error(data.message)
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };
    useEffect(()=>{getAuthState()},[])
    //this value is use for context and we pass some state in a object format.
    const value = {
        backendUrl,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        getUserData
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
};

