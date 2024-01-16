import React from "react";
import {Component} from "react";
import './HomePage.css'
import DogImage from '../images/dog.png';
import Heart from '../images/solar_heart-broken.png'
import Cat from '../images/cat.png'
import {faSearch, faArrowDown} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

class LoggedIn extends Component {
    handleScrollDown = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth',
        });
    };
    render() {
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
                    <button className="main-button">
                        <FontAwesomeIcon icon={faSearch} size="lg" color="black" className="search-icon"/>Nájdi svojho
                        kamaráta
                    </button>
                    <button className="scroll-down-button" onClick={this.handleScrollDown}>
                        <h4>Pozri nižšie</h4>
                        <FontAwesomeIcon icon={faArrowDown} size="2x" color="white" className="scroll-icon" />
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
}

export default LoggedIn;