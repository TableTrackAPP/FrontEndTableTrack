import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/ToastContext';
import {
    createEstablishment,
    updateEstablishment,
    getEstablishmentByOwnerID
} from '../services/establishmentService';
import { uploadImage } from '../services/firebaseService';
import { getFromLocalStorage } from '../utils/storageUtils';
import './../styles/Establishments.css';
import HomeIcon from "@mui/icons-material/Home";
import SideBar from "../components/SideBar";
import AppFooter from "../components/AppFooter";
import '../styles/NotificationListener.css';
import NotificationListener from "../components/NotificationListener";
import { useLoading } from "../hooks/LoadingContext";
import { Box, Typography } from '@mui/material';

const normalizePhoneDigits = (value) => {
    if (!value) return '';
    return String(value).replace(/\D/g, '');
};

// 10+ países mais prováveis
const COUNTRY_CODES = [
    { code: '55', label: 'Brasil (+55)' },
    { code: '1', label: 'Estados Unidos/Canadá (+1)' },
    { code: '44', label: 'Reino Unido (+44)' },
    { code: '351', label: 'Portugal (+351)' },
    { code: '34', label: 'Espanha (+34)' },
    { code: '49', label: 'Alemanha (+49)' },
    { code: '33', label: 'França (+33)' },
    { code: '39', label: 'Itália (+39)' },
    { code: '52', label: 'México (+52)' },
    { code: '54', label: 'Argentina (+54)' },
    { code: '56', label: 'Chile (+56)' },
    { code: '57', label: 'Colômbia (+57)' },
];

// Para separar o número salvo (E164 em dígitos) em (DDI + local)
const detectCountryCode = (fullDigits) => {
    const digits = normalizePhoneDigits(fullDigits);
    if (!digits) return { countryCode: '55', localNumber: '' };

    // tenta casar o maior DDI primeiro (351 antes de 35 etc)
    const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);

    for (const c of sorted) {
        if (digits.startsWith(c.code) && digits.length > c.code.length) {
            return { countryCode: c.code, localNumber: digits.slice(c.code.length) };
        }
    }

    // fallback: deixa Brasil como default e não destrói o valor (joga tudo no local)
    return { countryCode: '55', localNumber: digits };
};

// validação genérica: número local 6..14 dígitos (pra não travar país)
const validatePhoneGeneric = (countryCode, localDigitsRaw) => {
    const cc = normalizePhoneDigits(countryCode);
    const local = normalizePhoneDigits(localDigitsRaw);

    // opcional
    if (!local) return { ok: true, message: '' };

    if (!cc || !/^\d{1,4}$/.test(cc)) {
        return { ok: false, message: 'Selecione um código do país (DDI).' };
    }

    if (local.length < 6 || local.length > 14) {
        return { ok: false, message: 'Número inválido. Informe apenas os dígitos (6 a 14).' };
    }

    return { ok: true, message: '' };
};

