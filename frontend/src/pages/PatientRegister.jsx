import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const PatientRegister = () => {
    const navigate = useNavigate();
    // 1. Load language from localStorage, default to 'si'
    const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'si');
    
    const [formData, setFormData] = useState({
        name: '', dob: '', gender: 'Male', mobileNumber: '', specialNeedsCategory: 'None', 
        nic: '', guardianName: '', guardianNic: '', password: ''
    });
    const [isMinor, setIsMinor] = useState(false);
    const [ageCalculated, setAgeCalculated] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState({ username: '', password: '' });

    // Language Dictionary (including Alerts and Popups)
    const t = {
        en: {
            regTitle: "Create Patient Profile", fullName: "Full Name", dob: "Date of Birth", gender: "Gender",
            male: "Male", female: "Female", nic: "National Identity Card (NIC)",
            minorAlert: "As you are under 18, please provide your guardian's details.",
            guardianName: "Guardian's Name", guardianNic: "Guardian's NIC", mobile: "Mobile Number",
            category: "Medical Category", none: "None (General)", pregnant: "Pregnant Mother", disabled: "Differently Abled",
            password: "Set a Password", btnReg: "Register Now", haveAcc: "Already have an account? Login here",
            successTitle: "Registration Successful!", successSub: "Please save your login details.", goLogin: "Go to Login",
            errFail: "Registration failed."
        },
        si: {
            regTitle: "නව රෝගී ලියාපදිංචිය", fullName: "සම්පූර්ණ නම", dob: "උපන්දිනය", gender: "ස්ත්‍රී/පුරුෂ භාවය",
            male: "පුරුෂ", female: "ස්ත්‍රී", nic: "ජාතික හැඳුනුම්පත් අංකය (NIC)",
            minorAlert: "ඔබ වයස අවුරුදු 18 ට අඩු බැවින්, කරුණාකර ඔබගේ භාරකරුගේ තොරතුරු ලබාදෙන්න.",
            guardianName: "භාරකරුගේ නම", guardianNic: "භාරකරුගේ NIC අංකය", mobile: "ජංගම දුරකථන අංකය",
            category: "විශේෂ වෛද්‍ය අවශ්‍යතා", none: "සාමාන්‍ය (නැත)", pregnant: "ගර්භණී මවක්", disabled: "ආබාධිත",
            password: "මුරපදයක් (Password) ලබාදෙන්න", btnReg: "ලියාපදිංචි වන්න", haveAcc: "දැනටමත් ගිණුමක් තිබේද? මෙතනින් ඇතුළත් වන්න",
            successTitle: "ලියාපදිංචිය සාර්ථකයි!", successSub: "කරුණාකර ඔබගේ පද්ධතියට ඇතුළත් වීමේ තොරතුරු (Login Details) මතක තබාගන්න.", goLogin: "ඇතුළත් වීමට (Login) යන්න",
            errFail: "ලියාපදිංචි වීම අසාර්ථකයි."
        },
        ta: {
            regTitle: "புதிய நோயாளி பதிவு", fullName: "முழுப் பெயர்", dob: "பிறந்த தேதி", gender: "பாலினம்",
            male: "ஆண்", female: "பெண்", nic: "தேசிய அடையாள அட்டை (NIC)",
            minorAlert: "நீங்கள் 18 வயதிற்குட்பட்டவர் என்பதால், பாதுகாவலர் விவரங்களை வழங்கவும்.",
            guardianName: "பாதுகாவலர் பெயர்", guardianNic: "பாதுகாவலர் NIC", mobile: "தொலைபேசி எண்",
            category: "மருத்துவ வகை", none: "இல்லை (பொது)", pregnant: "கர்ப்பிணித் தாய்", disabled: "மாற்றுத்திறனாளி",
            password: "கடவுச்சொல்லை உருவாக்கவும்", btnReg: "பதிவு செய்க", haveAcc: "ஏற்கனவே கணக்கு உள்ளதா? இங்கே உள்நுழைக்க",
            successTitle: "பதிவு வெற்றிகரமானது!", successSub: "உங்கள் உள்நுழைவு விவரங்களை சேமிக்கவும்.", goLogin: "உள்நுழைய செல்லவும்",
            errFail: "பதிவு தோல்வியடைந்தது."
        }
    };

    // 2. Saving the language when changing it
    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLang(newLang);
        localStorage.setItem('preferredLang', newLang);
    };

    const calculateAge = (dobString) => {
        const birthDate = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'dob') {
            const age = calculateAge(value);
            setIsMinor(age < 18);
            setAgeCalculated(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        const firstName = formData.name.split(' ')[0].toLowerCase();
        const idNumber = isMinor ? formData.guardianNic : formData.nic;
        const autoUsername = `${firstName}${idNumber.slice(-4)}`;
        const finalData = { ...formData, username: autoUsername };

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, finalData);
            if (res.data.success) {
                setGeneratedCredentials({ username: autoUsername, password: formData.password });
                setShowPopup(true);
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.message || t[lang].errFail); // Error display according to language
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center py-5 position-relative" style={{ background: 'url("/medical_background.jpg") no-repeat center center fixed', backgroundSize: 'cover' }}>
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}></div>

            {showPopup && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1200, backdropFilter: 'blur(5px)' }}>
                    <div className="card shadow-lg p-5 text-center border-0 rounded-4" style={{ maxWidth: '420px', width: '90%' }}>
                        <div className="text-success mb-2" style={{ fontSize: '3.5rem' }}><i className="bi bi-check-circle-fill">✔</i></div>
                        <h3 className="fw-bolder text-dark mb-3">{t[lang].successTitle}</h3>
                        <p className="text-secondary">{t[lang].successSub}</p>
                        <div className="bg-light p-4 rounded-4 my-4 text-start border-0 shadow-sm">
                            <h6 className="mb-2 text-muted small">Username</h6>
                            <h4 className="fw-bold text-primary mb-3">{generatedCredentials.username}</h4>
                            <h6 className="mb-2 text-muted small">Password</h6>
                            <h4 className="fw-bold text-primary mb-0">{generatedCredentials.password}</h4>
                        </div>
                        <button className="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow-sm" onClick={() => { setShowPopup(false); navigate('/login'); }}>
                            {t[lang].goLogin}
                        </button>
                    </div>
                </div>
            )}

            <div className="container position-relative" style={{ zIndex: 1100 }}>
                <div className="row justify-content-center">
                    <div className="col-12 col-md-10 col-lg-7">
                        
                        {/* 3. The new Language Selector */}
                        <div className="d-flex justify-content-end mb-3">
                            <select className="form-select form-select-sm w-auto shadow-sm border-0 rounded-pill ps-3 pe-5" value={lang} onChange={handleLanguageChange} style={{ fontWeight: '500', color: '#495057' }}>
                                <option value="si">සිංහල</option>
                                <option value="en">English</option>
                                <option value="ta">தமிழ்</option>
                            </select>
                        </div>

                        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                            <div className="text-center pt-4 pb-3 px-3" style={{ backgroundColor: '#1a1210', borderBottom: '6px solid #0056b3' }}>
                                <img src="/logo.png" alt="Hospital Logo" style={{ width: '100%', maxWidth: '360px', height: 'auto', objectFit: 'contain' }} />
                            </div>
                            
                            <div className="card-body p-4 p-md-5 bg-white">
                                <h4 className="text-center fw-bolder mb-4" style={{ color: '#0056b3' }}>{t[lang].regTitle}</h4>
                                {errorMsg && <div className="alert alert-danger border-0 shadow-sm rounded-3">{errorMsg}</div>}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="fw-semibold text-secondary mb-1 small">{t[lang].fullName}</label>
                                        <input type="text" className="form-control form-control-lg bg-white border border-secondary-subtle rounded-3 px-3" style={{ fontSize: '1rem', borderColor: '#dcdfe3' }} name="name" onChange={handleChange} required />
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6 mb-3">
                                            <label className="fw-semibold text-secondary mb-1 small">{t[lang].dob}</label>
                                            <input type="date" className="form-control form-control-lg bg-white border border-secondary-subtle rounded-3 px-3" style={{ fontSize: '1rem', borderColor: '#dcdfe3' }} name="dob" onChange={handleChange} required />
                                        </div>
                                        <div className="col-sm-6 mb-3">
                                            <label className="fw-semibold text-secondary mb-1 small">{t[lang].gender}</label>
                                            <select className="form-select form-select-lg bg-white border border-secondary-subtle rounded-3 px-3 ps-3 pe-5" style={{ fontSize: '1rem', borderColor: '#dcdfe3' }} name="gender" onChange={handleChange}>
                                                <option value="Male">{t[lang].male}</option>
                                                <option value="Female">{t[lang].female}</option>
                                            </select>
                                        </div>
                                    </div>

                                    {ageCalculated && (
                                        <div className="bg-light p-4 rounded-4 mb-4">
                                            {!isMinor ? (
                                                <div>
                                                    <label className="fw-bold text-dark mb-2">{t[lang].nic}</label>
                                                    <input type="text" className="form-control form-control-lg bg-white border-primary rounded-3 px-3 shadow-sm" style={{ fontSize: '1rem' }} name="nic" onChange={handleChange} required />
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="alert alert-warning py-2 px-3 mb-3 border-0 rounded-3 text-dark" style={{ backgroundColor: '#fff3cd', fontSize: '0.9rem' }}>
                                                        <i className="bi bi-info-circle-fill me-2 text-warning"></i>{t[lang].minorAlert}
                                                    </div>
                                                    <label className="fw-semibold text-secondary mb-1 small">{t[lang].guardianName}</label>
                                                    <input type="text" className="form-control form-control-lg bg-white border border-secondary-subtle rounded-3 px-3 mb-3" style={{ fontSize: '1rem', borderColor: '#dcdfe3' }} name="guardianName" onChange={handleChange} required />
                                                    <label className="fw-semibold text-secondary mb-1 small">{t[lang].guardianNic}</label>
                                                    <input type="text" className="form-control form-control-lg bg-white border border-secondary-subtle rounded-3 px-3" style={{ fontSize: '1rem', borderColor: '#dcdfe3' }} name="guardianNic" onChange={handleChange} required />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="fw-semibold text-secondary mb-1 small">{t[lang].mobile}</label>
                                        <input type="tel" className="form-control form-control-lg bg-white border border-secondary-subtle rounded-3 px-3" style={{ fontSize: '1rem', borderColor: '#dcdfe3' }} name="mobileNumber" onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="fw-semibold text-secondary mb-1 small">{t[lang].category}</label>
                                        <select className="form-select form-select-lg bg-white border border-secondary-subtle rounded-3 px-3 ps-3 pe-5" style={{ fontSize: '1rem', borderColor: '#dcdfe3' }} name="specialNeedsCategory" onChange={handleChange}>
                                            <option value="None">{t[lang].none}</option>
                                            <option value="Pregnant">{t[lang].pregnant}</option>
                                            <option value="Disabled">{t[lang].disabled}</option>
                                        </select>
                                    </div>
                                    <div className="mb-5">
                                        <label className="fw-semibold text-secondary mb-1 small">{t[lang].password}</label>
                                        <input type="password" className="form-control form-control-lg bg-white border border-secondary-subtle rounded-3 px-3" style={{ fontSize: '1rem', borderColor: '#dcdfe3' }} name="password" onChange={handleChange} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow-sm py-3" disabled={!ageCalculated} style={{ backgroundColor: '#0056b3', border: 'none' }}>
                                        {t[lang].btnReg}
                                    </button>
                                </form>
                                <div className="text-center mt-4">
                                    <Link className="text-decoration-none fw-semibold" style={{ color: '#0056b3' }} to="/login">{t[lang].haveAcc}</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientRegister;