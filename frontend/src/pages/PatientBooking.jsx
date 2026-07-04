import React, { useState } from 'react';
import axios from 'axios';

const PatientBooking = () => {
    const [formData, setFormData] = useState({
        nic: '',
        name: '',
        mobileNumber: '',
        dob: '',
        clinicDepartment: 'General OPD',
        specialNeedsCategory: 'None'
    });
    const [myToken, setMyToken] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(''); // Delete old errors
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/queue/generate-token`, formData);
            if (response.data.success) {
                setMyToken({ ...response.data.token, clinic: formData.clinicDepartment });
            }
        } catch (error) {
           // Catch the 'Token already exists' error sent by the backend
            if (error.response && error.response.data && !error.response.data.success) {
                setErrorMsg(error.response.data.message);
            } else {
                setErrorMsg("Error generating token. Please try again.");
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white text-center">
                            <h4>Kurunegala OPD - Get Your Token</h4>
                        </div>
                        <div className="card-body">
                            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
                            
                            {!myToken ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label>NIC / Guardian's NIC</label>
                                        <input type="text" className="form-control" name="nic" onChange={handleChange} required placeholder="Ex: 981234567V or 20011234567" />
                                    </div>
                                    <div className="mb-3">
                                        <label>Full Name</label>
                                        <input type="text" className="form-control" name="name" onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label>Mobile Number</label>
                                        <input type="text" className="form-control" name="mobileNumber" onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label>Date of Birth (Used for Age Priority)</label>
                                        <input type="date" className="form-control" name="dob" onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label>Select Clinic</label>
                                        <select className="form-select" name="clinicDepartment" onChange={handleChange}>
                                            <option value="General OPD">General OPD</option>
                                            <option value="Eye Clinic">Eye Clinic</option>
                                            <option value="Dental Clinic">Dental Clinic</option>
                                            <option value="Diabetic Clinic">Diabetic Clinic</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label>Special Needs / Category</label>
                                        <select className="form-select" name="specialNeedsCategory" onChange={handleChange}>
                                            <option value="None">None (General)</option>
                                            <option value="Pregnant">Pregnant Mother</option>
                                            <option value="Disabled">Differently Abled</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">Get Token</button>
                                </form>
                            ) : (
                                <div className="text-center">
                                    <h5 className="text-success">Registration Successful!</h5>
                                    <h3 className="mt-3">{myToken.clinic}</h3>
                                    <h1 className="display-1 fw-bold text-primary">#{myToken.tokenNumber}</h1>
                                    <p className="lead">Priority Score: {myToken.priorityScore}</p>
                                    <p className="text-muted">Please wait for your number to be called.</p>
                                    <button className="btn btn-outline-primary mt-3" onClick={() => {setMyToken(null); setErrorMsg('');}}>Book Another Clinic</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientBooking;