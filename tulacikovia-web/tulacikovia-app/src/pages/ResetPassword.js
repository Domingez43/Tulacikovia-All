import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RessetPassword.css';
import logoImage from '../images/tulacikovia_highres 2.png';
import leftImage from '../images/dog1.png';
import rightImage from '../images/dog2.png';
import axios from "axios";
import { toast } from "react-toastify";


const ResetPassword = () => {
  const url = window.location.href;
  const pathParts = url.split('/');
  const token = pathParts[pathParts.length - 1];

  const navigate = useNavigate();

  const [resetPasswords, setResetPasswords] = useState({
    newPassword: '',
    newPasswordRepated: '',
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordLengthValid, setPasswordLengthValid] = useState(true);

  const modalRef = useRef();

  const handleInputChange = (event) => {
    setResetPasswords({ ...resetPasswords, [event.target.name]: event.target.value });
    setPasswordMatch(true);
    setPasswordLengthValid(true);
  };

  const handleInputClick = () => {
    setPasswordMatch(true);
    setPasswordLengthValid(true);
  };

  const handleInputBlur = () => {
    if (resetPasswords.newPassword !== resetPasswords.newPasswordRepated) {
      setPasswordMatch(false);
      setPasswordLengthValid(true); // Reset length validation when passwords don't match
    }

    if (resetPasswords.newPassword.length < 8 ) {
      setPasswordLengthValid(false);
      setPasswordMatch(true); // Reset match validation when passwords are too short
    }
  };

  const handleOutsideClick = (event) => {
  
    if (resetPasswords.newPassword !== resetPasswords.newPasswordRepated) {
      setPasswordMatch(false);
    }

    if (resetPasswords.newPassword.length < 8 ) {
      setPasswordLengthValid(false);
    }
  };

  const handleRessetPasswrod = async (event) => {
    event.preventDefault();
    console.log("userdata", resetPasswords);
    const urlWithToken = `https://relyonproject.com/passwordReset/${token}`;

    try {
      const response = await axios.post(urlWithToken, {
        ...resetPasswords
      });

      console.log("response", response);

      if (response.data.message === "Password reset successful") {
        toast.success('Tvoje heslo bolo zmenené. Môžeš sa skúsiť prihlásiť.', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });

        navigate('/login');
      } else {
        console.error('Reset heslo fail');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [resetPasswords]);

  return (
    <div className="reg-container">
      <div className="image-container">
        <img src={leftImage} alt="Left image" className="image_dog" />
      </div>
      <form className="registration-form" >
        <img className="form-logo" src={logoImage} alt="Logo" />
        <h1>Resetuj svoje heslo</h1>
        <div className="form-group">
          <div className="input-group">
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={resetPasswords.newPassword}
              onChange={handleInputChange}
              onClick={handleInputClick}
              onBlur={handleInputBlur}
              placeholder={'Heslo'}
              style={{ borderColor: passwordLengthValid ? '' : 'red',
                       color: passwordLengthValid ? '' : 'red'  }}
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              id="newPasswordRepated"
              name="newPasswordRepated"
              value={resetPasswords.newPasswordRepated}
              onChange={handleInputChange}
              onClick={handleInputClick}
              onBlur={handleInputBlur}
              placeholder={'Opakuj heslo'}
              style={{ borderColor: passwordMatch && passwordLengthValid ? '' : 'red',
                       color: passwordMatch && passwordLengthValid ? '' : 'red' }}
            />
          </div>
          {!passwordMatch && !passwordLengthValid && (
              <p style={{ fontSize: '12px', color: 'red', textAlign: 'left' }}>Heslá sa nezhodujú a musia mať aspoň 8 znakov.</p>
            )}
            {!passwordMatch && passwordLengthValid && (
              <p style={{ fontSize: '12px', color: 'red', textAlign: 'left'}}>Heslá sa nezhodujú.</p>
            )}
            {passwordMatch && !passwordLengthValid && (
              <p style={{ fontSize: '12px', color: 'red', textAlign: 'left', }}>Heslo musí mať aspoň 8 znakov.</p>
            )}
          <button onClick={handleRessetPasswrod}>Resetovat</button>
        </div>
      </form>
      <div className="image-container2">
        <img src={rightImage} alt="Right image" className="image_dog2 flipped_image" />
      </div>
    </div>
  );
};

export default ResetPassword;
