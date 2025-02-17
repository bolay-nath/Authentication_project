import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useContext, useState } from "react";
import React from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
    const { backendUrl } = useContext(AppContext);
    axios.defaults.withCredentials = true;

    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [email, setEmail] = useState('');

    //those state use for navigate the from in step by step.
    const [isEmailSent, setIsEmailSent] = useState('')
    const [otp, setOtp] = useState('')
    const [isOtpSubmitted, setIsOtpSubmitted] = useState('')

    //those function handle the input method in the otp from 
    const inputRefs = React.useRef([]);

    const handleInput = (e, index) => {
        if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };
    const heandleKeyDown = (e, index) => {
        if (e.key === "Backspace" && e.target.value === "" && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };
    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text');
        const pasteArray = paste.split('');
        pasteArray.forEach((char, index) => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = char;
            }
        })
    };
    //when use submit the Email.
    const onSubmitEmail = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email })
            data.success ? toast.success(data.success) : toast.error(data.message)
            data.success && setIsEmailSent(true)
        } catch (error) {
            toast.error(error.message)
        }
    };
    //then On submit the opt
    const onSubmitOTP = async (e) => {
        e.preventDefault();
        const otpArray = inputRefs.current.map(e => e.value)
        setOtp(otpArray.join(''))
        setIsOtpSubmitted(true)

    };
    const onSubmitNewPassword = async (e) => {
        e.preventDefault();
        try {
            const {data} = await axios.post(`${backendUrl}/api/auth/reset-password`, { email, otp,newPassword }) 
            data.success ? toast.success(data.success) : toast.error(data.message)
            data.success && navigate('/login')
        } catch (error) {
            toast.error(error.message)
        }
    };
    return (
        <div className="flex items-center justify-center min-h-screen  bg-gradient-to-br from-blue-200 to bg-purple-400">
            <img onClick={() => navigate('/')} src={assets.logo} alt="" className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer" />
            {/*this is use for enter the email id when user reset the password */}

            {!isEmailSent &&
                <form onSubmit={onSubmitEmail} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
                    <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset Password</h1>
                    <p className="text-center mb-6 text-indigo-300">Enter you registered email address</p>
                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                        <img className="w-3 h-3" src={assets.mail_icon} alt="" />
                        <input onChange={e => setEmail(e.target.value)}
                            className="bg-transparent outline-none text-white"
                            type="email"
                            placeholder="Email"
                            required />
                    </div>
                    <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">Submit</button>
                </form>
            }
            {/*Opt input form */}
            {!isOtpSubmitted && isEmailSent &&
                <form onSubmit={onSubmitOTP} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
                    <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset Password OTP</h1>
                    <p className="text-center mb-6 text-indigo-300">Enter the 6-digit code to reset you Password</p>
                    <div className="flex justify-between mb-8 " onPaste={handlePaste}>
                        {Array(6).fill(0).map((_, index) => (
                            <input
                                type="text"
                                maxLength="1"
                                key={index}
                                required
                                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                                ref={e => inputRefs.current[index] = e}
                                onInput={(e) => handleInput(e, index)}
                                onKeyDown={(e) => heandleKeyDown(e, index)}
                            />
                        ))}
                    </div>
                    <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium ">Submit</button>
                </form>
            }
            {/*enter new password form */}
            {isOtpSubmitted && isEmailSent &&
                <form onSubmit={onSubmitNewPassword} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
                    <h1 className="text-white text-2xl font-semibold text-center mb-4">Reset Password</h1>
                    <p className="text-center mb-6 text-indigo-300">Enter you new Password</p>
                    <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                        <img className="w-3 h-3" src={assets.lock_icon} alt="" />
                        <input onChange={e => setNewPassword(e.target.value)}
                            className="bg-transparent outline-none text-white"
                            type="password"
                            placeholder="Password"
                            required />
                    </div>
                    <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">Reset the Password</button>
                </form>
            }
        </div>
    );
};

export default ResetPassword;