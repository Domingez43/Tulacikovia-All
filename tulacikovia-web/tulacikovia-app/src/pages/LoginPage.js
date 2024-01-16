import React, {useState, useRef, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import './RegistrationUser.css';
import logoImage from '../images/tulacikovia_highres 2.png';
import leftImage from '../images/dog1.png';
import rightImage from '../images/dog2.png';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";
import axios from "axios";
import {toast} from "react-toastify";
import {GoogleLogin} from "@react-oauth/google";
import {GoogleOAuthProvider} from "@react-oauth/google";

const LoginPage = () => {
    const [userData, setUserData] = useState({
        email: '',
        password: '',
    });
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [isEmailRegistered, setIsEmailRegistered] = useState(true);
    const [emailForReset, setEmailForReset] = useState('');
    const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
    const [showPasswordResetModalSucces, setShowPasswordResetModalSucces] = useState(false);
    const modalRef = useRef();
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        console.log("userdata", userData);
        try {
            const response = await axios.post('https://relyonproject.com/login', {
                email: userData.email,
                password: userData.password
            });
            console.log("response", response);

            if (response.status === 200) {
                toast.success("Super si prihlaseny");
                localStorage.setItem('loginToken', response.data.token);
                navigate('/');
                window.location.reload();
            } else {
                console.error('Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    const handleSendEmail = async (event) => {
        event.preventDefault();
        console.log("user email", emailForReset);
        try {
            const response = await axios.post('https://relyonproject.com/sendResetMail', {
                email: emailForReset,
            });
            console.log("response", response);

            if (response.data.message === "Email sent.") {
                setShowPasswordResetModal(false);
                setShowPasswordResetModalSucces(true);
                setEmailForReset('');
                setIsEmailRegistered(true);
                toast.success("Bol ti poslaný email");

                // Successfully sent reset email
            } else {
                setIsEmailRegistered(false)
                // Handle send reset email error
                toast.warn('Ucet s tymto emailom neexistuje', {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
                console.error('Send reset email failed');
            }
        } catch (error) {
            // Handle network error or other exceptions
            console.error('Error during sending reset email:', error);
        }
    };

    const handleGoogleLoginFailure = (error) => {
        // Handle failed Google login
        console.error('Google login failed', error);
    };

    const handleInputChange = (event) => {
        setUserData({...userData, [event.target.name]: event.target.value});
    };

    const handleInputClick = (event) => {
        if (!userData[event.target.name]) {
            setUserData({...userData, [event.target.name]: ''});
        }
    };

    const handleInputBlur = (event) => {
        if (!userData[event.target.name]) {
            setUserData({...userData, [event.target.name]: ''});
        }
    };

    const handleOutsideClick = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setEmailForReset('');
            setIsEmailRegistered(true);
            setShowRegistrationModal(false);
            setShowPasswordResetModal(false);
            setShowPasswordResetModalSucces(false);
        }
    };


    const handleRegistrationClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setShowRegistrationModal(true);
    };

    const handlePasswordResetClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setShowPasswordResetModal(true);
    };


    const handleNavigation = (path) => {
        setShowRegistrationModal(false);
        navigate(path);
    };

    const handleGoogleLoginSuccess = () => {
        console.log(`Successfully logged in`);
        toast.success(`Successfully logged in`);
    };

    useEffect(() => {
        // Add an event listener to the document for outside clicks
        document.addEventListener('click', handleOutsideClick);

        // Remove the event listener when the component is unmounted
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

    return (
        <div className="reg-container">
            <div className="back-button-user">
                <Link to="/">
                    <FontAwesomeIcon icon={faArrowLeft} size="2x" color="black"/>
                </Link></div>
            <div className="image-container">
                <img src={leftImage} alt="Left image" className="image_dog"/>
            </div>
            <form className="registration-form" onSubmit={handleLogin}>
                <img className="form-logo" src={logoImage} alt="Logo"/>
                <h1>Prihlás sa</h1>
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
                            placeholder={'Email'}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email"
                               className={userData.email ? 'input-label input-label-hidden' : 'input-label'}></label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={userData.password}
                            onChange={handleInputChange}
                            onClick={handleInputClick}
                            onBlur={handleInputBlur}
                            placeholder={'Heslo'}
                        />
                        <label htmlFor="password"
                               className={userData.password ? 'input-label input-label-hidden' : 'input-label'}></label>
                    </div>
                </div>
                <div className="login_issue">
                    <button onClick={handleLogin}>Prihlásiť sa</button>
                    <h5 onClick={handlePasswordResetClick}>Zabudol si heslo?</h5>
                    {showPasswordResetModal && (
                        <div ref={modalRef} className="ressetpassword-modal">
                            <img className="form-logo" src={logoImage} alt="Logo"/>
                            <h2>Zabudol si svoje heslo?</h2>
                            <p>Prosím, zadajte svoj email nižšie, a my vám zašleme odkaz </p>
                            <p>na obnovenie hesla.</p>
                            <div className="input-group">
                                <input
                                    style={{border: isEmailRegistered ? '1px solid #ccc' : '1px solid red'}}
                                    type="text"
                                    id="resetemail"
                                    name="resetemail"
                                    value={emailForReset}
                                    onChange={(event) => setEmailForReset(event.target.value)}
                                    onClick={handleInputClick}
                                    onBlur={handleInputBlur}
                                    placeholder={'Email'}
                                />
                            </div>
                            {!isEmailRegistered && (
                                <p className='input-message-wrong'>
                                    Účet s týmto e-mailom neexistuje.
                                </p>)}
                            <button onClick={handleSendEmail}>Poslať</button>


                            <p>Máš problém? Tak nás kontaktuj.</p>
                            <p>Kontaktný formulár</p>
                        </div>
                    )}
                </div>
                {showPasswordResetModalSucces && (
                    <div ref={modalRef} className="ressetpassword-modal">
                        <img className="form-logo" src={logoImage} alt="Logo"/>
                        <h2>Našli sme tvoj účet</h2>
                        <p>Na email ktorý si zadal {' '} <strong>
                            {emailForReset.slice(0, 4)}
                            {emailForReset.slice(4, emailForReset.indexOf('@')).replace(/./g, '*')}
                            {emailForReset.slice(emailForReset.indexOf('@'))}
                        </strong>
                        </p>
                        <p>sme ti zaslali link pre resetovanie hesla.</p>
                        <button onClick={() => setShowPasswordResetModalSucces(false)}>Zatvoriť</button>
                        <p>Máš problém? Tak nás kontaktuj.</p>
                        <p>Kontaktný formulár</p>
                    </div>
                )}
                <div className="new_account">
                    <h2>
                        Ešte nemáš účet? <span onClick={handleRegistrationClick}>Registruj sa</span>
                    </h2>
                </div>

                {showRegistrationModal && (
                    <div ref={modalRef} className="registration-modal">
                        <h2>Registrovať sa ako:</h2>
                        <button onClick={() => handleNavigation('/registration')}>Subjekt</button>
                        <button onClick={() => handleNavigation('/registration_user')}>Jednotlivec</button>
                    </div>
                )}
                <div className="alt_login">
                    <h4>
                        alebo
                    </h4>
                    {/* End of Facebook Login */}
                    <GoogleOAuthProvider
                        clientId="333475848886-k586jfo2k8bok3ngd0g0m9opfql6m76i.apps.googleusercontent.com">
                        <GoogleLogin
                            clientId="333475848886-k586jfo2k8bok3ngd0g0m9opfql6m76i.apps.googleusercontent.com"
                            buttonText="Login with Google"
                            onSuccess={handleGoogleLoginSuccess}
                            onFailure={handleGoogleLoginFailure}
                            cookiePolicy={'single_host_origin'}
                        />
                    </GoogleOAuthProvider>
                </div>
            </form>
            <div className="image-container2">
                <img src={rightImage} alt="Right image" className="image_dog2 flipped_image"/>
            </div>
        </div>
    );
};
export default LoginPage;