const Establishment = () => {
    const [establishment, setEstablishment] = useState({
        EstablishmentName: '',
        Address: '',
        ImageURL: '',
        Description: '',
        WhatsAppNumber: '' // no banco continua só esse
    });

    // estado de UI (não vai pro banco)
    const [waCountryCode, setWaCountryCode] = useState('55');
    const [waLocalNumber, setWaLocalNumber] = useState('');

    const [isNewEstablishment, setIsNewEstablishment] = useState(true);
    const [imageFile, setImageFile] = useState(null);

    const [whatsAppTouched, setWhatsAppTouched] = useState(false);
    const [whatsAppError, setWhatsAppError] = useState('');

    const navigate = useNavigate();
    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading();

    useEffect(() => {
        const fetchEstablishment = async () => {
            try {
                showLoading('Carregando estabelecimento...');

                const userData = getFromLocalStorage('userData');
                if (!userData) throw new Error('Usuário não autenticado.');

                const ownerID = userData.userID;
                const data = await getEstablishmentByOwnerID(ownerID);

                if (data && data.EstablishmentName) {
                    const savedWa = normalizePhoneDigits(data.WhatsAppNumber ?? '');
                    const { countryCode, localNumber } = detectCountryCode(savedWa);

                    setEstablishment({
                        ...data,
                        WhatsAppNumber: savedWa // mantém dígitos
                    });

                    setWaCountryCode(countryCode);
                    setWaLocalNumber(localNumber);

                    setIsNewEstablishment(false);
                } else {
                    setIsNewEstablishment(true);
                }
            } catch (error) {
                console.log('Erro ao carregar o estabelecimento:', error);
                showToast('Erro ao carregar os dados do estabelecimento', 'error');
            } finally {
                hideLoading();
            }
        };

        fetchEstablishment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showToast]);

    const waFullDigits = useMemo(() => {
        const cc = normalizePhoneDigits(waCountryCode);
        const local = normalizePhoneDigits(waLocalNumber);
        if (!local) return '';
        return `${cc}${local}`;
    }, [waCountryCode, waLocalNumber]);

    const waPreview = useMemo(() => {
        const local = normalizePhoneDigits(waLocalNumber);
        if (!local) return 'Opcional';
        if (whatsAppError) return 'Número inválido';
        return `wa.me/${waFullDigits}`;
    }, [waLocalNumber, waFullDigits, whatsAppError]);

    const validateWhatsApp = (cc, local) => validatePhoneGeneric(cc, local);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // seus campos normais
        setEstablishment((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleWhatsAppCountryChange = (e) => {
        const value = String(e.target.value);
        setWaCountryCode(value);

        if (whatsAppTouched) {
            const v = validateWhatsApp(value, waLocalNumber);
            setWhatsAppError(v.ok ? '' : v.message);
        }
    };

    const handleWhatsAppLocalChange = (e) => {
        const digits = normalizePhoneDigits(e.target.value);
        setWaLocalNumber(digits);

        if (whatsAppTouched) {
            const v = validateWhatsApp(waCountryCode, digits);
            setWhatsAppError(v.ok ? '' : v.message);
        }
    };

    const handleWhatsAppBlur = () => {
        setWhatsAppTouched(true);
        const v = validateWhatsApp(waCountryCode, waLocalNumber);
        setWhatsAppError(v.ok ? '' : v.message);
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const v = validateWhatsApp(waCountryCode, waLocalNumber);
        if (!v.ok) {
            setWhatsAppTouched(true);
            setWhatsAppError(v.message);
            showToast('Corrija o número do WhatsApp antes de salvar.', 'error');
            return;
        }

        try {
            let imageUrl = establishment.ImageURL;

            if (imageFile) {
                const uploadData = await uploadImage(imageFile, establishment.ImageURL);
                imageUrl = uploadData.url;
            }

            const userData = getFromLocalStorage('userData');
            if (!userData) throw new Error('Usuário não autenticado.');

            const local = normalizePhoneDigits(waLocalNumber);
            const cc = normalizePhoneDigits(waCountryCode);

            // Aqui é o ponto principal: salva TUDO no WhatsAppNumber (E164 em dígitos)
            const finalWhatsAppNumber = local ? `${cc}${local}` : null;

            const establishmentData = {
                ...establishment,
                ImageURL: imageUrl,
                OwnerID: userData.userID,
                WhatsAppNumber: finalWhatsAppNumber,
            };

            if (isNewEstablishment) {
                await createEstablishment(establishmentData);
                showToast('Estabelecimento criado com sucesso!', 'success');
            } else {
                await updateEstablishment(establishment.EstablishmentID, establishmentData);
                showToast('Estabelecimento atualizado com sucesso!', 'success');
            }

            navigate('/dashboard');
        } catch (error) {
            console.log('Erro ao salvar estabelecimento:', error);
            showToast('Erro ao salvar os dados do estabelecimento', 'error');
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div style={{ padding: '20px' }}>
            <NotificationListener />

            <Box className="dashboard-topbar" style={{ marginLeft: '20px', marginRight: '20px' }}>
                <div className="home-button-container">
                    <button className="establishment-home-button" onClick={() => handleNavigation('/Dashboard')}>
                        <HomeIcon style={{ marginRight: '6px' }} />
                        <span className="home-button-text">Início</span>
                    </button>
                </div>

                <div className="topbar-row" style={{ width: '100%' }}>
                    <Typography className="dashboard-title" style={{ width: '100%', textAlign: 'center' }}>
                        Estabelecimento
                    </Typography>
                    <div className="mobile-sidebar">
                        <SideBar />
                    </div>
                </div>

                <div className="desktop-sidebar">
                    <SideBar />
                </div>
            </Box>

            <div className="establishment-container">
                <div className="establishment-card">
                    <div className="establishment-left">
                        <img
                            src={establishment.ImageURL || 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png'}
                            alt="Logo"
                            className="avatar"
                        />
                        <h3>{establishment.EstablishmentName || 'Estabelecimento'}</h3>
                        <p>{establishment.Address || 'Sem endereço'}</p>
                        <span className="edit-icon">✎</span>
                    </div>

                    <div className="establishment-right">
                        <h3>{isNewEstablishment ? 'Cadastrar Estabelecimento' : 'Editar Estabelecimento'}</h3>

                        <form onSubmit={handleSubmit} className="establishment-form">
                            <div className="form-group">
                                <label>Nome do Estabelecimento</label>
                                <input
                                    type="text"
                                    name="EstablishmentName"
                                    value={establishment.EstablishmentName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Endereço</label>
                                <input
                                    type="text"
                                    name="Address"
                                    value={establishment.Address}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea
                                    name="Description"
                                    value={establishment.Description}
                                    onChange={handleChange}
                                    rows="4"
                                ></textarea>
                            </div>

                            {/* WhatsApp com combobox + input, mas salva tudo no WhatsAppNumber */}
                            <div className="form-group">
                                <label>WhatsApp (Opcional)</label>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <select
                                        value={waCountryCode}
                                        onChange={handleWhatsAppCountryChange}
                                        style={{
                                            width: '120px',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #ccc',
                                            background: '#fff'
                                        }}
                                    >
                                        {COUNTRY_CODES.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="tel"
                                        value={waLocalNumber}
                                        onChange={handleWhatsAppLocalChange}
                                        onBlur={handleWhatsAppBlur}
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        placeholder="DDD + número (somente dígitos)"
                                        style={{ flex: 1 }}
                                    />
                                </div>

                                <small style={{ display: 'block', marginTop: '6px', opacity: 0.8 }}>
                                    Prévia: <strong>{waPreview}</strong>
                                </small>

                                {whatsAppError ? (
                                    <small style={{ display: 'block', marginTop: '6px', color: '#d32f2f' }}>
                                        {whatsAppError}
                                    </small>
                                ) : null}
                            </div>

                            <div className="form-group">
                                <label className="upload-button">
                                    Atualizar imagem (logo)
                                    <input type="file" hidden onChange={handleImageChange} />
                                </label>
                            </div>

                            <button type="submit" className="submit-button">
                                {isNewEstablishment ? 'Criar Estabelecimento' : 'Salvar Alterações'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <AppFooter />
        </div>
    );
};

export default Establishment;