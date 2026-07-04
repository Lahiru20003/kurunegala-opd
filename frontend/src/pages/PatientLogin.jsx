import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const PatientLogin = () => {
    const navigate = useNavigate();
    // Load language from localStorage
    const [lang, setLang] = useState(localStorage.getItem('preferredLang') || 'si');
    
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [errorMsg, setErrorMsg] = useState('');

    const t = {
        en: { logTitle: "Patient Login", username: "System Username", password: "Password", btnLogin: "Secure Login", newAcc: "New patient? Register here", errFail: "Login failed." },
        si: { logTitle: "රෝගී පිවිසුම", username: "පද්ධතියේ පරිශීලක නාමය (Username)", password: "මුරපදය (Password)", btnLogin: "ඇතුළත් වන්න", newAcc: "නව රෝගියෙක්ද? මෙතනින් ලියාපදිංචි වන්න", errFail: "ඇතුළත් වීම අසාර්ථකයි." },
        ta: { logTitle: "நோயாளி உள்நுழைவு", username: "பயனர் பெயர் (Username)", password: "கடவுச்சொல் (Password)", btnLogin: "உள்நுழைக", newAcc: "புதிய நோயாளி? இங்கே பதிவு செய்யவும்", errFail: "உள்நுழைவு தோல்வியடைந்தது." }
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLang(newLang);
        localStorage.setItem('preferredLang', newLang);
    };

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, credentials);
            if (res.data.success) {
                localStorage.setItem('patientData', JSON.stringify(res.data.user));
                navigate('/profile'); 
            }
        } catch (error) {
            setErrorMsg(error.response?.data?.message || t[lang].errFail);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center py-5 position-relative" style={{ background: 'url("/medical_background.jpg") no-repeat center center fixed', backgroundSize: 'cover' }}>
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}></div>

            <div className="container position-relative" style={{ zIndex: 1100 }}>
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-5">
                        
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
                                <h4 className="text-center fw-bolder mb-4" style={{ color: '#0056b3' }}>{t[lang].logTitle}</h4>
                                {errorMsg && <div className="alert alert-danger border-0 shadow-sm rounded-3">{errorMsg}</div>}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-4">
                                        <label className="fw-semibold text-secondary mb-1 small">{t[lang].username}</label>
                                        <input type="text" className="form-control form-control-lg bg-white border border-secondary-subtle rounded-3 px-3" style={{ fontSize: '1rem', borderColor: '#dcdfe3' }} name="username" onChange={handleChange} required />
                                    </div>
                                    <div className="mb-5">
                                        <label className="fw-semibold text-secondary mb-1 small">{t[lang].password}</label>
                                        <input type="password" className="form-control form-control-lg bg-white border border-secondary-subtle rounded-3 px-3" style={{ fontSize: '1rem', borderColor: '#dcdfe3' }} name="password" onChange={handleChange} required />
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow-sm py-3" style={{ backgroundColor: '#0056b3', border: 'none' }}>
                                        {t[lang].btnLogin}
                                    </button>
                                </form>
                                <div className="text-center mt-4">
                                    <Link className="text-decoration-none fw-semibold" style={{ color: '#0056b3' }} to="/register">{t[lang].newAcc}</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientLogin;