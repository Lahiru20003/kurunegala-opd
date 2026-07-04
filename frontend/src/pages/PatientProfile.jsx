import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PatientProfile = () => {
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [clinics, setClinics] = useState([]);
    const [myTokens, setMyTokens] = useState([]);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'si');
    const [loading, setLoading] = useState(false);
    
    const [showEditModal, setShowEditModal] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    const t = {
        en: { 
            welcome: "Welcome", myProfile: "My Profile", logout: "Logout", liveQueue: "Live Queue Status", bookClinic: "Book a Clinic",
            tokenNo: "Token No", time: "Assigned Time", status: "Status", peopleAhead: "People Ahead", 
            youAreNext: "YOU ARE NEXT! Please go near the room.", inside: "CURRENTLY INSIDE", calling: "Now Calling Token", 
            bookNow: "Book Now", noTokens: "No active bookings yet.", estTime: "Estimated Time", fixedTime: "Fixed Time", 
            timeWarning: "Time may change until 5:00 PM the day before the clinic.", clinicOn: "Clinic is on", upcoming: "Upcoming Clinic",
            updateProfile: "Update Needs", pendingVer: "Pending Admin Verification", verified: "Verified", editTitle: "Update Medical Needs",
            msgBookSuccess: "Booking Successful!\nTime: ", msgBookFail: "Booking failed.", msgUpdateSuccess: "Profile Updated Successfully!", msgUpdateFail: "Error updating profile.",
            rejected: "Request Rejected!", updateToNormal: "Please click update and change to Normal.",
            cancelledBadge: "CANCELLED", btnCancelled: "Clinic Cancelled",
            searchPlaceholder: "Search clinic name...", filterDate: "Filter by date", clearFilters: "Clear",
            tickerMsg: "Special Notice: You can book a clinic appointment only up to 4 days prior to the scheduled clinic date."
        },
        si: { 
            welcome: "ආයුබෝවන්", myProfile: "මගේ පැතිකඩ", logout: "ඉවත් වන්න", liveQueue: "සජීවී පෝලිම් තත්ත්වය", bookClinic: "සායනයක් වෙන්කරගන්න",
            tokenNo: "ටෝකන් අංකය", time: "ඔබගේ වේලාව", status: "තත්ත්වය", peopleAhead: "ඔබට පෙර සිටින ගණන", 
            youAreNext: "ඊළඟට ඔබගේ වාරයයි! කරුණාකර කාමරය අසලට යන්න.", inside: "ඔබ දැනට ඇතුළත සිටී", calling: "දැනට ඇතුළට ගෙන ඇති අංකය", 
            bookNow: "වෙන්කරගන්න", noTokens: "ඔබට දැනට වෙන්කිරීම් නොමැත.", estTime: "ඇස්තමේන්තුගත වේලාව", fixedTime: "ස්ථිර වේලාව", 
            timeWarning: "පෙර දින සවස 5.00 තෙක් මෙම වේලාව වෙනස් වීමට ඉඩ ඇත.", clinicOn: "සායනය පැවැත්වෙන දිනය:", upcoming: "ඉදිරි සායනයකි",
            updateProfile: "තත්ත්වය වෙනස් කරන්න", pendingVer: "අනුමැතිය අපේක්ෂිතයි", verified: "තහවුරු කර ඇත", editTitle: "වෛද්‍ය අවශ්‍යතා යාවත්කාලීන කරන්න",
            msgBookSuccess: "වෙන්කරගැනීම සාර්ථකයි!\nවේලාව: ", msgBookFail: "වෙන්කරගැනීම අසාර්ථකයි.", msgUpdateSuccess: "පැතිකඩ සාර්ථකව යාවත්කාලීන කරන ලදී!", msgUpdateFail: "යාවත්කාලීන කිරීමේ දෝෂයකි.",
            rejected: "ප්‍රතික්ෂේප කර ඇත!", updateToNormal: "කරුණාකර යාවත්කාලීන බොත්තම ඔබා සාමාන්‍ය (Normal) ලෙස වෙනස් කරන්න.",
            cancelledBadge: "අවලංගු කරන ලදී", btnCancelled: "අවලංගුයි",
            searchPlaceholder: "සායනයේ නම සොයන්න...", filterDate: "දිනය අනුව තෝරන්න", clearFilters: "මකන්න",
            tickerMsg: "විශේෂ දැනුම්දීමයි: සායනයක් සඳහා වේලාවක් වෙන් කරවා ගත හැක්කේ, අදාළ සායනය පැවැත්වෙන දිනයට දින 4 කට පෙර සිට පමණි."
        },
        ta: { 
            welcome: "வரவேற்கிறோம்", myProfile: "என் சுயவிவரம்", logout: "வெளியேறு", liveQueue: "நேரடி வரிசை நிலை", bookClinic: "கிளினிக்கை பதிவு செய்",
            tokenNo: "டோக்கன் எண்", time: "ஒதுக்கப்பட்ட நேரம்", status: "நிலை", peopleAhead: "முன்னால் உள்ளவர்கள்", 
            youAreNext: "அடுத்து நீங்கள்! தயவுசெய்து அறைக்கு செல்லவும்.", inside: "தற்போது உள்ளே", calling: "அழைக்கப்படும் எண்", 
            bookNow: "பதிவு செய்", noTokens: "தற்போது பதிவுகள் இல்லை.", estTime: "மதிப்பிடப்பட்ட நேரம்", fixedTime: "நிலையான நேரம்", 
            timeWarning: "முந்தைய நாள் மாலை 5:00 மணி வரை நேரம் மாறலாம்.", clinicOn: "கிளினிக் தேதி:", upcoming: "வரவிருக்கும் கிளினிக்",
            updateProfile: "புதுப்பிக்கவும்", pendingVer: "சரிபார்ப்பு நிலுவையில் உள்ளது", verified: "சரிபார்க்கப்பட்டது", editTitle: "தேவைகளை புதுப்பிக்கவும்",
            msgBookSuccess: "பதிவு வெற்றிகரமானது!\nநேரம்: ", msgBookFail: "பதிவு தோல்வியடைந்தது.", msgUpdateSuccess: "சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!", msgUpdateFail: "புதுப்பிப்பதில் பிழை.",
            rejected: "கோரிக்கை நிராகரிக்கப்பட்டது!", updateToNormal: "புதுப்பித்து இயல்பானதாக (Normal) மாற்றவும்.",
            cancelledBadge: "ரத்து செய்யப்பட்டது", btnCancelled: "ரத்து செய்யப்பட்டது",
            searchPlaceholder: "கிளினிக் பெயரைத் தேடுக...", filterDate: "தேதியைத் தேர்ந்தெடுக்கவும்", clearFilters: "அழி",
            tickerMsg: "விசேட அறிவிப்பு: கிளினிக் நடைபெறும் தேதிக்கு 4 நாட்களுக்கு முன்னர் மட்டுமே நீங்கள் முன்பதிவு செய்ய முடியும்."
        }
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLang(newLang);
        localStorage.setItem('preferredLang', newLang);
    };

    const fetchPatientData = async (patientId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/queue/profile/${patientId}`);
            if (res.data.success) {
                setPatient(res.data.user); 
                localStorage.setItem('patientData', JSON.stringify(res.data.user)); 
            }
        } catch (error) { console.error("Error fetching patient", error); }
    };

    const fetchClinics = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/queue/clinics`);
            setClinics(res.data.data);
        } catch (error) { console.error("Error fetching clinics", error); }
    };

    const fetchMyTokens = async (patientId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/queue/my-tokens/${patientId}`);
            setMyTokens(res.data.data);
        } catch (error) { console.error("Error fetching tokens", error); }
    };

    useEffect(() => {
        const storedPatient = JSON.parse(localStorage.getItem('patientData'));
        if (!storedPatient) {
            navigate('/login');
        } else {
            setPatient(storedPatient);
            setNewCategory(storedPatient.specialNeedsCategory || 'None');
            fetchClinics();
            fetchMyTokens(storedPatient._id);
            fetchPatientData(storedPatient._id); 
            
            const interval = setInterval(() => {
                fetchClinics(); 
                fetchMyTokens(storedPatient._id);
                fetchPatientData(storedPatient._id);
            }, 10000);
            
            return () => clearInterval(interval);
        }
    }, [navigate]);

    const handleBooking = async (clinicId) => {
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/queue/generate-token`, {
                patientId: patient._id,
                clinicId: clinicId
            });
            alert(`${t[lang].msgBookSuccess}${res.data.token.assignedTime}\n${res.data.message ? res.data.message : ''}`);
            fetchMyTokens(patient._id); 
        } catch (error) {
            alert(error.response?.data?.message || t[lang].msgBookFail);
        }
        setLoading(false);
    };

    const handleUpdateProfile = async () => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/queue/profile/${patient._id}`, {
                specialNeedsCategory: newCategory
            });
            if (res.data.success) {
                setPatient(res.data.user);
                localStorage.setItem('patientData', JSON.stringify(res.data.user));
                setShowEditModal(false);
                alert(t[lang].msgUpdateSuccess);
            }
        } catch (error) {
            alert(t[lang].msgUpdateFail);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('patientData');
        navigate('/login');
    };

    const checkClinicStatus = (clinicDateStr) => {
        const now = new Date();
        const clinicDate = new Date(clinicDateStr);
        const lockTime = new Date(clinicDate);
        lockTime.setDate(lockTime.getDate() - 1);
        lockTime.setHours(17, 0, 0, 0);
        const isToday = now.toDateString() === clinicDate.toDateString();
        const isLocked = now >= lockTime;
        return { isToday, isLocked, clinicDate };
    };

    const filteredClinics = clinics.filter(clinic => {
        const matchesSearch = clinic.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = filterDate ? new Date(clinic.date).toDateString() === new Date(filterDate).toDateString() : true;
        return matchesSearch && matchesDate;
    });

    if (!patient) return null;

    return (
        <div className="min-vh-100 pb-5 position-relative" style={{ background: 'url("/medical_background.jpg") no-repeat center center fixed', backgroundSize: 'cover' }}>
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(238, 242, 247, 0.85)', zIndex: 0 }}></div>
            
            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1200 }}>
                    <div className="card shadow-lg p-4 border-0 rounded-4" style={{ maxWidth: '400px', width: '90%' }}>
                        <h4 className="fw-bold mb-3">{t[lang].editTitle}</h4>
                        <select className="form-select form-select-lg mb-4" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                            <option value="None">None (Normal)</option>
                            <option value="Pregnant">Pregnant Mother</option>
                            <option value="Disabled">Differently Abled</option>
                        </select>
                        <div className="d-flex justify-content-end">
                            <button className="btn btn-secondary me-2 rounded-pill px-4" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button className="btn btn-primary rounded-pill px-4" onClick={handleUpdateProfile}>Update</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="position-relative" style={{ zIndex: 10 }}>
                {/* Navbar */}
                <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" style={{ backgroundColor: '#1a1210', borderBottom: '5px solid #0056b3' }}>
                    <div className="container">
                        <a className="navbar-brand d-flex align-items-center" href="#">
                            <img src="/logo.png" alt="Logo" style={{ height: '50px', objectFit: 'contain' }} className="me-3" />
                            <span className="fw-bold fs-4 d-none d-sm-block">Kurunegala Teaching Hospital</span>
                        </a>
                        <div className="d-flex align-items-center">
                            <select className="form-select form-select-sm me-3 border-0 rounded-pill px-3" value={lang} onChange={handleLanguageChange}>
                                <option value="si">සිංහල</option><option value="en">English</option><option value="ta">தமிழ்</option>
                            </select>
                            <button className="btn btn-outline-light btn-sm rounded-pill px-3 fw-bold" onClick={handleLogout}>{t[lang].logout}</button>
                        </div>
                    </div>
                </nav>

                {/* 100% working CSS News Ticker --- */}
                <div className="news-ticker-container shadow-sm">
                    <div className="news-ticker-text">
                        <i className="bi bi-info-circle-fill me-2 fs-6"></i>
                        {t[lang].tickerMsg}
                    </div>
                </div>

                <div className="container mt-4">
                    <div className="row">
                        {/* Profile Section */}
                        <div className="col-lg-4 mb-4">
                            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="bg-primary p-4 text-center text-white" style={{ background: 'linear-gradient(135deg, #0056b3, #007bff)' }}>
                                    <div className="rounded-circle bg-white text-primary d-inline-flex justify-content-center align-items-center shadow" style={{ width: '80px', height: '80px', fontSize: '2rem', fontWeight: 'bold' }}>
                                        {patient.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h4 className="mt-3 fw-bold">{t[lang].welcome}, {patient.name.split(' ')[0]}</h4>
                                    <span className="badge bg-light text-primary px-3 py-2 rounded-pill shadow-sm">{patient.username}</span>
                                </div>
                                <div className="card-body p-4 bg-white">
                                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                                        <h6 className="text-muted fw-bold mb-0">{t[lang].myProfile}</h6>
                                        <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => setShowEditModal(true)}>
                                            <i className="bi bi-pencil-square me-1"></i>{t[lang].updateProfile}
                                        </button>
                                    </div>
                                    <p className="mb-2"><strong>NIC/ID:</strong> {patient.nic || patient.guardianNic}</p>
                                    <p className="mb-3"><strong>Mobile:</strong> {patient.mobileNumber}</p>
                                    
                                    <div className="p-3 bg-light rounded-3 border">
                                        <p className="mb-1"><strong>Category:</strong> <span className={patient.specialNeedsCategory !== 'None' ? 'text-danger fw-bold' : 'text-success fw-bold'}>{patient.specialNeedsCategory}</span></p>
                                        
                                        {patient.specialNeedsStatus === 'Pending' && (
                                            <div className="badge bg-warning text-dark p-2 mt-2 w-100 text-wrap rounded-3 shadow-sm">
                                                <i className="bi bi-hourglass-split me-1"></i> {t[lang].pendingVer}
                                            </div>
                                        )}
                                        {patient.specialNeedsStatus === 'Verified' && (
                                            <div className="badge bg-success p-2 mt-2 w-100 rounded-3 shadow-sm">
                                                <i className="bi bi-check-circle-fill me-1"></i> {t[lang].verified}
                                            </div>
                                        )}
                                        {patient.specialNeedsStatus === 'Rejected' && (
                                            <div className="alert alert-danger p-2 mt-2 mb-0 rounded-3 shadow-sm" style={{ fontSize: '0.85rem' }}>
                                                <strong><i className="bi bi-x-circle-fill me-1"></i> {t[lang].rejected}</strong><br/>
                                                {t[lang].updateToNormal}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Queue and Booking Section */}
                        <div className="col-lg-8">
                            <h4 className="fw-bolder mb-3" style={{ color: '#0056b3' }}>
                                <span className="spinner-grow spinner-grow-sm text-danger me-2" role="status"></span>
                                {t[lang].liveQueue}
                            </h4>
                            
                            {myTokens.length === 0 ? (
                                <div className="alert bg-white border-0 shadow-sm rounded-4 text-center py-5 text-muted">
                                    <h5>{t[lang].noTokens}</h5>
                                </div>
                            ) : (
                                myTokens.map(token => {
                                    const { isToday, isLocked, clinicDate } = checkClinicStatus(token.clinicId?.date);
                                    
                                    return (
                                        <div key={token._id} className={`card border-0 shadow-lg rounded-4 mb-4 overflow-hidden ${token.status === 'Active' ? 'border-start border-5 border-success' : 'border-start border-5 border-primary'}`}>
                                            {isToday && token.isNext && (
                                                <div className="bg-warning text-dark text-center py-2 fw-bolder" style={{ animation: 'pulse 1.5s infinite' }}>
                                                    ⚠️ {t[lang].youAreNext}
                                                </div>
                                            )}

                                            <div className="card-body p-4 d-flex flex-column flex-md-row justify-content-between align-items-center bg-white">
                                                <div className="text-center text-md-start mb-3 mb-md-0">
                                                    <h5 className="text-muted fw-bold mb-1">{token.clinicId?.name}</h5>
                                                    <div className="display-4 fw-bolder text-primary">#{token.tokenNumber}</div>
                                                    <div className="mt-3">
                                                        {isLocked ? (
                                                            <div className="badge bg-success bg-opacity-10 text-success fs-6 border border-success rounded-pill px-3 py-2">
                                                                <i className="bi bi-check-circle-fill me-1"></i> {t[lang].fixedTime}: <strong>{token.assignedTime}</strong>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div className="badge bg-warning bg-opacity-10 text-dark fs-6 border border-warning rounded-pill px-3 py-2 mb-1">
                                                                    <i className="bi bi-clock-history me-1"></i> {t[lang].estTime}: <strong>{token.assignedTime}</strong>
                                                                </div>
                                                                <div className="text-muted" style={{ fontSize: '0.8rem' }}>* {t[lang].timeWarning}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-center bg-light p-3 rounded-4 border w-100 w-md-auto" style={{ minWidth: '220px' }}>
                                                    {isToday ? (
                                                        token.status === 'Active' ? (
                                                            <div className="text-success fw-bolder fs-5 py-3">
                                                                <i className="bi bi-door-open-fill me-2"></i>{t[lang].inside}
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <h6 className="text-muted mb-1">{t[lang].calling}:</h6>
                                                                <h2 className="text-dark fw-bold mb-2">#{token.currentlyCalling}</h2>
                                                                <div className="text-secondary fw-bold">
                                                                    <i className="bi bi-people-fill me-2"></i>{token.peopleAhead} {t[lang].peopleAhead}
                                                                </div>
                                                            </>
                                                        )
                                                    ) : (
                                                        <div className="py-3">
                                                            <h6 className="text-primary fw-bold mb-2"><i className="bi bi-calendar-event me-2"></i>{t[lang].upcoming}</h6>
                                                            <div className="text-dark fw-bold fs-5">{clinicDate.toLocaleDateString()}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            <h4 className="fw-bolder mt-5 mb-3" style={{ color: '#0056b3' }}>🏥 {t[lang].bookClinic}</h4>
                            
                            <div className="bg-white p-3 rounded-4 shadow-sm mb-4">
                                <div className="row g-2">
                                    <div className="col-md-5">
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                                            <input type="text" className="form-control bg-light border-start-0" placeholder={t[lang].searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="col-md-5">
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0"><i className="bi bi-calendar-event text-muted"></i></span>
                                            <input type="date" className="form-control bg-light border-start-0 text-muted" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} title={t[lang].filterDate} />
                                        </div>
                                    </div>
                                    <div className="col-md-2">
                                        <button className="btn btn-outline-danger w-100 h-100 rounded-3" onClick={() => { setSearchTerm(''); setFilterDate(''); }}>
                                            {t[lang].clearFilters}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="custom-scrollbar pe-2" style={{ maxHeight: '450px', overflowY: 'auto', overflowX: 'hidden' }}>
                                <div className="row">
                                    {filteredClinics.length === 0 ? (
                                        <div className="col-12 text-center py-4 text-muted">
                                            <i className="bi bi-search fs-3 d-block mb-2"></i>
                                            No clinics found matching your search.
                                        </div>
                                    ) : (
                                        filteredClinics.map(clinic => (
                                            <div className="col-md-6 mb-3" key={clinic._id}>
                                                <div className={`card border-0 shadow-sm rounded-4 h-100 overflow-hidden ${clinic.status === 'Cancelled' ? 'opacity-75 bg-light' : 'bg-white hover-shadow transition'}`}>
                                                    
                                                    {clinic.status === 'Cancelled' && (
                                                        <div className="bg-danger text-white text-center py-1 fw-bold w-100 mb-2" style={{ fontSize: '0.85rem' }}>
                                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                                            {t[lang].cancelledBadge}
                                                        </div>
                                                    )}

                                                    <div className={`card-body p-4 pt-3`}>
                                                        <h5 className={`fw-bold ${clinic.status === 'Cancelled' ? 'text-danger' : 'text-dark'}`}>{clinic.name}</h5>
                                                        <p className="text-muted mb-1"><small>📅 {new Date(clinic.date).toLocaleDateString()}</small></p>
                                                        <p className="text-muted mb-3"><small>🕒 {clinic.startTime} - {clinic.endTime}</small></p>
                                                        
                                                        <button 
                                                            className={`btn w-100 rounded-pill fw-bold shadow-sm ${clinic.status === 'Cancelled' ? 'btn-secondary' : 'btn-outline-primary'}`}
                                                            onClick={() => handleBooking(clinic._id)}
                                                            disabled={loading || clinic.status === 'Cancelled'}
                                                        >
                                                            {clinic.status === 'Cancelled' ? t[lang].btnCancelled : t[lang].bookNow}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS that definitely works */}
            <style>{`
                @keyframes pulse {
                    0% { background-color: #ffc107; transform: scale(1); }
                    50% { background-color: #ffda6a; transform: scale(1.02); }
                    100% { background-color: #ffc107; transform: scale(1); }
                }
                .hover-shadow:hover {
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                    transform: translateY(-2px);
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
                
                /* Ticker Animation CSS (100% Works in React) */
                .news-ticker-container {
                    width: 100%;
                    overflow: hidden;
                    background-color: #e0f3ff;
                    color: #0056b3;
                    padding: 10px 0;
                    border-bottom: 2px solid #b8daff;
                    position: relative;
                }
                .news-ticker-text {
                    display: inline-block;
                    white-space: nowrap;
                    animation: tickerAnim 25s linear infinite;
                    font-weight: bold;
                    font-size: 0.95rem;
                }
                .news-ticker-container:hover .news-ticker-text {
                    animation-play-state: paused;
                }
                @keyframes tickerAnim {
                    0% { transform: translateX(30vw); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
};

export default PatientProfile;