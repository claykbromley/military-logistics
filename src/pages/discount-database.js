import GoogleMapReact from 'google-map-react';
export default function Overview() {
  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627
    },
    zoom: 11
  };

  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Discount Database</h1>
      <p className="text-gray-600">Welcome to the Discount Database.</p>
      <div style={{ height: '100vh', width: '80%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyAdrCyFkQA2fmt-Lup40KN4qhI2yKpRLbI" }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        yesIWantToUseGoogleMapApiInternals
      >
      </GoogleMapReact>
    </div>
    </div>
  );
}
