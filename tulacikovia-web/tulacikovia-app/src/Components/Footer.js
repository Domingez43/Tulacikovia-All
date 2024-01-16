import React from 'react';
import './Footer.css';
import Logo from '../images/tulacikovia_highres 2.png'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="logo-section">
                <img
                    src={Logo}
                    alt="Logo"
                    className="logo"
                />
            </div>
            {/*<div className="columns-section">*/}
            {/*    <div className="column">*/}
            {/*        <h3>Column 1</h3>*/}
            {/*        <ul>*/}
            {/*            <li>Random Point 1</li>*/}
            {/*            <li>Random Point 2</li>*/}
            {/*            <li>Random Point 3</li>*/}
            {/*        </ul>*/}
            {/*    </div>*/}
            {/*    <div className="column">*/}
            {/*        <h3>Column 2</h3>*/}
            {/*        <ul>*/}
            {/*            <li>Random Point 4</li>*/}
            {/*            <li>Random Point 5</li>*/}
            {/*            <li>Random Point 6</li>*/}
            {/*        </ul>*/}
            {/*    </div>*/}
            {/*    <div className="column">*/}
            {/*        <h3>Column 3</h3>*/}
            {/*        <ul>*/}
            {/*            <li>Random Point 7</li>*/}
            {/*            <li>Random Point 8</li>*/}
            {/*            <li>Random Point 9</li>*/}
            {/*        </ul>*/}
            {/*    </div>*/}
            {/*</div>*/}
            <div className="contact-section">
                <h3>Kontaktuj nás</h3>
                <p>Máš nejakú otázku? Zašli nám ju sem.</p>
                <textarea type="text-box" placeholder="Otázka" className="question-input" />
                <input type="text" placeholder="Tvoj email" className="email-input" />
                <button className="send-button">Pošli</button>
            </div>
        </footer>
    );
};

export default Footer;
