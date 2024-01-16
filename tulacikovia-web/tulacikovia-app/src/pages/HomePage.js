import React, { useState } from "react";
import './HomePage.css';
import DogImage from '../images/dog.png';
import Heart from '../images/solar_heart-broken.png';
import Cat from '../images/cat.png';
import { faSearch, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();
    const [scrollDown] = useState(window.innerHeight);

    const handleScrollDown = () => {
        window.scrollTo({
            top: scrollDown,
            behavior: 'smooth',
        });
    };

    const handleClick = () => {
        // Replace '/your-page-url' with the actual URL you want to navigate to
        navigate('/events');
    };

    return (
        <div className="home-page">
            <div className="left-section">
                <img
                    src={Heart}
                    alt="Icon"
                    className="icon-image"
                />
                <h2>Podpor svojho najvernejšieho kamaráta alebo pomôž útulkom a organizáciam</h2>
                <p>Dopraj zvieratku šťastný a plnohodnotný život</p>
                <button className="main-button" onClick={handleClick}>
                    <FontAwesomeIcon icon={faSearch} size="lg" color="black" className="search-icon" />Pozri aktuálne výzvy a udalosti
                </button>
                <button className="scroll-down-button" onClick={handleScrollDown}>
                    <h4>Pozri nižšie</h4>
                    <FontAwesomeIcon icon={faArrowDown} size="2x" color="balck" className="scroll-icon" />
                </button>
                <div className="triangle-container">
                    <img
                        src={Cat}
                        alt="troujuholnik"
                        className="triangle-image"
                    />
                </div>
            </div>
            <div className="right-section">
                <img
                    src={DogImage}
                    alt="Dog Head"
                    className="dog-image"
                />
            </div>
        </div>
    );
};

export default HomePage;
