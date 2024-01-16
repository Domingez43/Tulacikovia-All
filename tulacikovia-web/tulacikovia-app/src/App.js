import './App.css';
import React from 'react';
import Header from './Components/Header';
import HeaderLog from './Components/HeaderLog';
import HomePage from './pages/HomePage';
import Footer from './Components/Footer';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import RegistrationForm from './pages/RegistrationForm';
import RegistrationUser from './pages/RegistrationUser';
import LoginPage from './pages/LoginPage';
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from 'react-toastify';
import LoggedIn from './pages/LoggedIn';
import EventPage from './pages/EventPage';
import ResetPassword from "./pages/ResetPassword";
import DetailEventPage from "./pages/DetailEventPage";
import DetailAppealPage from "./pages/DetailAppealPage";


function App() {

    const isLoggedIn = localStorage.getItem('loginToken') !== null;

    return (
            <Router>
                <div>

                    {isLoggedIn ? <HeaderLog /> : <Header />} {/* Conditionally render Header or HeaderLog */}

                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/registration" element={<RegistrationForm/>}/>
                        <Route path="/registration_user" element={<RegistrationUser/>}/>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/loggedin" element={<LoggedIn/>}/>
                        <Route path="/events" element={<EventPage/>}/>
                        <Route path="/passwordReset/:token" element={<ResetPassword/>}/>
                        <Route path="/event_details" element={<DetailEventPage/>}/>
                        <Route path="/appeal_details" element={<DetailAppealPage/>}/>
                    </Routes>
                    <Footer/>
                    <ToastContainer className="toast-container-wrapper"/>
                </div>
            </Router>
    );
}

export default App;
