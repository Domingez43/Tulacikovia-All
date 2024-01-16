// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
// import 'react-toastify/dist/ReactToastify.css';
//
//
//
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
//
// );
//
// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'react-toastify/dist/ReactToastify.css';

// Check if the google.maps object is available
function isGoogleMapsLoaded() {
    return window.google && window.google.maps;
}

// Function to render the React app
function renderApp() {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

// Check if Google Maps API is already loaded
if (isGoogleMapsLoaded()) {
    renderApp();
} else {
    // Wait for the API to be loaded
    window.initMap = function () {
        renderApp();
    };
}

