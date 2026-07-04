import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
    const navigate = useNavigate();
    
    // States
    const [clinics, setClinics] = useState([]);
    const [pendingPatients, setPendingPatients] = useState([]); 
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Queue Management State
    const [activeClinic, setActiveClinic] = useState(null);
    const [queueData, setQueueData] = useState([]);
    
    // Search States
    const [searchId, setSearchId] = useState(''); 
    const [searchClinic, setSearchClinic] = useState(''); 
    
    const [newClinic, setNewClinic] = useState({ 
        name: '', date: '', startTime: '', endTime: '', avgTimePerPatient: 10, maxTokens: 50 
    });

    // --- Security Check & Initial Data Load ---
    useEffect(() => { 
        const isAdminLoggedIn = localStorage.getItem('adminAuth');
        if (!isAdminLoggedIn) {
            navigate('/admin-login'); 
        } else {
            fetchClinics(); 
            fetchPendingVerifications(); 
        }
    }, [navigate]);

    // --- Secure Logout Function ---
    const handleAdminLogout = () => {
        localStorage.removeItem('adminAuth'); 
        navigate('/admin-login'); 
    };

    const fetchClinics = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/queue/clinics`); 
            setClinics(res.data.data);
        } catch (error) { console.error("Error fetching clinics", error); }
    };

    const fetchPendingVerifications = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/queue/pending-verifications`);
            const patients = res.data.data;

            const patientsWithClinic = await Promise.all(patients.map(async (patient) => {
                try {
                    const tokenRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/queue/my-tokens/${patient._id}`);
                    const tokens = tokenRes.data.data;
                    let clinicName = "No active bookings";
                    if (tokens && tokens.length > 0 && tokens[0].clinicId) {
                        clinicName = tokens[0].clinicId.name;
                    }
                    return { ...patient, bookedClinic: clinicName };
                } catch (err) {
                    return { ...patient, bookedClinic: "Unknown" };
                }
            }));

            setPendingPatients(patientsWithClinic);
        } catch (error) { console.error("Error fetching pending patients", error); }
    };

    const fetchClinicQueue = async (clinicId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/queue/clinic-queue/${clinicId}`);
            setQueueData(res.data.data);
        } catch (error) { console.error("Error fetching queue", error); }
    };

    const openQueueManager = (clinic) => {
        setActiveClinic(clinic);
        fetchClinicQueue(clinic._id);
        window.queueInterval = setInterval(() => fetchClinicQueue(clinic._id), 10000);
    };

    const closeQueueManager = () => {
        setActiveClinic(null);
        clearInterval(window.queueInterval);
        fetchPendingVerifications(); 
    };

    const handleInputChange = (e) => {
        setNewClinic({ ...newClinic, [e.target.name]: e.target.value });
    };

    const handleCreateClinic = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/queue/clinics`, newClinic);
            if (res.data.success) {
                alert("Clinic Created Successfully!");
                setShowCreateModal(false); 
                fetchClinics(); 
                setNewClinic({ name: '', date: '', startTime: '', endTime: '', avgTimePerPatient: 10, maxTokens: 50 });
            }
        } catch (error) { 
            alert(error.response?.data?.message || "Failed to create clinic"); 
        }
        setLoading(false);
    };

    const handleCancelClinic = async (clinicId) => {
        if(window.confirm("Are you sure you want to CANCEL this clinic? Patients will be notified and bookings will be closed.")) {
            try {
                const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/queue/clinics/${clinicId}/cancel`);
                if(res.data.success) {
                    alert("Clinic Cancelled!");
                    fetchClinics(); 
                }
            } catch (error) {
                alert("Failed to cancel clinic.");
            }
        }
    };

    const updateTokenStatus = async (tokenId, status) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/queue/${tokenId}`, { status });
            fetchClinicQueue(activeClinic._id);
        } catch (error) { alert("Status update failed"); }
    };

    const handleVerification = async (patientId, action) => {
        try {
            if (action === 'approve') await axios.put(`${import.meta.env.VITE_API_URL}/api/queue/verify-patient/${patientId}`);
            if (action === 'reject') await axios.put(`${import.meta.env.VITE_API_URL}/api/queue/reject-patient/${patientId}`);
            if (activeClinic) fetchClinicQueue(activeClinic._id); 
            fetchPendingVerifications(); 
            alert(`Patient ${action === 'approve' ? 'Verified' : 'Rejected'} successfully!`);
        } catch (error) { alert("Verification action failed"); }
    };

    // Queue Summary Logic - 'Skipped'
    const activeQueueList = queueData.filter(token => token.status !== 'Completed' && token.status !== 'Skipped');
    const skippedQueueList = queueData.filter(token => token.status === 'Skipped'); //New: Skipped list
    
    const completedCount = queueData.filter(token => token.status === 'Completed').length;
    const waitingCount = queueData.filter(token => token.status === 'Pending').length;
    const totalCount = queueData.length;

    // Search Logic
    const filteredPendingPatients = pendingPatients.filter(patient => {
        if (!searchId) return true;
        const nicMatch = patient.nic?.toLowerCase().includes(searchId.toLowerCase());
        const guardianNicMatch = patient.guardianNic?.toLowerCase().includes(searchId.toLowerCase());
        return nicMatch || guardianNicMatch;
    });

    const filteredClinics = clinics.filter(clinic => 
        clinic.name.toLowerCase().includes(searchClinic.toLowerCase())
    );

    return (
        <div className="min-vh-100 pb-5" style={{ background: 'linear-gradient(rgba(238, 242, 247, 0.85), rgba(238, 242, 247, 0.85)), url("/medical_background.jpg") no-repeat center center fixed', backgroundSize: 'cover' }}>
            <nav className="navbar navbar-dark bg-dark shadow-sm px-4 py-3 border-bottom border-primary border-4">
                <div className="d-flex align-items-center">
                    <img src="/logo.png" alt="Logo" style={{ height: '40px', objectFit: 'contain' }} className="me-3 bg-white p-1 rounded" />
                    <span className="navbar-brand mb-0 h4 fw-bold">Hospital Admin Portal</span>
                </div>
                <button className="btn btn-outline-danger btn-sm fw-bold rounded-pill px-4" onClick={handleAdminLogout}>Logout</button>
            </nav>

            <div className="container mt-4">
                {activeClinic ? (
                    <div className="bg-white p-4 rounded-4 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                            <div>
                                <h4 className="fw-bolder text-primary mb-1">{activeClinic.name} - Live Queue</h4>
                                <span className="badge bg-secondary">Date: {new Date(activeClinic.date).toLocaleDateString()}</span>
                            </div>
                            <button className="btn btn-dark rounded-pill px-4" onClick={closeQueueManager}>
                                <i className="bi bi-arrow-left me-2"></i>Back to Clinics
                            </button>
                        </div>

                        <div className="row mb-4">
                            <div className="col-md-4">
                                <div className="p-3 bg-light rounded-3 border-start border-4 border-primary shadow-sm d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-muted">Total Bookings</span>
                                    <h3 className="mb-0 fw-bolder text-primary">{totalCount}</h3>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 bg-light rounded-3 border-start border-4 border-warning shadow-sm d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-muted">Waiting List</span>
                                    <h3 className="mb-0 fw-bolder text-warning">{waitingCount}</h3>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 bg-light rounded-3 border-start border-4 border-success shadow-sm d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-muted">Completed</span>
                                    <h3 className="mb-0 fw-bolder text-success">{completedCount}</h3>
                                </div>
                            </div>
                        </div>

                        {/*  (Active Queue) */}
                        <div className="table-responsive mb-4">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Token No.</th>
                                        <th>Patient Info</th>
                                        <th>Queue Action</th>
                                        <th>Special Needs Verification</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeQueueList.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-5 text-muted fw-bold"><i className="bi bi-check-circle-fill fs-1 text-success d-block mb-2"></i>Queue is Clear! No active or waiting patients.</td></tr>
                                    ) : (
                                        activeQueueList.map(token => (
                                            <tr key={token._id} className={token.status === 'Active' ? 'table-success' : ''}>
                                                <td>
                                                    <h3 className="fw-bold text-primary mb-0">#{token.tokenNumber}</h3>
                                                    <small className="text-muted">Time: {token.assignedTime}</small>
                                                </td>
                                                <td>
                                                    <p className="fw-bold mb-0">{token.patientId?.name}</p>
                                                    <small className="text-muted">NIC: {token.patientId?.nic} | {token.patientId?.mobileNumber}</small>
                                                </td>
                                                <td>
                                                    {/* Call Next, Complete and new Skip buttons */}
                                                    {token.status === 'Pending' && (
                                                        <div className="d-flex gap-2 flex-wrap">
                                                            <button className="btn btn-sm btn-primary rounded-pill px-3 shadow-sm" onClick={() => updateTokenStatus(token._id, 'Active')}><i className="bi bi-megaphone-fill me-1"></i> Call Next</button>
                                                            <button className="btn btn-sm btn-outline-warning rounded-pill px-3 shadow-sm text-dark fw-bold" onClick={() => updateTokenStatus(token._id, 'Skipped')}>Skip</button>
                                                        </div>
                                                    )}
                                                    {token.status === 'Active' && (
                                                        <div className="d-flex gap-2 flex-wrap">
                                                            <button className="btn btn-sm btn-success rounded-pill px-3 shadow-sm" onClick={() => updateTokenStatus(token._id, 'Completed')}><i className="bi bi-check-circle me-1"></i> Complete</button>
                                                            <button className="btn btn-sm btn-outline-warning rounded-pill px-3 shadow-sm text-dark fw-bold" onClick={() => updateTokenStatus(token._id, 'Skipped')}>Skip</button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {token.patientId?.specialNeedsCategory !== 'None' ? (
                                                        <div className="bg-light p-2 rounded border">
                                                            <span className="fw-bold text-dark d-block mb-2">{token.patientId?.specialNeedsCategory}</span>
                                                            {token.patientId?.specialNeedsStatus === 'Pending' && (
                                                                <div className="d-flex gap-2">
                                                                    <button className="btn btn-sm btn-success flex-grow-1 shadow-sm" onClick={() => handleVerification(token.patientId._id, 'approve')}>Approve</button>
                                                                    <button className="btn btn-sm btn-danger flex-grow-1 shadow-sm" onClick={() => handleVerification(token.patientId._id, 'reject')}>Reject</button>
                                                                </div>
                                                            )}
                                                            {token.patientId?.specialNeedsStatus === 'Verified' && <span className="badge bg-success w-100 py-2"><i className="bi bi-check-circle"></i> Verified</span>}
                                                            {token.patientId?.specialNeedsStatus === 'Rejected' && <span className="badge bg-danger w-100 py-2"><i className="bi bi-x-circle"></i> Rejected</span>}
                                                        </div>
                                                    ) : <span className="text-muted">Normal</span>}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* List of missed patients (Skipped List) */}
                        {skippedQueueList.length > 0 && (
                            <div className="mt-4 border-top pt-4">
                                <h5 className="fw-bolder text-warning mb-3"><i className="bi bi-pause-circle-fill me-2"></i>Skipped Patients</h5>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle border">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Token No.</th>
                                                <th>Patient Info</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {skippedQueueList.map(token => (
                                                <tr key={token._id} className="bg-light">
                                                    <td>
                                                        <h4 className="fw-bold text-secondary mb-0">#{token.tokenNumber}</h4>
                                                    </td>
                                                    <td>
                                                        <p className="fw-bold mb-0 text-secondary">{token.patientId?.name}</p>
                                                        <small className="text-muted">NIC: {token.patientId?.nic} | {token.patientId?.mobileNumber}</small>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-sm btn-info rounded-pill px-4 shadow-sm text-white fw-bold" onClick={() => updateTokenStatus(token._id, 'Pending')}>
                                                            <i className="bi bi-arrow-counterclockwise me-1"></i> Retrieve
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        
                    </div>
                ) : (
                    <>
                        <div className="mb-5">
                            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
                                <div className="d-flex align-items-center">
                                    <h4 className="fw-bolder text-danger mb-0 me-2"><i className="bi bi-shield-exclamation me-2"></i>Pending Verifications Alert</h4>
                                    <span className="badge bg-danger rounded-pill fs-6">{pendingPatients.length}</span>
                                </div>
                                {pendingPatients.length > 0 && (
                                    <div className="input-group shadow-sm" style={{ maxWidth: '280px' }}>
                                        <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                                        <input 
                                            type="text" 
                                            className="form-control border-start-0" 
                                            placeholder="Search by NIC..." 
                                            value={searchId} 
                                            onChange={(e) => setSearchId(e.target.value)} 
                                        />
                                    </div>
                                )}
                            </div>

                            {pendingPatients.length === 0 ? (
                                <div className="alert alert-success border-0 shadow-sm rounded-4 text-center py-4">
                                    <i className="bi bi-check-circle-fill fs-3 d-block mb-2 text-success"></i>
                                    <h6 className="mb-0 text-success fw-bold">All patients are verified. No pending requests.</h6>
                                </div>
                            ) : (
                                <div className="custom-scrollbar pe-2" style={{ maxHeight: '250px', overflowY: 'auto', overflowX: 'hidden' }}>
                                    {filteredPendingPatients.length === 0 && searchId ? (
                                        <div className="text-center py-4 text-muted">
                                            <i className="bi bi-search fs-3 d-block mb-2"></i>
                                            No pending patients found matching "{searchId}".
                                        </div>
                                    ) : (
                                        <div className="row">
                                            {filteredPendingPatients.map(patient => (
                                                <div className="col-md-6 col-lg-4 mb-3" key={patient._id}>
                                                    <div className="card border-start border-4 border-warning shadow-sm rounded-3 h-100 bg-white">
                                                        <div className="card-body p-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <h6 className="fw-bold text-dark mb-0">{patient.name}</h6>
                                                                <span className="badge bg-warning text-dark px-2 py-1 rounded-pill" style={{ fontSize: '0.75rem' }}><i className="bi bi-hourglass-split me-1"></i>{patient.specialNeedsCategory}</span>
                                                            </div>
                                                            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                                                                <strong>NIC:</strong> {patient.nic || patient.guardianNic} <br/>
                                                                <strong>Mobile:</strong> {patient.mobileNumber} <br/>
                                                                <strong className="text-primary">Clinic:</strong> <span className="fw-bold text-primary">{patient.bookedClinic}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <hr className="my-5 text-muted" />

                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 bg-white p-4 rounded-4 shadow-sm border-start border-4 border-primary gap-3">
                            <div>
                                <h4 className="fw-bolder mb-1 text-primary">Clinic Management</h4>
                                <p className="text-muted mb-0 small">Select a clinic to manage its queue or create a new one.</p>
                            </div>
                            <div className="d-flex gap-3 align-items-center flex-wrap">
                                <div className="input-group shadow-sm" style={{ maxWidth: '250px' }}>
                                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                                    <input 
                                        type="text" 
                                        className="form-control bg-light border-start-0" 
                                        placeholder="Search Clinic..." 
                                        value={searchClinic} 
                                        onChange={(e) => setSearchClinic(e.target.value)} 
                                    />
                                </div>
                                <button className="btn btn-primary rounded-pill fw-bold shadow-sm px-4" onClick={() => setShowCreateModal(true)}>
                                    <i className="bi bi-plus-circle me-2"></i>New Clinic
                                </button>
                            </div>
                        </div>

                        <div className="row">
                            {filteredClinics.length === 0 ? (
                                <div className="col-12 text-center py-5">
                                    <h5 className="text-muted">
                                        {searchClinic ? `No clinics found matching "${searchClinic}".` : "No active clinics found."}
                                    </h5>
                                </div>
                            ) : (
                                filteredClinics.map(clinic => (
                                    <div className="col-md-4 mb-4" key={clinic._id}>
                                        <div className={`card border-0 shadow-sm rounded-4 h-100 bg-white position-relative overflow-hidden ${clinic.status === 'Cancelled' ? 'opacity-75' : 'hover-shadow transition'}`}>
                                            
                                            {clinic.status === 'Cancelled' && (
                                                <div className="position-absolute top-0 start-0 w-100 text-center bg-danger text-white fw-bold py-1" style={{ zIndex: 10 }}>
                                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>CANCELLED
                                                </div>
                                            )}

                                            <div className={`card-body p-4 text-center ${clinic.status === 'Cancelled' ? 'pt-5' : ''}`}>
                                                <h5 className={`fw-bolder mb-3 ${clinic.status === 'Cancelled' ? 'text-danger' : 'text-dark'}`}>{clinic.name}</h5>
                                                <p className="text-secondary small mb-1">📅 {new Date(clinic.date).toLocaleDateString()}</p>
                                                <p className="text-secondary small mb-3">🕒 {clinic.startTime} - {clinic.endTime}</p>
                                                
                                                {clinic.status === 'Cancelled' ? (
                                                    <button className="btn btn-secondary w-100 rounded-pill fw-bold" disabled>Clinic is Cancelled</button>
                                                ) : (
                                                    <div className="d-flex gap-2">
                                                        <button className="btn btn-outline-primary w-100 rounded-pill fw-bold shadow-sm" onClick={() => openQueueManager(clinic)}>Manage Queue</button>
                                                        <button className="btn btn-outline-danger rounded-pill px-4 shadow-sm fw-bold" onClick={() => handleCancelClinic(clinic._id)}>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {showCreateModal && (
                    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
                        <div className="card shadow-lg border-0 rounded-4" style={{ width: '90%', maxWidth: '500px' }}>
                            <div className="card-header bg-primary text-white text-center py-3 rounded-top-4 border-0">
                                <h5 className="mb-0 fw-bold">Schedule New Clinic</h5>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleCreateClinic}>
                                    <div className="mb-3">
                                        <label className="fw-semibold text-secondary small mb-1">Clinic Name</label>
                                        <input type="text" className="form-control bg-light border-0 px-3 py-2 rounded-3" name="name" value={newClinic.name} onChange={handleInputChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="fw-semibold text-secondary small mb-1">Date</label>
                                        <input type="date" className="form-control bg-light border-0 px-3 py-2 rounded-3" name="date" value={newClinic.date} onChange={handleInputChange} required />
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-6">
                                            <label className="fw-semibold text-secondary small mb-1">Start Time</label>
                                            <input type="time" className="form-control bg-light border-0 px-3 py-2 rounded-3" name="startTime" value={newClinic.startTime} onChange={handleInputChange} required />
                                        </div>
                                        <div className="col-6">
                                            <label className="fw-semibold text-secondary small mb-1">End Time</label>
                                            <input type="time" className="form-control bg-light border-0 px-3 py-2 rounded-3" name="endTime" value={newClinic.endTime} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="row mb-4">
                                        <div className="col-6">
                                            <label className="fw-semibold text-secondary small mb-1">Max Tokens</label>
                                            <input type="number" className="form-control bg-light border-0 px-3 py-2 rounded-3" name="maxTokens" value={newClinic.maxTokens} onChange={handleInputChange} required min="1" />
                                        </div>
                                        <div className="col-6">
                                            <label className="fw-semibold text-secondary small mb-1">Mins/Patient</label>
                                            <input type="number" className="form-control bg-light border-0 px-3 py-2 rounded-3" name="avgTimePerPatient" value={newClinic.avgTimePerPatient} onChange={handleInputChange} required min="1" />
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2 mt-2">
                                        <button type="button" className="btn btn-light px-4 rounded-pill fw-bold border" onClick={() => setShowCreateModal(false)}>Close</button>
                                        <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold shadow-sm" disabled={loading}>Create</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <style jsx="true">{`
                .hover-shadow:hover { box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important; transform: translateY(-2px); }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
            `}</style>
        </div>
    );
};
export default StaffDashboard;