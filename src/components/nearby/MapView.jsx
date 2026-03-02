
import React, { useEffect, useRef, useState } from 'react';

const MAP_STYLES = [
   { featureType: "all", elementType: "geometry", stylers: [{ saturation: -20 }, { lightness: 10 }] },
   { featureType: "water", elementType: "geometry", stylers: [{ color: "#dde8f0" }] },
   { featureType: "road", elementType: "geometry", stylers: [{ color: "#f0eeff" }] },
   { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e8f0e8" }] },
   { featureType: "transit", elementType: "geometry", stylers: [{ color: "#ede9ff" }] },
   { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c4b8e8" }] }
];

const MapView = ({ userLocation, places, onMarkerClick, activePlaceId, onMapLoad }) => {
   const mapRef = useRef(null);
   const mapInstanceRef = useRef(null);
   const markersRef = useRef([]);
   const userMarkerRef = useRef(null);

   // Initialize Map
   useEffect(() => {
      if (!mapRef.current || !window.google) {
         if (!window.google) console.warn("MapView: window.google missing");
         return;
      }
      console.log("MapView: Initializing map...", { lat: userLocation?.lat, lng: userLocation?.lng });

      if (!mapInstanceRef.current) {
         mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: userLocation || { lat: 13.0827, lng: 80.2707 }, // Default Chennai
            zoom: 13,
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {
               position: window.google.maps.ControlPosition.RIGHT_BOTTOM
            },
            styles: MAP_STYLES
         });

         if (onMapLoad) onMapLoad(mapInstanceRef.current);
      }
   }, []);

   // Update User Location Marker
   useEffect(() => {
      if (!mapInstanceRef.current || !userLocation || !window.google) return;

      mapInstanceRef.current.panTo(userLocation);

      // Remove old user marker
      if (userMarkerRef.current) userMarkerRef.current.setMap(null);

      // Custom pulsing marker using SVG
      // Since accurate CSS pulse requires OverlayView which is complex in functional component without library,
      // We'll use a high-quality SVG icon that looks like the requests
      const svgIcon = `
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
           <circle cx="20" cy="20" r="20" fill="#6D5BD0" fill-opacity="0.2"/>
           <circle cx="20" cy="20" r="8" fill="#6D5BD0" result="core"/>
           <circle cx="20" cy="20" r="12" stroke="white" stroke-width="2" fill="none"/>
        </svg>
      `;

      userMarkerRef.current = new window.google.maps.Marker({
         position: userLocation,
         map: mapInstanceRef.current,
         icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20)
         },
         title: 'You are here'
      });

   }, [userLocation]);

   // Update Place Markers
   useEffect(() => {
      if (!mapInstanceRef.current || !window.google) return;

      // Clear old markers
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      places.forEach((place, index) => {
         const isSelected = activePlaceId === place.placeId;
         const baseColor = isSelected ? '#6D5BD0' : 'white';
         const textColor = isSelected ? 'white' : '#1E1B2E';
         const borderColor = '#6D5BD0';

         // Get appropriate emoji based on types
         let emoji = '📍';
         if (place.types.includes('doctor') || place.types.includes('health')) emoji = '🏥';
         if (place.types.includes('pharmacy')) emoji = '💊';
         if (place.types.includes('dentist')) emoji = '🦷';

         // Create pill SVG
         const labelText = `${emoji} ${index + 1}`;
         const width = 60;
         const svgPill = `
            <svg width="${width}" height="32" viewBox="0 0 ${width} 32" xmlns="http://www.w3.org/2000/svg">
               <rect x="1" y="1" width="${width - 2}" height="30" rx="15" fill="${baseColor}" stroke="${borderColor}" stroke-width="2"/>
               <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="14" font-weight="bold" font-family="sans-serif" fill="${textColor}">${labelText}</text>
            </svg>
         `;

         const marker = new window.google.maps.Marker({
            position: place.location,
            map: mapInstanceRef.current,
            icon: {
               url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgPill),
               scaledSize: new window.google.maps.Size(60, 32),
               anchor: new window.google.maps.Point(30, 16) // Center anchor
            },
            title: place.name,
            zIndex: isSelected ? 100 : 1 // Bring selected to front
         });

         marker.addListener('click', () => {
            if (onMarkerClick) onMarkerClick(place);
            mapInstanceRef.current.panTo(place.location);
         });

         markersRef.current.push(marker);
      });
   }, [places, activePlaceId]);

   return (
      <div
         ref={mapRef}
         className="w-full h-full"
         style={{ minHeight: '100%' }} // Ensure it fills container
      />
   );
};

export default MapView;
