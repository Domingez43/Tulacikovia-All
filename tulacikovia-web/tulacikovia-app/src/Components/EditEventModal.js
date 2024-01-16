import React, {useState} from "react";
import './EditEventModal.css'
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from "react-places-autocomplete";
import axios from "axios";

const EditEventModal = ({event, onClose, onSave, authToken}) => {
    // State to hold the edited event data
    const [editedEvent, setEditedEvent] = useState({...event});

    console.log("time", editedEvent.list[0].time);

    const handleEventImageChange = async (e) => {
        const formData = new FormData();

        const files = e.target.files;

        for (let i = 0; i < files.length; i++) {
            formData.append("image", files[i]);
        }

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

            setEditedEvent((prevUserData) => ({
                ...prevUserData,
                list: [
                    {
                        ...prevUserData.list[0],
                        images: [uri, ...prevUserData.list[0].images.slice(1)],
                    },
                ],
            }));
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    console.log("Updated images:", editedEvent.list[0].images);


    const handleFieldChange = (fieldName, value) => {
        setEditedEvent((prevEvent) => {
            if (fieldName === "name") {
                // Update the name field within the first item of the list
                const updatedList = [
                    {
                        ...prevEvent.list[0],
                        name: value,
                    },
                ];

                return {
                    ...prevEvent,
                    list: updatedList,
                };
            } else if (fieldName === "location" || fieldName === "description") {
                // Update the specific field within the first item of the list
                const updatedList = [
                    {
                        ...prevEvent.list[0],
                        [fieldName]: value,
                    },
                ];

                return {
                    ...prevEvent,
                    list: updatedList,
                };
            } else if (fieldName === "images") {
                // Handle images separately (assuming handleEventImageChange is defined)
                handleEventImageChange(value);
            } else if (fieldName === "images" && value.length === 0) {
                // If no images are loaded, set the original image URL
                const updatedList = [
                    {
                        ...prevEvent.list[0],
                        images: editedEvent.list[0].images,
                    },
                ];

                return {
                    ...prevEvent,
                    list: updatedList,
                };
            } else if (fieldName === "tags") {
                // If the changed field is "tags", convert the input value to an array
                const tagsArray = value.split(',').map(tag => tag.trim());
                const updatedList = [
                    {
                        ...prevEvent.list[0],
                        [fieldName]: tagsArray,
                    },
                ];

                return {
                    ...prevEvent,
                    [fieldName]: tagsArray,
                    list: updatedList,
                };
            } else if (fieldName === "startDate" || fieldName === "endDate") {
                // Format date and update within the first item of the list
                const formattedDateValue = formatDate(value);
                const updatedList = [
                    {
                        ...prevEvent.list[0],
                        [fieldName]: formattedDateValue,
                    },
                ];

                return {
                    ...prevEvent,
                    [fieldName]: formattedDateValue,
                    list: updatedList,
                };
            } else if (fieldName === "time") {
                // If the changed field is "time", update it directly
                const updatedList = [
                    {
                        ...prevEvent.list[0],
                        [fieldName]: value,
                    },
                ];

                return {
                    ...prevEvent,
                    list: updatedList,
                };
            }

            // Default: return the previous state
            return prevEvent;
        });
    };



    const handleSave = () => {
        onSave(editedEvent);
        onClose();
    };

    const handleSelect = async (selectedAddress) => {
        try {
            const results = await geocodeByAddress(selectedAddress);
            const latLng = await getLatLng(results[0]);

            // Call handleFieldChange to update the location in the editedEvent state
            handleFieldChange("location", {
                address: selectedAddress,
                latitude: latLng.lat,
                longitude: latLng.lng,
            });
        } catch (error) {
            console.error("Error fetching geolocation:", error);
        }
    };

    const formatDate = (dateString) => {
        const dateObject = new Date(dateString);
        const formattedDate = dateObject.toISOString().split('T')[0];
        return formattedDate;
    };
// ---------------------------------------------------------------
    return (
        <div className="edit-event-modal">
            <div className="modal-content-edit" onClick={(e) => e.stopPropagation()}>
                <h2 className="edit_event_heading">Uprav udalosť</h2>
                <form className="form-content-edit" onSubmit={handleSave}>
                    <div className="form-left-edit">
                        <div className="input-group-event">
                            <label>
                                <h3>Názov udalosti:</h3>
                                <input
                                    type="text"
                                    value={editedEvent.list[0].name}
                                    onChange={(e) => handleFieldChange("name", e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="input-group-event">
                            <label>
                                <h3>Popis:</h3>
                                <input
                                    type="text"
                                    value={editedEvent.list[0].description}
                                    onChange={(e) => handleFieldChange("description", e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="input-group-event">
                            <label>
                                <h3>Miesto konania:</h3>
                                <PlacesAutocomplete
                                    value={editedEvent.list[0].location.address}
                                    onChange={(value) => handleFieldChange("location", { address: value })}
                                    onSelect={handleSelect}
                                >
                                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                        <div>
                                            <input {...getInputProps({ placeholder: 'Type address' })} />
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
                            </label>
                        </div>
                        <div className="input-group-event">
                            <label>
                                <h3>Začiatok udalosti:</h3>
                                <input
                                    type="date"
                                    value={formatDate(editedEvent.list[0].startDate)}
                                    onChange={(e) => handleFieldChange("startDate", e.target.value)}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="form-right-edit">
                        <div className="input-group-event">
                            <label>
                                <h3>Koniec udalosti:</h3>
                                <input
                                    type="date"
                                    value={formatDate(editedEvent.list[0].endDate)}
                                    onChange={(e) => handleFieldChange("endDate", e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="input-group-event">
                            <label>
                                <h3>Čas udalosti:</h3>
                                <input
                                    type="time"
                                    value={editedEvent.list[0].time}
                                    onChange={(e) => handleFieldChange("time", e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="input-group-event">
                            <label>
                                <h3>Tagy:</h3>
                                <input
                                    type="text"
                                    value={editedEvent.list[0].tags.join(', ')}
                                    onChange={(e) => handleFieldChange("tags", e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="input-group-event">
                            <label>
                                <h3>Fotka udalosti:</h3>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFieldChange("images", e)}
                                />
                            </label>
                        </div>
                    </div>
                </form>

                    <div className="button-group">
                        <button className="event-button" type="submit" onClick={handleSave}>
                            Upraviť udalosť
                        </button>
                        <button className="event-button" type="button" onClick={handleSave}>
                            Zavrieť
                        </button>
                    </div>
            </div>
        </div>
    );
};

export default EditEventModal;
