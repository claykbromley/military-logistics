import GoogleMapReact from 'google-map-react';
import LocationForm from '../components/LocationForm';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function Overview() {
  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627
    },
    zoom: 11
  };

  return (
    <Container fluid>
      <Row>
        <h1 className="text-3xl font-bold mb-4" style={{ textAlign: "center" }}>Discount Database</h1>
      </Row>
      <Row>
        <p className="text-gray-600" style={{ textAlign: "center" }}>Welcome to the Discount Database.</p>
      </Row>
      <Row style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 25, marginBottom:25 }}>
        <div style={{ height: '40vh', width: '60%', margin: '0 auto', border: '2.5px solid navy' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: "AIzaSyAdrCyFkQA2fmt-Lup40KN4qhI2yKpRLbI" }}
            defaultCenter={defaultProps.center}
            defaultZoom={defaultProps.zoom}
            yesIWantToUseGoogleMapApiInternals
          >
          </GoogleMapReact>
        </div>
      </Row>
      <Row style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 25, marginBottom:25 }}>
        
          <LocationForm onSubmit={(data) => console.log("Location submitted:", data)} />
    
      </Row>
    </Container>
  );
}
