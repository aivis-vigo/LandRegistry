import {GoogleMap, Marker, useJsApiLoader} from "@react-google-maps/api";
import {useCallback, useState} from "react";

const PropertiesMap = ({markers, onMarkerClick}) => {
    const [map, setMap] = useState(null);
    const {isLoaded} = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    })
    const onLoad = useCallback(function callback(map) {
        const bounds = new window.google.maps.LatLngBounds(center)
        map.fitBounds(bounds)

        setMap(map)
    }, [])
    const onUnmount = useCallback(function callback(map) {
        setMap(null)
    }, [])
    const containerStyle = {
        width: '100%',
        height: '600px',
        borderRadius: '5px'
    }
    const center = {
        lat: 56.95103594682463,
        lng: 24.116269571178197
    }

    return isLoaded ? (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
        >
            {markers.map((marker, index) => (
                <Marker
                    key={index}
                    position={marker}
                    onClick={() => onMarkerClick(index + 1, marker)}
                />
            ))}
        </GoogleMap>
    ) : (
        <div>Loading...</div>
    );
}

export default PropertiesMap;