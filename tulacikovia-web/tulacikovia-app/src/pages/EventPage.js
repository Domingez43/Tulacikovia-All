import React, {useEffect, useState} from "react";
import Picture from '../images/picture.png';
import CreateEvent from "../Components/CreateEvent";
import './EventPage.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft, faPlus, faArrowRight} from "@fortawesome/free-solid-svg-icons";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import EditEventModal from "../Components/EditEventModal";
import DetailEventPage from "./DetailEventPage";
import {type} from "@testing-library/user-event/dist/type";
import DetailAppealPage from "./DetailAppealPage";
import EditAppealModal from "../Components/EditAppealModal";


const EventPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [eventsDropdownState, setEventsDropdownState] = useState({});
    const [authToken, setAuthToken] = useState(null);
    const [events, setEvents] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState(
        localStorage.getItem("selectedFilter") || null
    );
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedDetailEvent, setSelectedDetailEvent] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
    const [selectedSortBy, setSelectedSortBy] = useState("createdOn");
    const [appliedFilters, setAppliedFilters] = useState({
        limit: 21,
        sortBy: "createdOn",
        sort: "1",
        applyFilters: selectedFilter,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 12;


    const navigate = useNavigate();

    // useEffect(() => {
    //     console.log("loginToken", localStorage.getItem('loginToken'));
    //     console.log("regToken", localStorage.getItem('registrationToken'));
    //     const loginToken = localStorage.getItem('loginToken');
    //     setAuthToken(loginToken);
    //     const fetchEvents = async () => {
    //         try {
    //             const response = await axios.get("https://api.relyonproject.com/content/list/appeals", {
    //                     params: appliedFilters,
    //                 // params: {
    //                 //     limit: 21,
    //                 //     sortBy: "createdOn",
    //                 //     sort: "1",
    //                 //     applyFilters: selectedFilter,
    //                 // },
    //                     headers: {
    //                         Authorization: `Bearer ${loginToken}`,
    //                         "Content-Type": "application/json", // Set the content type
    //                     },
    //                 },
    //             );
    //             setEvents(response.data.list);
    //             console.log("datas", response.data.list);
    //         } catch (error) {
    //             console.error("Error fetching participated content:", error);
    //         }
    //     };
    //     fetchEvents();
    //     const fetchNewCard = async () => {
    //         try {
    //             const userProfileResponse = await axios.get("https://relyonproject.com/registration/profile", {
    //                 headers: {
    //                     Authorization: `Bearer ${loginToken}`,
    //                     "Content-Type": "application/json",
    //                 },
    //             });
    //             console.log("profileresponse", userProfileResponse.data.type);
    //             localStorage.setItem("profileResponse", userProfileResponse.data.type);
    //
    //         } catch (error) {
    //             console.error("Error fetching new card data:", error);
    //         }
    //     };
    //     fetchNewCard();
    // }, [selectedFilter, authToken]);

    const fetchEvents = async () => {
        try {
            const loginToken = localStorage.getItem('loginToken');
            const response = await axios.get("https://api.relyonproject.com/content/list/appeals", {
                params: {
                    ...appliedFilters,
                    //limit: eventsPerPage,  // Update the limit to eventsPerPage
                    offset: (currentPage - 1) * eventsPerPage, // Calculate the offset based on the current page
                },
                headers: {
                    Authorization: `Bearer ${loginToken}`,
                    "Content-Type": "application/json",
                },
            });
            setEvents(response.data.list);
            console.log("datas", response.data.list);
        } catch (error) {
            console.error("Error fetching participated content:", error);
        }
    };

    const fetchNewCard = async () => {
        try {
            const loginToken = localStorage.getItem('loginToken');
            const userProfileResponse = await axios.get("https://relyonproject.com/registration/profile", {
                headers: {
                    Authorization: `Bearer ${loginToken}`,
                    "Content-Type": "application/json",
                },
            });
            console.log("profileresponse", userProfileResponse.data.type);
            localStorage.setItem("profileResponse", userProfileResponse.data.type);
        } catch (error) {
            console.error("Error fetching new card data:", error);
        }
    };

    useEffect(() => {
        const loginToken = localStorage.getItem('loginToken');
        setAuthToken(loginToken);
        fetchEvents();
        fetchNewCard();
    }, [selectedFilter, /*authToken*/appliedFilters]);


    const applyFilters = (params) => {
        // Update the appliedFilters state with the new parameters
        setAppliedFilters({
            ...appliedFilters,
            ...params,
        });

    };
    const handleSortByChange = (sortBy) => {
        // Update the selectedSortBy state
        setSelectedSortBy(sortBy);

        // Update the appliedFilters state with the new sort option
        const updatedFilters = {
            ...appliedFilters,
            sortBy: sortBy,
        };

        // Call the function to apply the updated filters
        applyFilters(updatedFilters);
    };

    const handleLimitChange = (newLimit) => {
        // Update the appliedFilters state with the new limit value
        applyFilters({ limit: newLimit });
        setCurrentPage(1);
        fetchEvents();
    };

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        localStorage.setItem("selectedFilter", filter);
    };
    useEffect(() => {
        fetchEvents(); // Call fetchEvents after updating state
    }, [appliedFilters]);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const toggleDropdown = (eventId) => {
        setEventsDropdownState((prevState) => ({
            ...prevState,
            [eventId]: !prevState[eventId],
        }));
    };

    const createEventCard = (newEvent) => {
        setEvents((prevEvents) => [...prevEvents, newEvent]);
    };

    const handleEditEvent = async (eventId) => {
        console.log("eventid", eventId);
        try {
            const response = await axios.get(
                `https://api.relyonproject.com/content/get/appeals`,
                {
                    params: {
                        ids: eventId,
                    },
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            setSelectedEvent(response.data);
            if (selectedEvent && selectedEvent.list && selectedEvent.list[0] && selectedEvent.list[0].type === 'EVENT') {
                setIsEditModalOpen(true);
            } else {
                setIsAppealModalOpen(true);
            }
            // console.log("response", response.data);
            // setIsEditModalOpen(true);
        } catch (error) {
            console.error(`Error fetching event details for ID ${eventId}:`, error);
        }
    };

    const handleSaveEdit = async (editedEvent) => {

        console.log("editedevent", editedEvent);
        try {
            const formattedLocation = {
                type: "Point",
                coordinates: [editedEvent.list[0].location.coordinates[0], editedEvent.list[0].location.coordinates[1]],
                address: editedEvent.list[0].location.address
            };
            editedEvent.list[0].location = formattedLocation;
            const response = await axios.post(
                "https://api.relyonproject.com/content/update/appeal",
                editedEvent.list[0],
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`, // Make sure authToken is available in scope
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("Successfully saved edited event:", response.data);
        } catch (error) {
            console.error("Error saving edited event:", error);

        }
    };
    const handleSaveEditAppeal = async (editedEvent) => {

        console.log("editedappeal", editedEvent);
        try {
            const response = await axios.post(
                "https://api.relyonproject.com/content/update/appeal",
                editedEvent.list[0],
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`, // Make sure authToken is available in scope
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log("Successfully saved edited appeal:", response.data);
        } catch (error) {
            console.error("Error saving edited appeal:", error);

        }
    };
    const handleDeleteEvent = async (eventId) => {
        try {
            const response = await axios.post(
                'https://api.relyonproject.com/content/appeals/delete',
                { id: eventId }, // Pass the event ID to be deleted in the request body
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.state === 'deleted') {
                // If the deletion was successful, remove the event from the state
                setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
            } else {
                // Handle the case where deletion failed
                console.error('Error deleting event:', response.data.message);
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleArchiveEvent = async (eventId) => {
        try {
            // Fetch the event details before archiving
            const response = await axios.get(
                `https://api.relyonproject.com/content/get/appeals`,
                {
                    params: {
                        ids: eventId,
                    },
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const archivedEvent = response.data;
            // Set the 'archived' property to true
            archivedEvent.list[0].archived = true;

            const formattedLocation = {
                type: "Point",
                coordinates: [
                    archivedEvent.list[0].location.coordinates[0],
                    archivedEvent.list[0].location.coordinates[1],
                ],
                address: archivedEvent.list[0].location.address,
            };
            archivedEvent.list[0].location = formattedLocation;

            const archiveResponse = await axios.post(
                "https://api.relyonproject.com/content/update/appeal",
                archivedEvent.list[0],
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Successfully archived event:", archiveResponse.data);
            setEvents((prevEvents) =>
                prevEvents.filter((event) => event.id !== eventId)
            );
        } catch (error) {
            console.error(`Error archiving event with ID ${eventId}:`, error);
        }
    };

    const handleLookMore = async (eventId) => {
        try {
            const response = await axios.get(
                `https://api.relyonproject.com/content/get/appeals`,
                {
                    params: {
                        ids: eventId,
                    },
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const event = response.data;

            // Check if the event has the 'type' property
            if (event && event.list && event.list[0] && event.list[0].type === 'EVENT') {
                localStorage.setItem('selectedDetailEvent', JSON.stringify(event));
                navigate("/event_details");
                setIsDetailOpen(true);
            } else {
                localStorage.setItem('selectedDetailEvent', JSON.stringify(event));
                navigate("/appeal_details");
                setIsDetailOpen(true);
            }
        } catch (error) {
            console.error(`Error fetching event details for ID ${eventId}:`, error);
        }
    };

    useEffect(() => {
        const storedDetailEvent = localStorage.getItem('selectedDetailEvent');
        if (storedDetailEvent) {
            setSelectedDetailEvent(JSON.parse(storedDetailEvent));
        }
    }, []);

    const handleGoBack = () => {
        navigate(-1); // This will navigate to the previous page
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };
    const handleCloseAppealModal = () => {
        setIsAppealModalOpen(false);
    };


    const profileResponse = localStorage.getItem("profileResponse");

    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    const totalPages = Math.ceil(events.length / eventsPerPage);


    const handleNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    return (
        <div className="event-container">
            <div className="header-container">
                <div className="back_button">
                    <button className="back-button-event" onClick={handleGoBack}>
                        <div className="icon-container">
                            <FontAwesomeIcon icon={faArrowLeft} style={{color: 'black'}} size="2x"/>
                        </div>
                    </button>
                </div>
                <h1>Aktuálne udalosti a výzvy</h1>

            </div>
            <div className="event-filters-container">
                <button className="filter_button" onClick={() => handleFilterChange("MY_APPEALS")}>Moje udalosti
                </button>
                <button className="filter_button" onClick={() => handleFilterChange("ACTUAL")}>Aktuálne</button>
                <button className="filter_button" onClick={() => handleFilterChange("PAST_DATE")}>Neaktuálne</button>
                <button className="filter_button" onClick={() => handleFilterChange("DRAFTS")}>Koncepty</button>
                <button className="filter_button" onClick={() => handleFilterChange("ARCHIVE")}>Archív</button>
                    <label htmlFor="sortDropdown" style={{ width: '120px', display: 'inline-block', marginRight: '10px' }}>Zoradiť podľa:</label>
                    <select
                        id="sortDropdown"
                        className="filter_dropdown"
                        onChange={(e) => handleSortByChange(e.target.value)}
                    >
                        <option value="createdOn">Vytvorené dňa</option>
                        <option value="endDate">Koniec dňa</option>
                        <option value="startDate">Začiatok dňa</option>
                    </select>
                <label htmlFor="limit_dropdown" style={{ width: '80px', display: 'inline-block', marginRight: '10px' }}>Počet:</label>
                <select
                    className="limit_dropdown"
                    onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    {/* Add more options as needed */}
                </select>
            </div>

            <div className="events-container">
                {events.slice(startIndex, endIndex).map((event) => (
                     <div key={event.id} className="event-card" /*onClick={() => handleLookMore(event.id)}*/>
                        <div className="event-options" onClick={() => toggleDropdown(event.id)}>
                            <div className="options-icon">...</div>
                            {eventsDropdownState[event.id] && (
                                <div className={`options-menu ${eventsDropdownState[event.id] ? 'show' : ''}`}>
                                    <div id="delete" onClick={() => handleDeleteEvent(event.id)}>Vymazať</div>
                                    <div id="archive" onClick={() => handleArchiveEvent(event.id)} >Archivovať</div>
                                    <div id="edit" onClick={() => handleEditEvent(event.id)}>Upraviť</div>
                                </div>
                            )}
                        </div>

                        <img src={event.images} alt="Event" className="event-image"/>
                        <div className="event-details">
                            <h2 className="event-name">{event.name}</h2>
                            {event.name.length <= 25 ? (
                                <p className="event-description">
                                    {event.description.length > 50
                                        ? `${event.description.slice(0, 70)}...`
                                        : event.description}
                                </p>
                            ) : null}
                            <div className="tags">
                                {event.tags.map((tag, index) => (
                                    <span key={index} className="tag">
                                    {tag}
                                </span>
                                ))}
                            </div>
                        </div>
                        <div className="look-more" onClick={() => handleLookMore(event.id)}>Pozri viac</div>
                    </div>
                ))}
            </div>

            {profileResponse === "ORGANIZATION" && (
                <div className="add-event-card" onClick={openModal}>
                    <FontAwesomeIcon icon={faPlus} size="3x"/>
                    <p className="add-event-text">Pridaj novú udalosť alebo výzvu</p>
                </div>
            )}

            <div className="pagination-container">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    <FontAwesomeIcon icon={faArrowLeft} size="2x"/>
                </button>
                <span>{`Strana ${currentPage} z ${totalPages}`}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    <FontAwesomeIcon className="arrow_pag" icon={faArrowRight} size="2x" />
                </button>
            </div>

            {isModalOpen && <CreateEvent onClose={closeModal} authToken={authToken} onCreate={createEventCard}/>}
            {isEditModalOpen &&
                <EditEventModal event={selectedEvent} onClose={handleCloseEditModal} onSave={handleSaveEdit} authToken={authToken}
                />
            }
            {isAppealModalOpen &&
                <EditAppealModal event={selectedEvent} onClose={handleCloseAppealModal} onSave={handleSaveEditAppeal} authToken={authToken}
                />
            }

            {isDetailOpen && (<DetailEventPage event={selectedDetailEvent}  authToken={authToken}
                />)
            }
            {isDetailOpen && (<DetailAppealPage event={selectedDetailEvent}  authToken={authToken}
            />)
            }

        </div>
    );
};
export default EventPage;
