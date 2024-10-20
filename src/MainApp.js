import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

function MainApp() {
  const [file, setFile] = useState(null);
  const [detectionData, setDetectionData] = useState(null);
  const [departureDate, setDepartureDate] = useState('');
  const [departureLocation, setDepartureLocation] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate(); // Use useNavigate hook for route navigation

  useEffect(() => {
    document.title = "ETC Automated System";
  }, []);

  // Handle file change and automatically upload
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Response:', result);
      setDetectionData(result);

      if (result.detections && result.detections.length > 0) {
        const licensePlateInfo = result.detections.find(detection => detection.label === 'license_plate');
        if (licensePlateInfo && licensePlateInfo.text) {
          setLicensePlate(licensePlateInfo.text);
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  // Open file selector on button click
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Submit form information
  const handleSubmit = async () => {
    if (!file || !departureDate || !departureLocation) {
      alert("Please fill in all fields and upload a file.");
      return;
    }

    const authData = JSON.parse(localStorage.getItem('authData'));
    if (!authData || !authData.userId) {
      alert("Please log in first.");
      return;
    }

    const userId = authData.userId;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('departureDate', departureDate);
    formData.append('departureLocation', departureLocation);
    formData.append('licensePlate', licensePlate);
    formData.append('userId', userId);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Form Submit Response:', result);
        setDetectionData(result);
        setIsSubmitted(true);

        // Show success toast after form submission
        toast.success('Form successfully submitted!');

        // Redirect to Dashboard after successful submission
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000); // Redirect after 2 seconds
      } else {
        toast.error('Failed to submit the form.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting the form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <ToastContainer />
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg">
            <div className="card-body">
              {/* Back button */}
              <button 
                className="btn btn-secondary mb-3" 
                onClick={() => navigate('/dashboard')}
              >
                ← 
              </button>

              <h1 className="text-center mb-4">ETC Automated System</h1>
              <form>
              <div className="mb-3">
                <label htmlFor="departureDate" className="form-label">Departure Date:</label>
                <input
                    type="date"
                    id="departureDate"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="form-control"
                    lang="en" // Set language to English
                    placeholder="YYYY/MM/DD" // Guide users to use the English date format
                />
                </div>


                <div className="mb-3">
                  <label htmlFor="departureLocation" className="form-label">Departure Location:</label>
                  <select
                    id="departureLocation"
                    value={departureLocation}
                    onChange={(e) => setDepartureLocation(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Departure Location</option>
                    <option value="Auckland">Auckland</option>
                    <option value="Hamilton">Hamilton</option>
                    <option value="Taupo">Taupo</option>
                    <option value="Napier">Napier</option>
                    <option value="Palmerston North">Palmerston North</option>
                    <option value="Wellington">Wellington</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="licensePlate" className="form-label">License Plate:</label>
                  <input
                    type="text"
                    id="licensePlate"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary w-100 mb-3"
                    onClick={handleButtonClick}
                    disabled={loading || isSubmitted}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />{' '}
                        Uploading...
                      </>
                    ) : (
                      'Upload Car Image'
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-success w-100"
                  onClick={handleSubmit}
                  disabled={loading || isSubmitted}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />{' '}
                      Processing...
                    </>
                  ) : isSubmitted ? (
                    'Submitted'
                  ) : (
                    'Start Trip'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainApp;
