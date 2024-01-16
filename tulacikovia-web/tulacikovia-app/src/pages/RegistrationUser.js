import React from 'react';
import './RegistrationUser.css';
import logoImage from '../images/tulacikovia_highres 2.png';
import leftImage from '../images/dog1.png';
import rightImage from '../images/dog2.png';
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {useNavigate} from "react-router-dom";
import {useState} from "react";

const RegistrationUser = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [userData, setUserData] = useState({
        name:'',
        email: '',
        password: '',
        repeatedPassword: '',
    });

    const navigate = useNavigate();

    const handleInputChange = (event) => {
        setUserData({ ...userData, [event.target.name]: event.target.value });
    };

    const handleInputClick = (event) => {
        if (!userData[event.target.name]) {
            setUserData({ ...userData, [event.target.name]: ' ' });
        }
    };

    const handleInputBlur = (event) => {
        if (!userData[event.target.name]) {
            setUserData({ ...userData, [event.target.name]: '' });
        }
    };

    const validateEmail = async () => {
        const { email } = userData;

        try {
            const response = await axios.post('https://relyonproject.com/isEmailAvailable', {
                email: email,
            });

            if (response.status !== 200) {
                // Handle error, show an error toast
                toast.error('Email validation failed');
                return false;
            }

            const responseData = response.data;

            if (responseData) {
                toast.success('Email is available');
                console.log("email available");
                return true;
            } else {
                toast.error('Email is already in use');
                return false;
            }
        } catch (error) {
            toast.error('Error during email validation');
            console.error('Error during email validation:', error);
            return false;
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const isEmailValid = await validateEmail();

        if (!isEmailValid) {
            console.error('Invalid email');
            return;
        }

        // Validate the form data (e.g., check if passwords match)
        if (userData.password !== userData.repeatedPassword) {
            console.error('Passwords do not match');
            return;
        }

        // Your registration API endpoint
        const registrationApiUrl = 'https://relyonproject.com/register';
        try {
            const response = await axios.post(registrationApiUrl, {
                email: userData.email,
                password: userData.password,
                repeatedPassword: userData.repeatedPassword,
            });

            if (response.status === 200) {
                console.log('Registration successful');
                localStorage.setItem('registrationToken', response.data.token);
                const registrationToken = localStorage.getItem('registrationToken');

                const finishRegistrationApiUrl = 'https://relyonproject.com/registration/user/email/finish';
                try {
                    const finishRegistrationResponse = await axios.post(finishRegistrationApiUrl, { name: userData.name },
                        {
                            headers: {
                                Authorization: `Bearer ${registrationToken}`,
                            },
                        }

                    );

                    if (finishRegistrationResponse.status === 200) {
                        console.log('Finish registration successful');
                        // Redirect to the login page or perform additional actions
                        navigate('/login');
                        // Show success toast
                        toast.success('Successfully registered. You can now log in.');
                        navigate('/login');
                    } else {
                        console.error('Finish registration failed');
                    }
                } catch (finishRegistrationError) {
                    console.error('Error finishing registration:', finishRegistrationError);
                }
                // Show success toast
                toast.success('Successfully registered. You can now log in.');
                // You can perform additional actions here, if needed
            } else {
                console.error('Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="reg-container">
            <div className="back-button-user">
                <Link to="/login">
                    <FontAwesomeIcon icon={faArrowLeft} size="2x" color="black"/>
                </Link>
            </div>
            <div className="image-container">
                <img src={leftImage} alt="Left image" className="image_dog" />
            </div>
            <form className="registration-form" onSubmit={handleSubmit}>
                <img className="form-logo" src={logoImage} alt="Logo" />
                <h1>Zaregistruj sa</h1>
                <div className="form-group1">
                    <div className="input-group">
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={userData.name}
                            onChange={handleInputChange}
                            onClick={handleInputClick}
                            onBlur={handleInputBlur}
                            placeholder={"Meno"}
                        />
                        <label htmlFor="name" className={userData.name ? "input-label input-label-hidden" : "input-label"}></label>
                    </div>
                </div>
                <div className="form-group">
                    <div className="input-group">
                        <input
                            type="text"
                            id="email"
                            name="email"
                            value={userData.email}
                            onChange={handleInputChange}
                            onClick={handleInputClick}
                            onBlur={handleInputBlur}
                            placeholder={"Email"}
                        />
                    </div>
                    <label htmlFor="email" className={userData.email ? "input-label input-label-hidden" : "input-label"}></label>
                </div>
                <div className="form-group">
                    <div className="input-group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={userData.password}
                            onChange={handleInputChange}
                            onClick={handleInputClick}
                            onBlur={handleInputBlur}
                            placeholder={"Heslo"}
                        />
                        <label htmlFor="password" className={userData.password ? "input-label input-label-hidden" : "input-label"}></label>
                    </div>
                    <div className="check-pass">
                        <div className="centered-container">
                            <input type="checkbox" checked={showPassword} onChange={toggleShowPassword} />
                            <p>Ukáž heslo</p>
                        </div>
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            id="repeatedPassword"
                            name="repeatedPassword"
                            value={userData.repeatedPassword}
                            onChange={handleInputChange}
                            onClick={handleInputClick}
                            onBlur={handleInputBlur}
                            placeholder={"Potvrď heslo"}
                        />
                        <label htmlFor="repeatedPassword" className={userData.repeatedPassword ? "input-label input-label-hidden" : "input-label"}></label>
                    </div>
                </div>
                <button className="register-button" type="submit">Registrovať</button>
            </form>
            <div className="image-container2">
                <img src={rightImage} alt="Right image" className="image_dog2 flipped_image" />
            </div>
        </div>
    );
};

export default RegistrationUser;
