import React, { Component, useState, useRef, useEffect } from 'react';
import './Header.css';
import logoImage from '../images/tulacikovia_highres 2.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';
import {Link} from "react-router-dom";
import { useNavigate } from 'react-router-dom';


const Header = () => {

    const [showMenuModal, setMenuModal] = useState(false);
    const modalRef = useRef();
    const navigate = useNavigate();

    const handleOutsideClick = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setMenuModal(false);
         
        }
    };

    const handleLoginClick = () => {
        navigate("/login");
    }
    const handleMenuClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setMenuModal((prevMenuModal) => !prevMenuModal);
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
            <div className="header">
                <Link to="/">
                <img
                    src={logoImage}
                    alt="tul_logo"
                    className="logotul"
                ></img>
                </Link>
                <div className="options">
                    <div className="option">
                        <Link to="/events" className="link-black">UDALOSTI A VÝZVY</Link>

                    </div>

                </div>
                <div className="login">
                    <Link to="/login" className="link-black">Prihlasit sa</Link>
                    <FontAwesomeIcon onClick={handleLoginClick} icon={faUser} className="custom-icon" />
                </div>
                <div className="menu-icon" onClick={handleMenuClick}>
                    <FontAwesomeIcon icon={faBars} className='menu-icon'/>

                    {showMenuModal && (
                        <div ref={modalRef} className="menu-modal">
                   
                    <div className="modal-option">
                        <Link to="/home" className="modal-link-black">Udalosti</Link>
                    </div>
                    <div className="modal-option">
                        <Link to="/home" className="modal-link-black">Vyzvy</Link>

                    </div>
           
                <div className="modal-login">
                    <Link to="/login" className="modal-link-black">Prihlasit sa</Link>
                </div>
                   </div>
                )}
                </div>
            </div>
        );
    }

export default Header;
