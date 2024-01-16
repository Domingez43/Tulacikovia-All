import React, {useState, useEffect} from "react";
import "./CreateEvent.css";
import axios from "axios";
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from 'react-places-autocomplete';

const CreateEvent = ({onClose, authToken, onCreate}) => {
    const [eventType, setEventType] = useState("EVENT");

    const [userData, setUserData] = useState({
        type: eventType,
        status: "CONCEPT",
        organizator: "",
        name: "",
        tags: [],
        description: "",
        images: [],
        location: {
            address: "",
            latitude: null,
            longitude: null,
        },
        startDate: "",
        endDate: "",
        draft: "false",
        time: "",
        archived:"false"
    });
    useEffect(() => {
        setUserData((prevUserData) => ({
            ...prevUserData,
            type: eventType,
        }));
    }, [eventType]);

    const [errors, setErrors] = useState({
        name: "",
        location: "",
        description: "",
        startDate: "",
        endDate: "",
        time: "",
        images:""
    });

    const handleTagChange = (e) => {
        const tagValue = e.target.value;
        setUserData((prevUserData) => ({
            ...prevUserData,
            tags: tagValue.split(',').map((tag) => tag.trim()), // Split by comma and trim spaces
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            tags: "", // Clear tags error when user makes changes
        }));
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setUserData((prevUserData) => ({
            ...prevUserData,
            [name]: value,
        }));
        console.log("type", userData.type);
    };


    const handleSelect = async (selectedAddress) => {
        try {
            const results = await geocodeByAddress(selectedAddress);
            const latLng = await getLatLng(results[0]);

            setUserData((prevUserData) => ({
                ...prevUserData,
                location: {
                    address: selectedAddress,
                    latitude: latLng.lat,
                    longitude: latLng.lng,
                },
            }));
        } catch (error) {
            console.error("Error fetching geolocation:", error);
        }
    };
    const handleEventImageChange = async (e) => {
        const formData = new FormData();

        console.log("Event object:", e);
        const files = e.target.files;
        console.log("Files:", files);

        for (let i = 0; i < files.length; i++) {
            formData.append("image", files[i]);
        }

        console.log("haha", formData);

        try {
            const response = await axios.post(
                "https://api.relyonproject.com/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            console.log("Server Response:", response.data);

            const {uri} = response.data;

            setUserData((prevUserData) => ({
                ...prevUserData,
                images: [...prevUserData.images, uri],
            }));
        } catch (error) {
            console.error("Error uploading image:", error);
        }
        console.log("type", userData.type);
    }

    const validateInputs = () => {
        const newErrors = { ...errors };

        if (!userData.name.trim()) {
            newErrors.name = "Názov je povinný!";
        } else {
            newErrors.name = "";
        }

        if (!userData.location.address.trim()) {
            newErrors.location = "Miesto konania je povinné!";
        } else {
            newErrors.location = "";
        }

        if (!userData.description.trim()) {
            newErrors.description = "Popis je povinný!";
        } else {
            newErrors.description = "";
        }

        if (!userData.startDate) {
            newErrors.startDate = "Začiatok je povinný!";
        } else {
            newErrors.startDate = "";
        }

        if (!userData.endDate) {
            newErrors.endDate = "Koniec je povinný!";
        } else {
            newErrors.endDate = "";
        }

        if (!userData.time) {
            newErrors.time = "Čas je povinný!";
        } else {
            newErrors.time = "";
        }
        if (!userData.images) {
            newErrors.time = "Obrázok je povinný!";
        } else {
            newErrors.images = "";
        }

        setErrors(newErrors);

        // Check if there are no errors, return true
        return Object.values(newErrors).every((error) => !error);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Authorization Token:', authToken);
        if (!validateInputs()) {
            // If validation fails, return and don't proceed with creating the event
            return;
        }

        try {

            const formattedLocation = {
                type: "Point",
                coordinates: [userData.location.longitude, userData.location.latitude],
                address: userData.location.address,
            };

            const response = await axios.post(
                "https://api.relyonproject.com/content/create/appeal", {
                    type: userData.type,
                    status: userData.status,
                    organizator: userData.organizator,
                    name: userData.name,
                    tags: userData.tags,
                    description: userData.description,
                    images: userData.images,
                    location: formattedLocation,
                    startDate: userData.startDate,
                    endDate: userData.endDate,
                    draft: userData.draft,
                    time: userData.time,
                    archived: userData.archived
                },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json", // Set the content type
                    },
                }
            );

            const id = response.data.objectId;
            console.log("id", id);
            onCreate({
                id: id,
                name: userData.name,
                description: userData.description,
                tags: userData.tags,
                images: userData.images,
            });
            console.log("image", userData.images);

        } catch (error) {
            console.error("Error creating event:", error);
            // Handle errors
        }
    };
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-heading">
                    <h2 className="new_event_heading">
                        <div>
                            Nová udalosť/výzva
                        </div>
                    </h2>
                <div className="select-heading">
                    <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                        <option  value="EVENT">UDALOSŤ</option>
                        <option  value="APPEAL">VÝZVA</option>
                    </select>
                </div>

                </div>
                <div className="form-content">
                    <form onSubmit={handleSubmit} className="form-left">
                        <div className="input-group-event">
                            <label>
                                <h3>Názov:</h3>
                                <input
                                    type="text"
                                    name="name"
                                    value={userData.name}
                                    onChange={handleInputChange}
                                    placeholder="Názov udalosti"
                                />
                                <p className="error-message">{errors.name}</p>
                            </label>
                        </div>
                        <div className="input-group-event">
                            <label>
                                <h3>Miesto konania:</h3>
                                <PlacesAutocomplete
                                    value={userData.location.address}
                                    onChange={(value) => setUserData((prevUserData) => ({
                                        ...prevUserData,
                                        location: {...prevUserData.location, address: value}
                                    }))}
                                    onSelect={handleSelect}
                                >
                                    {({getInputProps, suggestions, getSuggestionItemProps, loading}) => (
                                        <div>
                                            <input {...getInputProps({placeholder: 'Type address'})} />
                                            <div>
                                                {loading && <div>Loading...</div>}
                                                {suggestions.map((suggestion) => (
                                                    <div
                                                        key={suggestion.placeId} {...getSuggestionItemProps(suggestion)}>
                                                        {suggestion.description}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </PlacesAutocomplete>
                                <p className="error-message">{errors.location}</p>
                            </label>
                        </div>

                        <div className="input-group-event">
                            <label>
                                <h3>Popis:</h3>
                                <textarea
                                    name="description"
                                    value={userData.description}
                                    onChange={handleInputChange}
                                    placeholder="Popis"
                                ></textarea>
                                <p className="error-message">{errors.description}</p>

                            </label>
                        </div>
                        <div className="input-group-event">
                            <label>
                                <h3>Začiatok:</h3>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={userData.startDate}
                                    onChange={handleInputChange}
                                    placeholder="Dátum začiatku"
                                />
                                <p className="error-message">{errors.startDate}</p>

                            </label>
                        </div>
                    </form>

                    <form onSubmit={handleSubmit} className="form-right">
                        <div className="input-group-event">
                            <label>
                                <h3>Koniec udalosti:</h3>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={userData.endDate}
                                    onChange={handleInputChange}
                                    placeholder="Dátum konca"
                                />
                                <p className="error-message">{errors.endDate}</p>
                            </label>
                        </div>
                        <div className="input-group-event">
                            <label>
                                <h3>Čas:</h3>
                                <input
                                    type="time"
                                    name="time"
                                    value={userData.time}
                                    onChange={handleInputChange}
                                    placeholder="Čas"
                                />
                                <p className="error-message">{errors.time}</p>

                            </label>
                        </div>
                        <div className="input-group-event">
                            <label>
                                <h3>Pridaj tagy:</h3>
                                <input
                                    type="text"
                                    name="tag"
                                    value={userData.tags.join(', ')}
                                    onChange={handleTagChange}
                                    placeholder="Tags (separated by commas)"
                                />
                            </label>
                        </div>
                        <div className="input-group-event">
                            <label>
                                <h3>Fotka:</h3>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleEventImageChange}
                                />
                                <p className="error-message">{errors.images}</p>

                            </label>
                        </div>
                    </form>
                </div>
                {/*<div className="error-messages">*/}
                {/*    /!* Display error messages for each required field *!/*/}
                {/*    {Object.values(errors).map((error, index) => (*/}
                {/*        <p key={index}>{error}</p>*/}
                {/*    ))}*/}
                {/*</div>*/}
                <div className="button-group">
                    <button className="event-button" type="submit" onClick={handleSubmit}>
                        Vytvoriť udalosť
                    </button>
                    <button className="event-button" type="button" onClick={onClose}>
                        Zavrieť
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;