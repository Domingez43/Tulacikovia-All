import React, { Component } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faBars, faUser} from '@fortawesome/free-solid-svg-icons';
import Dashboard from './Dashboard';
import logoImage from '../images/tulacikovia_highres 2.png'

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDashboardVisible: false,
        };
    }
    toggleDashboard = () => {
        this.setState((prevState) => ({
            isDashboardVisible: !prevState.isDashboardVisible,
        }));
    };

    closeDashboard = () => {
        this.setState({
            isDashboardVisible: false,
        });
    };
    render() {
        const { isDashboardVisible } = this.state;

        return (
            <div className="header">
                <Link to="/">
                    <img
                        src={logoImage}
                        alt="tul_logo"
                        className="logotul"
                    />
                </Link>
                <div className="icon-bar" onClick={this.toggleDashboard} style={{ display: 'flex', alignItems: 'center', flexDirection: "row" }}>
                    <FontAwesomeIcon icon={faUser} size="2x"/>
                    <FontAwesomeIcon className="fa-bar" icon={faBars} size="2x"  style={{ marginRight: '50px' , cursor: 'pointer', marginLeft: '10px'}}  />
                </div>
                {isDashboardVisible && (
                    <Dashboard onClose={this.closeDashboard} />
                )}
            </div>
        );
    }
}

export default Header;
