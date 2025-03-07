import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from 'react-toastify';

const Login = () => {
    //for the navigate
    const navigate = useNavigate();
    //context
    const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);
    //initial state
    const [state, setState] = useState("Sign Up");
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    //when user submit the from the onSubmitHandler is called
    const onSubmitHandler = async (e) => {
        try {
            e.preventDefault();
            axios.defaults.withCredentials = true
            //sign Up setup
            if (state === "Sign Up") {
                const { data } = await axios.post(backendUrl + "/api/auth/register", { name, email, password })
                if (data.success) {
                    setIsLoggedIn(true)
                    getUserData()
                    navigate('/')
                    toast("Thanks Register")
                } else {
                    toast('Wow so easy !');
                }

            } else {
                //login setup
                const data = await axios.post(backendUrl + "/api/auth/login", { name, email, password })
                console.log(data)
                if (data.data.success) {
                    setIsLoggedIn(true)
                    getUserData()
                    navigate('/')
                    toast.success("Welcome Chief")
                } else {
                    console.log(data)
                    toast.error("Please try again")
                }
            }
            //catch the error
        } catch (error) {
            console.log(error.response.data)
            toast.error(error.response.data.message)
        }
    };
    return (
        <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to bg-purple-400">

            <img onClick={() => navigate("/")} src={assets.logo} alt="" className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer" />
            <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
                <h2 className="text-3xl font-semibold text-white text-center mb-3">{state === "Sign Up" ? "Create Account" : "Login"}</h2>
                <p className="text-center text-sm mb-6">{state === "Sign Up" ? "Create your Account" : "Login to you Account"}</p>
                {/*from is start from hear */}
                <form onSubmit={onSubmitHandler} >
                    {state === "Sign Up" && (
                        <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                            <img src={assets.person_icon} alt="" />
                            <input
                                onChange={e => setName(e.target.value)}
                                className="bg-transparent outline-none"
                                type="text"
                                placeholder="Full Name"
                                required />
                        </div>
                    )}

                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                        <img src={assets.mail_icon} alt="" />
                        <input onChange={e => setEmail(e.target.value)}
                            className="bg-transparent outline-none"
                            type="email"
                            placeholder="Email"
                            required />
                    </div>
                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                        <img src={assets.lock_icon} alt="" />
                        <input onChange={e => setPassword(e.target.value)}
                            className="bg-transparent outline-none"
                            type="password"
                            placeholder="Password"
                            required />
                    </div>
                    <p onClick={() => navigate("/reset-password")} className="md-4 text-indigo-500 cursor-pointer ">Forgot Password</p>
                    <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">{state}</button>
                </form>
                {state === "Sign Up" ?
                    (<p className="text-gray-400 text-center text-xs mt-4">Already have an account? {" "}
                        <span onClick={() => setState('Login')} className="text-blue-400 cursor-pointer underline" >Login here</span>
                    </p>)
                    :
                    (<p className="text-gray-400 text-center text-xs mt-4">Don't have an account? {" "}
                        <span onClick={() => setState('Sign Up')} className="text-blue-400 cursor-pointer underline" >Sign Up</span>
                    </p>)}
            </div>
        </div>
    );
};

export default Login;