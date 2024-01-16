// RegistrationForm.js
import React, {useState} from 'react';
import './RegistrationForm.css';
import logoImage from '../images/tulacikovia_highres 2.png';
import leftImage from '../images/dog1.png';
import rightImage from '../images/dog2.png';
import {Link, useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import {toast} from "react-toastify";

const RegistrationForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        contact: '',
        profile_name: '',
        formal_name: '',
        civic_ass: '',
        street: '',
        number: '',
        town: '',
        password: '',
        conf_password: '',
        ico: '',
        iban: '',
        description: '',
    });

    const navigate = useNavigate();

    const validateEmail = async () => {
        const { email } = formData.contact;

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

    const handleInputChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleInputClick = (event) => {
        if (!formData[event.target.name]) {
            setFormData({ ...formData, [event.target.name]: ' ' });
        }
    };

    const handleInputBlur = (event) => {
        if (!formData[event.target.name]) {
            setFormData({ ...formData, [event.target.name]: '' });
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const isEmailValid = await validateEmail();

        if (!isEmailValid) {
            console.error('Invalid email');
            return;
        }

        // Validate the form data (e.g., check if passwords match)
        if (formData.password !== formData.conf_password) {
            console.error('Passwords do not match');
            toast.error("Heslá sa nezhodujú!")
            return;
        }

        // Your registration API endpoint
        const registrationApiUrl = 'https://relyonproject.com/register';
        try {
            const response = await axios.post(registrationApiUrl, {
                email: formData.contact,
                password: formData.password,
                repeatedPassword: formData.conf_password,
            });

            if (response.status === 200) {
                console.log('Registration successful');
                localStorage.setItem('registrationToken', response.data.token);
                const registrationToken = localStorage.getItem('registrationToken');
                console.log("token:", registrationToken);

                const finishRegistrationApiUrl = 'https://relyonproject.com/registration/organisation/email/finish';
                try {
                    const finishRegistrationResponse = await axios.post(finishRegistrationApiUrl, { formal_name: formData.formal_name,
                        formal_type : formData.civic_ass, identification_number : formData.ico, bank_contact : formData.iban, profile_name: formData.profile_name
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${registrationToken}`,
                            },
                        }

                    );

                    if (finishRegistrationResponse.status === 200) {
                        console.log('Finish registration successful');
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


        return (
            <div className="reg-container">
                <div className="back-button">
                    <Link to="/login">
                        <FontAwesomeIcon icon={faArrowLeft} size="2x" color="black"/>
                    </Link>
                    <span className="back-text">Späť</span>
                </div>
                <div className="image-container">
                    <img src={leftImage} alt="Left image" className="image_dog" />
                </div>
                 <form className="registration-form">
                    <img className="form-logo" src={logoImage} alt="Logo" />
                    <h1>Zaregistruj svoj útulok</h1>
                    <div className="form-group1">
                        <div className="input-group">
                            <input
                                type="text"
                                id="contact"
                                name="contact"
                                value={formData.contact}
                                onChange={handleInputChange}
                                placeholder={"kontakt@organizacia.com"}
                            />
                            <label htmlFor="contact" className={formData.contact? "input-label input-label-hidden" : "input-label"}></label>
                        </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <input
                                    type="text"
                                    id="profile_name"
                                    name="profile_name"
                                    value={formData.profile_name}
                                    onChange={handleInputChange}
                                    placeholder={"Názov profilu"}
                                />
                                </div>
                            <div className="input-group">

                            <label htmlFor="profile_name" className={formData.profile_name ? "input-label input-label-hidden" : "input-label"}></label>
                                <input
                                    type="text"
                                    id="formal_name"
                                    name="formal_name"
                                    value={formData.formal_name}
                                    onChange={handleInputChange}
                                    placeholder={"Formálny názov"}
                                />
                                <label htmlFor="formal_name" className={formData.formal_name ? "input-label input-label-hidden" : "input-label"}></label>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <input
                                    type="text"
                                    id="civic_ass"
                                    name="civic_ass"
                                    value={formData.civic_ass}
                                    onChange={handleInputChange}
                                    placeholder={"Občianske združenie"}
                                />
                             </div>
                                <label htmlFor="civic_ass" className={formData.civic_ass ? "input-label input-label-hidden" : "input-label"}></label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    id="street"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleInputChange}
                                    placeholder={"Ulica"}
                                />
                             </div>
                                <label htmlFor="street" className={formData.street ? "input-label input-label-hidden" : "input-label"}></label>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <input
                                    type="text"
                                    id="number"
                                    name="number"
                                    value={formData.number}
                                    onChange={handleInputChange}
                                    placeholder={"Číslo"}
                                />
                                <label htmlFor="number" className={formData.number ? "input-label input-label-hidden" : "input-label"}></label>
                                <input
                                    type="text"
                                    id="town"
                                    name="town"
                                    value={formData.town}
                                    onChange={handleInputChange}
                                    placeholder={"Obec"}
                                />
                                <label htmlFor="town" className={formData.town ? "input-label input-label-hidden" : "input-label"}></label>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder={"Heslo"}
                                />
                            </div>
                            <div className="check-pass">
                                <div className="centered-container">
                                    <input type="checkbox" checked={showPassword} onChange={toggleShowPassword} />
                                    <p>Ukáž heslo</p>
                                </div>
                            </div>
                            <div className="input-group">
                            <label htmlFor="password" className={formData.password ? "input-label input-label-hidden" : "input-label"}></label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="conf_password"
                                    name="conf_password"
                                    value={formData.conf_password}
                                    onChange={handleInputChange}
                                    placeholder={"Potvrď heslo"}
                                />
                                <label htmlFor="conf_password" className={formData.conf_password ? "input-label input-label-hidden" : "input-label"}></label>
                            </div>
                        </div>
                     <div className="form-group">
                            <div className="input-group">
                                <input
                                    type="text"
                                    id="ico"
                                    name="ico"
                                    value={formData.ico}
                                    onChange={handleInputChange}
                                    placeholder={"ICO"}
                                />
                                <label htmlFor="ico" className={formData.ico? "input-label input-label-hidden" : "input-label"}></label>
                            </div>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        id="iban"
                                        name="iban"
                                        value={formData.iban}
                                        onChange={handleInputChange}
                                        placeholder={"IBAN"}
                                    />
                                    <label htmlFor="ico" className={formData.iban? "input-label input-label-hidden" : "input-label"}></label>
                                </div>
                                <div className="input-group" id="description">
                                    <textarea
                                    type="text"
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder={"Popis"}
                                />
                                <label htmlFor="description" className={formData.description ? "input-label input-label-hidden" : "input-label"}></label>
                                </div>
                            </div>
                    <button className="register_button" onClick={handleSubmit} type="submit">Registrovať</button>
                        </form>
                <div className="image-container2">
                    <img src={rightImage} alt="Right image" className="image_dog2 flipped_image" />
                </div>
            </div>

        );
}

export default RegistrationForm;
