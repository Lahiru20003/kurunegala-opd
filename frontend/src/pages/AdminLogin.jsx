import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            // Sending data to the Staff Login API
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/staff-login`, credentials);
            
            if (res.data.success) {
                // Save it to Local Storage when logged in
                localStorage.setItem('adminAuth', 'true');
                navigate('/admin'); // Sends to Admin Dashboard
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.message || "Invalid Username or Password!");
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center py-5 position-relative" style={{ background: 'url("/medical_background.jpg") no-repeat center center fixed', backgroundSize: 'cover' }}>
            {/* Darker overlay for Admin login to differentiate from patient login */}
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(33, 37, 41, 0.7)' }}></div>

            <div className="container position-relative" style={{ zIndex: 1100 }}>
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-5">
                        
                        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                            <div className="text-center pt-4 pb-3 px-3" style={{ backgroundColor: '#1a1210', borderBottom: '6px solid #dc3545' }}>
                                <img src="/logo.png" alt="Hospital Logo" style={{ width: '100%', maxWidth: '360px', height: 'auto', objectFit: 'contain' }} />
                            </div>
                            <div className="card-body p-4 p-md-5 bg-white">
                                <div className="text-center mb-4">
                                    <h4 className="fw-bolder mb-1" style={{ color: '#dc3545' }}>Staff / Admin Portal</h4>
                                    <p className="text-muted small">Authorized Personnel Only</p>
                                </div>
                                
                                {errorMsg && <div className="alert alert-danger border-0 shadow-sm rounded-3 text-center fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMsg}</div>}
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label className="fw-semibold text-secondary mb-1 small">Admin Username</label>
                                        <input type="text" className="form-control form-control-lg bg-light border-0 rounded-3 px-3" name="username" onChange={handleChange} required />
                                    </div>
                                    <div className="mb-5">
                                        <label className="fw-semibold text-secondary mb-1 small">Admin Password</label>
                                        <input type="password" className="form-control form-control-lg bg-light border-0 rounded-3 px-3" name="password" onChange={handleChange} required />
                                    </div>
                                    <button type="submit" className="btn btn-danger btn-lg w-100 fw-bold rounded-pill shadow-sm py-3">
                                        <i className="bi bi-shield-lock-fill me-2"></i> Secure Login
                                    </button>
                                </form>
                                
                                <div className="text-center mt-4 pt-3 border-top">
                                    <Link className="text-decoration-none fw-semibold text-muted" to="/login">
                                        <i className="bi bi-arrow-left me-1"></i> Return to Patient Login
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;