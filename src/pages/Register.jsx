import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaPhoneAlt, FaLock, FaKey, FaArrowLeft } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  // Redirect langsung ke dashboard jika token masih ada di localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/siswa/dashboard', { replace: true });
    }
  }, [navigate]);

  // 1. State untuk form registrasi & step OTP
  const [formData, setFormData] = useState({
    name: '',
    no_hp: '',
    password: ''
  });
  const [step, setStep] = useState('REGISTER'); // 'REGISTER' | 'OTP'
  const [otp, setOtp] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // TAHAP 1: Submit Register -> Minta OTP
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi Password Client-Side
    if (formData.password.length < 6) {
      return Swal.fire({
        icon: 'warning',
        title: 'Password Terlalu Pendek',
        text: 'Minimal gunakan 6 karakter demi keamanan akun Anda.',
        confirmButtonColor: '#f59e0b'
      });
    }

    Swal.fire({
      title: 'Memproses Pendaftaran...',
      text: 'Mohon tunggu sebentar',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      // Menembak API Register Backend
      const response = await api.post('/auth/register', {
        name: formData.name,
        no_hp: formData.no_hp,
        password: formData.password
      });

      Swal.fire({
        icon: 'info',
        title: 'Kode OTP Dikirim!',
        text: response?.data?.message || `Silakan masukkan kode OTP yang dikirim ke nomor ${formData.no_hp}.`,
        confirmButtonColor: '#2563eb',
      }).then(() => {
        setStep('OTP');
      });

    } catch (error) {
      const pesanError = error.response?.data?.message || 'Terjadi kesalahan pada server. Coba lagi nanti.';

      Swal.fire({
        icon: 'error',
        title: 'Pendaftaran Gagal',
        text: typeof pesanError === 'object' ? pesanError[0] : pesanError,
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // TAHAP 2: Verifikasi Kode OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      return Swal.fire({
        icon: 'warning',
        title: 'Kode OTP Kosong',
        text: 'Silakan masukkan kode OTP terlebih dahulu.',
        confirmButtonColor: '#f59e0b'
      });
    }

    Swal.fire({
      title: 'Memverifikasi OTP...',
      text: 'Mohon tunggu sebentar',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const response = await api.post('/auth/verify-otp', {
        no_hp: formData.no_hp,
        otp: otp.trim()
      });

      Swal.fire({
        icon: 'success',
        title: 'Verifikasi Berhasil!',
        text: response?.data?.message || 'Akun SPMB Berhasil Dibuat! Silakan masuk menggunakan Nomor HP dan Password Anda.',
        confirmButtonColor: '#2563eb',
      }).then(() => {
        navigate('/login');
      });

    } catch (error) {
      const pesanError = error.response?.data?.message || 'Kode OTP tidak valid atau sudah kadaluarsa.';

      Swal.fire({
        icon: 'error',
        title: 'Verifikasi Gagal',
        text: typeof pesanError === 'object' ? pesanError[0] : pesanError,
        confirmButtonColor: '#ef4444'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          {step === 'REGISTER' ? 'Buat Akun SPMB' : 'Verifikasi Kode OTP'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {step === 'REGISTER' ? (
            <>
              Atau{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                sudah punya akun? Masuk di sini
              </Link>
            </>
          ) : (
            <>
              Masukkan kode OTP yang telah dikirim ke nomor{' '}
              <span className="font-bold text-slate-800">{formData.no_hp}</span>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:px-10 border border-slate-100">
          {step === 'REGISTER' ? (
            <form className="space-y-5" onSubmit={handleSubmit}>

              {/* INPUT NAMA */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <div className="relative shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FaUser />
                  </div>
                  <input
                    type="text" name="name" required
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-200 py-3 border transition-all"
                    placeholder="Sesuai Ijazah / KK"
                    value={formData.name} onChange={handleChange}
                  />
                </div>
              </div>

              {/* INPUT NO HP */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">No. HP / WhatsApp</label>
                <div className="relative shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FaPhoneAlt />
                  </div>
                  <input
                    type="tel" name="no_hp" required
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-200 py-3 border transition-all"
                    placeholder="Contoh: 082258463705"
                    value={formData.no_hp} onChange={handleChange}
                  />
                </div>
              </div>

              {/* INPUT PASSWORD */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password Akun</label>
                <div className="relative shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FaLock />
                  </div>
                  <input
                    type="password" name="password" required
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-200 py-3 border transition-all"
                    placeholder="Minimal 6 karakter"
                    value={formData.password} onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95 shadow-blue-200"
                >
                  Daftar Akun Sekarang
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleVerifyOtp}>

              {/* INPUT KODE OTP */}
              <div >
                <label className="block text-sm font-bold text-slate-700 mb-1">Kode OTP</label>
                <div className="relative shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FaKey />
                  </div>
                  <input
                    type="text" name="otp" required autoFocus
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-200 py-3 border transition-all tracking-widest font-bold"
                    placeholder="Masukkan kode OTP (contoh: 4829)"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95 shadow-blue-200"
                >
                  Verifikasi OTP
                </button>

                <button
                  type="button"
                  onClick={() => setStep('REGISTER')}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all"
                >
                  <FaArrowLeft /> Kembali Ubah Data Pendaftaran
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}