import React, { useState, useEffect } from "react";
import "./DetailEventPage.css";
import leftImage from "../images/dog1.png";
import rightImage from "../images/dog2.png";

const DetailEventPage = ({ event, authToken }) => {
    const [detailEvent, setDetailEvent] = useState({ ...event });

    useEffect(() => {
        // Update detailEvent state when the event prop changes
        if (event) {
            setDetailEvent(event);
        }
    }, [event]);

    useEffect(() => {
        // Retrieve the selected detail event from localStorage
        const storedDetailEvent = localStorage.getItem("selectedDetailEvent");
        if (storedDetailEvent) {
            setDetailEvent(JSON.parse(storedDetailEvent));
        }
    }, []);

    const formatDate = (dateString) => {
        const options = { day: "numeric", month: "numeric", year: "numeric" };
        return new Date(dateString).toLocaleDateString("sk-SK", options);
    };

    console.log("detailevent", detailEvent);

    if (!detailEvent || Object.keys(detailEvent).length === 0) {
        return <div>Loading...</div>; // or handle the case where detailEvent is not available
    }

    return (
        <div className="detail-event-container">
            <div className="image-container-detail">
                <img src={leftImage} alt="Left image" className="image_dog_detail" />
            </div>
            <div className="detail_page">
                <div className="image-overlay-detail">
                    <div className="event-image-detail">
                        <img
                            src={detailEvent.list[0].images}
                            alt="Event"
                            className="event-image-detail-page"
                        />
                        <div className="image-overlay-content">
                            <h1 className="event-name-detail">{detailEvent.list[0].name}</h1>
                            <div className="tags-detail">
                                {detailEvent.list[0].tags.map((tag, index) => (
                                    <span key={index} className="tag-detail">
                    {tag}
                  </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="event-info">
                    <div className="info-box-detail">
                        <p className="event-description-detail">
                            {detailEvent.list[0].description}
                        </p>
                    </div>
                    <div className="info-container-detail">
                        <div className="info-box-detail">
                            <h2>Miesto konania:</h2>
                            <h3>{detailEvent.list[0].location.address}</h3>
                        </div>
                        <div className="info-box-detail">
                            <h2>Začiatok udalosti:</h2>
                            <h3>{formatDate(detailEvent.list[0].startDate)}</h3>
                            <h2>Koniec udalosti:</h2>
                            <h3>{formatDate(detailEvent.list[0].endDate)}</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div className="image-container2-detail">
                <img
                    src={rightImage}
                    alt="Right image"
                    className="image_dog2_detail flipped_image"
                />
            </div>
        </div>
    );
};

export default DetailEventPage;







