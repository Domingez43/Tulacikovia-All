import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HealthCheck = () => {
    const [healthData, setHealthData] = useState(null);

    useEffect(() => {
        axios.get('http://88.212.54.66:3033/healthcheck')
            .then((response) => {
                setHealthData(response.data);
            })
            .catch((error) => {
                console.error('Error fetching health check data:', error);
            });
    }, []);

    return (
        <div className= "health">
            <h2>Server Health Check:</h2>
            {healthData ? (
                <div>
                    <p>Status: {healthData.status}</p>
                    <p>Date and Time: {healthData.datetime}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default HealthCheck;
