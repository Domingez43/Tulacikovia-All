import React, {useState, useEffect} from "react";
import './Dashboard.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRight, faCalendarDays, faGear, faHandHoldingHand, faSignOutAlt} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";
import userImage from '../images/user.png';
import axios from 'axios';

const Dashboard = ({onClose}) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        userName: "",
        userEmail: "",
    });

    useEffect(() => {
        // Fetch user details when the component mounts
        getUserDetails();
    }, []); // Empty dependency array ensures the effect runs once on mount

    const getUserDetails = async () => {
        try {
            const token = localStorage.getItem('loginToken');

            const response = await axios.get('https://relyonproject.com/registration/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            console.log("response date dashboard", response.data);
            if (response.status === 200) {
                const userData = response.data;
                setUserData({
                    userName: userData.name,
                    userEmail: userData.email,
                });
            } else {
                console.error('Failed to fetch user details');
            }
        } catch (error) {
            console.error('Error during user details fetch:', error);
        }
    };

    const handleClick = () => {
        navigate("/events");
        window.location.reload();
    };

    const handleLogout = () => {
        localStorage.removeItem('loginToken');
        onClose();
        window.location.reload();
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard">
                <div className="heading">
                    <div className="arrow-icon" onClick={onClose}>
                        <FontAwesomeIcon icon={faArrowRight} style={{
                            position: "absolute",
                            left: "30px",
                            cursor: "pointer"
                        }} size="2x"/>
                    </div>
                    <h2>Dashboard</h2>
                </div>
                <div className="user-image-container">
                    <img src={userImage} alt="User" className="user-image"/>
                </div>
                <div className="user-info">
                    <p>Meno: {userData.userName}</p>
                    <p>Email: {userData.userEmail}</p>
                </div>

                <div className="widget" onClick={handleClick}>
                    <h3>Udalosti</h3>
                    <FontAwesomeIcon icon={faCalendarDays} size="2x"/>
                </div>
                <div className="widget" onClick={handleClick}>
                    <h3>Výzvy</h3>
                    <FontAwesomeIcon icon={faHandHoldingHand} size="2x"/>
                </div>
                <div className="widget">
                    <h3>Nastavenia</h3>
                    <FontAwesomeIcon icon={faGear} size="2x"/>
                </div>
            </div>
            <div className="logout-button">
                <FontAwesomeIcon icon={faSignOutAlt} size="2x"/>
                <span onClick={handleLogout}>Odhlásiť sa</span>
            </div>
        </div>
    );
};

export default Dashboard;

