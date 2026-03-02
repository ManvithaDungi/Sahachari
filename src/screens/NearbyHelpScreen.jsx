
import { useState, useEffect, useRef } from 'react';
import MapView from '../components/nearby/MapView';
import PlaceCard from '../components/nearby/PlaceCard';
import PlaceTypeSelector from '../components/nearby/PlaceTypeSelector';
import { getUserLocation, getLocationName, searchNearbyPlaces, getDirectionsUrl, getDistance } from '../services/placesService';

export default function NearbyHelpScreen() {
   const [scriptLoaded, setScriptLoaded] = useState(false);
   const [userLocation, setUserLocation] = useState(null); // { lat, lng }
   const [locationName, setLocationName] = useState('Locating...');
   const [places, setPlaces] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   // Filters
   const [selectedType, setSelectedType] = useState('Gynecologist');
   const [radius, setRadius] = useState(3000); // meters

   // Selection
   const [selectedPlaceId, setSelectedPlaceId] = useState(null);
   // We need the map instance to use PlacesService.
   const [mapInstance, setMapInstance] = useState(null);

   const listRef = useRef(null);

   // 0. Load Google Maps Script
   useEffect(() => {
      if (window.google && window.google.maps) {
         setScriptLoaded(true);
         return;
      }
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
         setScriptLoaded(true);
         return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setError('Failed to load Google Maps API');
      document.head.appendChild(script);
   }, []);

   // 1. Get User Location on Mount (only after script loads optionally, but independent actually)
   useEffect(() => {
      let mounted = true;
      getUserLocation()
         .then(async (loc) => {
            if (!mounted) return;
            setUserLocation(loc);
            try {
               // We need google maps for geocoder
               if (window.google) {
                  const name = await getLocationName(loc.lat, loc.lng);
                  if (mounted) setLocationName(name);
               }
            } catch (e) {
               console.warn(e);
               if (mounted) setLocationName('Unknown Location');
            }
         })
         .catch((err) => {
            console.error(err);
            if (mounted) {
               setError('Location permission denied. Map centered on Chennai.');
               // Default to Chennai
               setUserLocation({ lat: 13.0827, lng: 80.2707 });
               setLocationName('Chennai, TN');
            }
         });
      return () => { mounted = false; };
   }, [scriptLoaded]); // Re-run if script loads to get name

   // Capture Map Instance from MapView
   const handleMapLoad = (map) => {
      setMapInstance(map);
   };

   // 2. Fetch Places whenever inputs change and map is ready
   useEffect(() => {
      if (!userLocation || !mapInstance || !scriptLoaded) return;

      let mounted = true;
      setLoading(true);
      setError(null);

      // Clear previous places selection to avoid confusion? No, keep it.

      searchNearbyPlaces(mapInstance, userLocation, selectedType, radius)
         .then(results => {
            if (!mounted) return;
            // Calculate distance for each
            const withDist = results.map(p => ({
               ...p,
               distance: getDistance(userLocation.lat, userLocation.lng, p.location.lat, p.location.lng)
            }));
            // Sort by distance
            withDist.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
            setPlaces(withDist);
            setLoading(false);
         })
         .catch(err => {
            console.error("Fetch places failed:", err);
            if (mounted) {
               setError("Could not load places. Try again.");
               setLoading(false);
            }
         });

      return () => { mounted = false; };
   }, [userLocation, mapInstance, selectedType, radius, scriptLoaded]);

   // Scroll to place
   const handlePlaceSelect = (placeId) => {
      setSelectedPlaceId(placeId);
      const element = document.getElementById(`place-card-${placeId}`);
      if (element) {
         element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
   };

   // View for Error/Loading if script fails
   if (error && !scriptLoaded) {
      return <div className="h-screen flex items-center justify-center text-red-500">{error}</div>;
   }

   return (
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-[#F8F7FF] animate-fade-in relative z-0">

         {/* LEFT PANEL: MAP (Top on mobile) */}
         <div className="w-full lg:w-[58%] h-[40vh] lg:h-full relative shadow-[inset_-8px_0_16px_rgba(109,91,208,0.06)] z-10 order-1 lg:order-1">
            {!scriptLoaded ? (
               <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-2"></div>
                  <p>Loading Map...</p>
                  {!import.meta.env.VITE_GOOGLE_MAPS_KEY && <p className="text-red-500 text-xs mt-1">Missing VITE_GOOGLE_MAPS_KEY</p>}
               </div>
            ) : (
               <MapView
                  userLocation={userLocation}
                  places={places}
                  activePlaceId={selectedPlaceId}
                  // We need to modify MapView to accept onMapLoad? 
                  // I haven't added onMapLoad to MapView prop definition in previous step!
                  // I will assume I can fix MapView or MapView exposes ref.
                  // Actually, I need to Update MapView to expose onMapLoad.
                  // WAIT: access map instance via ref or callback.
                  // Since I can't easily change MapView right now without another tool call, 
                  // I'll check if MapView can just export the map instance ref?
                  // MapView.jsx: has `mapInstanceRef`. I can modify it to call `onMapLoad` prop if exists.
                  onMarkerClick={(place) => handlePlaceSelect(place.id)}
                  // Passing onMapLoad implies MapView uses it. I will update MapView in next step if needed.
                  // Note: MapView logic in Step 864 didn't use `onMapLoad`.
                  // I MUST update MapView to support this.
                  onMapLoad={handleMapLoad}
               />
            )}
         </div>

         {/* RIGHT PANEL: LIST (Bottom on mobile) */}
         <div className="w-full lg:w-[42%] flex-1 lg:h-full overflow-y-auto bg-[#F8F7FF] flex flex-col relative z-20 order-2 lg:order-2" ref={listRef}>

            {/* Header Section */}
            <div className="sticky top-0 bg-[#F8F7FF]/90 backdrop-blur-md z-30 px-5 pt-5 pb-2 border-b border-primary/5">
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <h1 className="text-xl font-bold text-text-primary">Nearby Help</h1>
                     <p className="text-xs text-text-secondary mt-1">
                        Showing {selectedType}s near you
                     </p>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded-full px-3 py-1 text-xs font-medium text-text-secondary flex items-center gap-1 cursor-pointer hover:bg-primary/10 transition-colors" title="Update Location">
                     <span>📍</span> {locationName}
                  </div>
               </div>

               {/* Place Type Selector */}
               <div className="mb-4">
                  <PlaceTypeSelector
                     selectedType={selectedType}
                     onSelect={setSelectedType}
                  />
               </div>

               {/* Radius Selector */}
               <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                  <span className="text-xs font-medium text-text-secondary mr-2">Within:</span>
                  {[1000, 3000, 5000, 10000].map(r => (
                     <button
                        key={r}
                        onClick={() => setRadius(r)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap
                             ${radius === r
                              ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                              : 'bg-white border border-primary/20 text-text-secondary hover:border-primary/50'}
                           `}
                     >
                        {r / 1000} km
                     </button>
                  ))}
               </div>

               {/* Search Button (Visual indicator mainly, as search is auto) */}
               <button
                  disabled={loading}
                  onClick={() => {
                     // Re-trigger search logic via effect dependencies?
                     // Or explicit fetch. Effect does it automatically on radius/type change.
                     // Force refresh? passing a timestamp to dependency?
                     // For now, it's auto.
                  }}
                  className="w-full bg-primary text-white rounded-full py-3 text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-2"
               >
                  {loading ? (
                     <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Searching...
                     </>
                  ) : (
                     'Find Places'
                  )}
               </button>

               {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600 mt-2">
                     {error} <button onClick={() => window.location.reload()} className="underline ml-1">Retry</button>
                  </div>
               )}
            </div>

            {/* Results List */}
            <div className="px-5 py-2 space-y-3 pb-24 min-h-[50vh]">
               {loading && places.length === 0 ? (
                  // Loading Skeletons
                  Array(3).fill(0).map((_, i) => (
                     <div key={i} className="h-32 rounded-2xl bg-white/50 animate-pulse border border-white/60 mb-3" />
                  ))
               ) : places.length === 0 && !loading ? (
                  // Empty State
                  <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                     <span className="text-4xl mb-3 grayscale opacity-60">🔍</span>
                     <h3 className="text-text-primary font-semibold">No places found nearby</h3>
                     <p className="text-text-secondary text-sm px-8 mt-1">
                        Try increasing the radius to 10km.
                     </p>
                     <button
                        onClick={() => setRadius(10000)}
                        className="mt-4 px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary/5"
                     >
                        Try 10km
                     </button>
                  </div>
               ) : (
                  places.map((place, index) => (
                     <div id={`place-card-${place.id}`} key={place.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                        <PlaceCard
                           place={place}
                           index={index}
                           isSelected={selectedPlaceId === place.id}
                           onClick={() => handlePlaceSelect(place.id)}
                           onDirections={() => window.open(getDirectionsUrl(place.location.lat, place.location.lng, place.name), '_blank')}
                           onCall={(phone) => window.location.href = `tel:${phone}`}
                        />
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
   );
}
