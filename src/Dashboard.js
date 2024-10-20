import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';

const DESTINATIONS = ['Auckland', 'Hamilton', 'Taupo', 'Napier', 'Palmerston North', 'Wellington'];

function Dashboard() {
  const navigate = useNavigate();
  const [unfinishedOrders, setUnfinishedOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState(null);

  // Fetch unfinished orders
  useEffect(() => {
    async function fetchUnfinishedOrders() {
      const authData = JSON.parse(localStorage.getItem('authData'));
      const userId = authData ? authData.userId : null;

      if (!userId) {
        console.error('User ID is missing');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/unfinished-orders?user_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUnfinishedOrders(data);
        } else {
          console.error('Failed to fetch unfinished orders');
        }
      } catch (error) {
        console.error('Error fetching unfinished orders:', error);
      }
    }

    fetchUnfinishedOrders();
  }, []);

  const handleShowList = () => {
    navigate('/list');
  };

  const handleSubmitVehicle = () => {
    navigate('/main');
  };

  // Open modal to let the user select the destination
  const handleEndTrip = (orderId) => {
    setCurrentOrderId(orderId);
    setShowModal(true); // Show modal
  };

  // Confirm end of the trip and send request
  const handleConfirmEndTrip = async () => {
    if (!selectedDestination || currentOrderId === null) {
      alert('Please select a destination.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/end-trip/${currentOrderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destination: selectedDestination }),
      });

      if (response.ok) {
        // alert('Trip ended successfully');
        setUnfinishedOrders(unfinishedOrders.map(order =>
          order.id === currentOrderId ? { ...order, destination_location: selectedDestination, status: 'Awaiting Payment' } : order
        ));
        setShowModal(false); 

        window.location.reload(); 
      } else {
        alert('Failed to end the trip');
      }
    } catch (error) {
      console.error('Error ending trip:', error);
    }
  };

  // Handle payment
  const handlePayment = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pay/${orderId}`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Payment successful');
        setUnfinishedOrders(unfinishedOrders.filter(order => order.id !== orderId));
      } else {
        alert('Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg mb-4">
            <div className="card-body">
              <h1 className="text-center mb-4">Home</h1>
              <div className="row mb-4">
                <div className="col-6">
                  <button className="btn btn-primary w-100" onClick={handleShowList}>
                    History Record List
                  </button>
                </div>
                <div className="col-6">
                  <button className="btn btn-success w-100" onClick={handleSubmitVehicle}>
                    Submit Vehicle Info
                  </button>
                </div>
              </div>

              {/* Display unfinished orders */}
              <h4>Unfinished Trips</h4>
              {unfinishedOrders.length === 0 ? (
                <p>No unfinished trips available.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Departure</th>
                        <th>Destination</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unfinishedOrders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.departure_location}</td>
                          <td>{order.destination_location || 'Not ended yet'}</td>
                          <td>
                            {order.status === 1 ? 'Ongoing' :
                              order.status === 3 ? 'Awaiting Payment' : 'Completed'}
                          </td>
                          <td>{order.payment_amount}</td>
                          <td>
                            {order.destination_location === null ? (
                              <button className="btn btn-warning" onClick={() => handleEndTrip(order.id)}>
                                End Trip
                              </button>
                            ) : order.status === 2 ? (
                              <button className="btn btn-success" onClick={() => handlePayment(order.id)}>
                                Pay Now
                              </button>
                            ) : (
                              <span>Completed</span>
                            )}
                          </td>
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

      {/* Modal - Select destination */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Destination</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="destination" className="form-label">Destination:</label>
            <select
              id="destination"
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="form-select"
            >
              <option value="">Select Destination</option>
              {DESTINATIONS.map((dest) => (
                <option key={dest} value={dest}>
                  {dest}
                </option>
              ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmEndTrip}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Dashboard;
