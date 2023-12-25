import React, { useState } from 'react';
import { getEmailQuery } from '../../utils/queries';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { ToastContainer } from 'react-toastify';
import SignUp from './SignUp';
import wspIcon from '../assets/wspIcon.jpg';
import { client } from '../../client';
import bcrypt from 'bcryptjs';
import { notifyError } from '../../utils/notifications';

function Login({ setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [openSignUp, setOpenSignUp] = useState(false);
    const [wrongType, setWrongType] = useState(false);
    const [loading, setLoading] = useState(false);

    const loginUser = async (e) => {
        setUser(null)
        e.preventDefault();
        if (!email || !password) {
            notifyError('Enter email and password!');
        }
        else {

            const findEmail = getEmailQuery(email);
            const userData = await client.fetch(findEmail);

            if (userData.length === 0) {
                notifyError('Cannot find this email!')
            }
            else {
                bcrypt.compare(password, userData[0].password, function (err, isMatch) {
                    if (err) {
                        throw err;
                    }
                    else if (!isMatch) {
                        notifyError(`Password doesn't match! Enter correct password`);
                    }
                    else {
                        localStorage.setItem('UserId', userData[0]?._id);
                        window.location = "/";
                    }
                })
            }
        }
    }

    return (
        <div>
            <ToastContainer />
            <div className='innerLogin'>
                <div className='loginTitle'>Log i n </div>
                <img src={wspIcon} alt="icon" />
                {
                    openSignUp === true && (
                        <SignUp
                            setOpenSignUp={setOpenSignUp}
                            setWrongType={setWrongType}
                            wrongType={wrongType}
                            loading={loading}
                            setLoading={setLoading}
                        />
                    )
                }
                <form className='loginForm'>
                    <label htmlFor="email"> Email </label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Email'
                        type="email"
                        name="email"
                        required
                    />
                    <label htmlFor="email"> Password </label>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Password'
                        type="password"
                        name="password"
                        required
                    />
                    <button onClick={(e) => loginUser(e)} className={`${openSignUp === true && "hide"}`}>Login</button>
                    <p className='signUpBtn' onClick={() => setOpenSignUp(true)}>Sign Up</p>
                </form>
            </div>
        </div>
    )
}
export default Login;









