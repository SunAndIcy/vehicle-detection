import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ListPage() {
  const navigate = useNavigate();
  const [vehicleList, setVehicleList] = useState([]);

  useEffect(() => {
    async function fetchVehicleList() {
      try {
        const authData = JSON.parse(localStorage.getItem('authData'));
        const userId = authData?.userId; // Ensure authData exists and get userId

        if (!userId) {
          console.error('User ID not found');
          return;
        }

        // Attach userId as a query parameter in the request URL
        const response = await fetch(`http://localhost:5000/api/records?userId=${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          setVehicleList(data);
        } else {
          console.error('Failed to fetch vehicle list');
        }
      } catch (error) {
        console.error('Error fetching vehicle list:', error);
      }
    }

    fetchVehicleList();
  }, []);

  // Handler for the back button
  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-lg">
            <div className="card-body">
              {/* Back button in the top left corner */}
              <button className="btn btn-secondary mb-3" onClick={handleGoBack}>
                ← 
              </button>
              <h1 className="text-center mb-4">ETC Record List</h1>

              {/* Show loading message if there are no vehicle records */}
              {vehicleList.length === 0 ? (
                <p className="text-center">Loading record list...</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>License Plate</th>
                        <th>Departure Date</th>
                        <th>Departure Location</th>
                        <th>Destination Location</th>
                        <th>Image URL</th>
                        <th>Status</th>
                        <th>Payment Amount</th>
                        <th>Created Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicleList.map((vehicle) => (
                        <tr key={vehicle.id}>
                          <td>{vehicle.id}</td>
                          <td>{vehicle.license_plate}</td>
                          <td>{vehicle.departure_date}</td>
                          <td>{vehicle.departure_location}</td>
                          <td>{vehicle.destination_location || 'N/A'}</td>
                          <td>
                            {vehicle.image_url ? (
                              <a href={vehicle.image_url} target="_blank" rel="noopener noreferrer">
                                View Image
                              </a>
                            ) : 'No Image'}
                          </td>
                          <td>
                            {vehicle.status === 1
                              ? 'Ongoing'
                              : vehicle.status === 2
                              ? 'Ended'
                              : vehicle.status === 3
                              ? 'Pending Payment'
                              : 'Completed'}
                          </td>
                          <td>{vehicle.payment_amount}</td>
                          <td>{vehicle.gmt_created}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListPage;
