import React, { useState, useEffect, useRef } from 'react';
import { getUsersEmailQuery } from '../../utils/queries';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { uploadImageFunc } from '../../utils/helperFunctions';
import { DeleteOutlined } from '@ant-design/icons';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { client } from '../../client';
import Spinner from '../Spinner'
import { notifyError, notifySuccess } from '../../utils/notifications';
import emailjs from '@emailjs/browser'


const SignUp = ({ setOpenSignUp, setWrongType, loading, setLoading }) => {
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [userName, setUserName] = useState("");
    const [userImage, setUserImage] = useState(null);
    const [allUsers, setAllUsers] = useState(null);
    const [systemPass, setSystemPass] = useState("");
    const passForAuth = process.env.REACT_APP_AUTH_PASSWORD;
    const form = useRef();

    const sendEmail = (e) => {
        e.preventDefault();
        emailjs.sendForm('service_i1urlyp', 'template_p31e4f8', form.current, '0lCv8iZyK1pEp-5YF')
            .then((result) => {
                console.log(result.text);
            }, (error) => {
                console.log(error.text);
            });

    }

    const signUpUser = (e) => {
        e.preventDefault();
        if (!userName) {
            notifyError('Enter your name!');
        }
        else if (!userPassword) {
            notifyError('Create password!');
        }
        else if (!userEmail) {
            notifyError('Enter email address!');
        }
        else if (!systemPass) {
            notifyError('Enter organization password!');
        }
        else if (userImage == null) {
            notifyError('Select image!');
        }
        else {
            let checkEmail = validator.isEmail(userEmail);
            if (checkEmail === true) {
                const hashedPassword = bcrypt.hashSync(userPassword, 10);
                let machedEmail = allUsers.find(value => value.email === userEmail);
                if (machedEmail) {
                    notifyError('This email address is already in system! Try a new one or login');
                }
                else if (systemPass !== passForAuth) {
                    notifyError('Organization password is not correct, try again or contact your supervisor');
                }
                else {
                    const userObj = {
                        _type: 'user',
                        userName: userName,
                        image: {
                            _type: 'image',
                            asset: {
                                _type: 'reference',
                                _ref: userImage?._id
                            }
                        },
                        email: userEmail,
                        password: hashedPassword,
                        status: 'user'
                    };

                    client.create(userObj)
                        .then(() => {
                            notifySuccess('User was created!');
                            sendEmail(e);
                            setTimeout(() => {
                                window.location.reload()
                            }, 3000)
                        })
                        .catch((err) => {
                            notifyError(err);
                        })
                }
            }
            else {
                notifyError('Email is not valid! Make sure to use the right format');
            }
        }
    }

    useEffect(() => {
        const query = getUsersEmailQuery();
        client.fetch(query)
            .then((data) => {
                setAllUsers(data);
            })
    }, []);

    return (
        <form className='signUpModel' ref={form}>
            <div className='imageSection'>
                {
                    loading && <div><Spinner message="Loading.." /> </div>
                }
                {
                    !userImage && !loading &&
                    <label className='userImgUploader'>
                        <div className='imageUploadBtn'>
                            <AiOutlineCloudUpload className='uploadIcon' />
                            <p>Select Image</p>
                        </div>
                        <input
                            required
                            type='file'
                            onChange={(e) => uploadImageFunc(e, setWrongType, setLoading, setUserImage)}
                            className='inputUploader'
                            name='user-image-uploader'
                        />
                    </label>
                }
                {
                    userImage &&
                    <div className='profileImg'>
                        <img
                            src={userImage?.url}
                            alt='user-image'
                        />
                    </div>
                }
            </div>
            {
                userImage &&
                <div className='resetImageBox'>
                    <DeleteOutlined
                        title='reset image'
                        onClick={() => setUserImage(null)}
                        className='resetImageIcon'
                    />
                </div>

            }
            <label htmlFor="name"> Full Name </label>
            <input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder='Full Name'
                type="text"
                name="name"
                required
            />

            <label htmlFor="email"> Email </label>
            <input
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder='Email'
                type="email"
                name="email"
                required
            />

            <label htmlFor="password"> Password </label>
            <input
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder='Password'
                type="password"
                name="password"
                required
            />

            <label htmlFor="organization password"> Organization Password </label>
            <input
                value={systemPass}
                onChange={(e) => setSystemPass(e.target.value)}
                placeholder='Organization Password'
                type="password"
                name='organization password'
                required
            />

            <div className='signUpBtns'>
                <button onClick={(e) => signUpUser(e)} type="submit" value="Send">Submit</button>
                <button onClick={() => setOpenSignUp(false)}>Close</button>
            </div>

        </form>
    )
}

export default SignUp;