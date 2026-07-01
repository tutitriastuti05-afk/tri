import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  BookOpen, Award, Activity, Compass, Users, TrendingUp, 
  CheckCircle2, ChevronRight, Star, HelpCircle, Edit3, Save, Sparkles
} from "lucide-react";
import { TrialResult } from "../types";

interface DashboardProps {
  setView: (view: "dashboard" | "materi" | "simulasi" | "praktikum" | "kuis") => void;
}

export default function Dashboard({ setView }: DashboardProps) {
  const [studentName, setStudentName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>("");
  
  // Loaded stats
  const [materiProgress, setMateriProgress] = useState<{ definisi?: boolean; rumus?: boolean; contoh?: boolean }>({});
  const [trials, setTrials] = useState<TrialResult[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizPercentage, setQuizPercentage] = useState<number | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const name = localStorage.getItem("gelombang_pintar_student_name") || "";
      setStudentName(name);
      setTempName(name);

      const savedMateri = localStorage.getItem("gelombang_pintar_materi_read");
      if (savedMateri) {
        setMateriProgress(JSON.parse(savedMateri));
      }

      const savedTrials = localStorage.getItem("gelombang_pintar_trials");
      if (savedTrials) {
        setTrials(JSON.parse(savedTrials));
      }

      const score = localStorage.getItem("gelombang_pintar_quiz_score");
      const pct = localStorage.getItem("gelombang_pintar_quiz_percentage");
      if (score !== null) setQuizScore(Number(score));
      if (pct !== null) setQuizPercentage(Number(pct));
    } catch (e) {
      console.error("Failed to load dashboard stats:", e);
    }
  }, []);

  const handleSaveName = () => {
    if (!tempName.trim()) return;
    try {
      localStorage.setItem("gelombang_pintar_student_name", tempName.trim());
      setStudentName(tempName.trim());
      setIsEditingName(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Math helper stats
  const materiCount = Object.keys(materiProgress).filter(k => materiProgress[k as keyof typeof materiProgress]).length;
  const materiPercent = Math.round((materiCount / 3) * 100);
  
  const validSpeedTrials = trials.filter(t => t.speed > 0);
  const averageSpeed = validSpeedTrials.length > 0 
    ? Math.round(validSpeedTrials.reduce((sum, t) => sum + t.speed, 0) / validSpeedTrials.length) 
    : null;

  const totalTrials = trials.length;

  // Developers data
  const developers = [
    {
      name: "Tri Astuti",
      role: "Lead Developer & UI/UX Designer 🎨",
      desc: "Merancang tata letak visual ceria, mendesain skema warna pastel eye-safe, dan mengatur keselarasan tipografi kartun Inter & Space Grotesk agar materi Fisika nyaman dipelajari.",
      avatar: "🐰✨",
      color: "bg-[#F1948A] text-[#922B21] border-[#C0392B]",
      highlight: false
    },
    {
      name: "Nazla Kamilatu Nisa",
      role: "Backend & Audio Signal Architect 📡",
      desc: "Membangun sistem sinkronisasi mikrofon presisi tinggi dan room sharing berbasis server agar dua handphone terpisah dapat menghitung cepat rambat suara secara real-time.",
      avatar: "🦊⚡",
      color: "bg-[#AED6F1] text-[#2874A6] border-[#5DADE2]",
      highlight: false
    },
    {
      name: "Noval Ramdani",
      role: "Simulation Specialist & Sound Analyst 📐",
      desc: "Menyempurnakan mesin fisika berbasis gelombang sinus interaktif, merumuskan sistem kalibrasi waktu HP, serta memvalidasi keakuratan deteksi suara gema.",
      avatar: "🐼💡",
      color: "bg-[#A9DFBF] text-[#1E8449] border-[#27AE60]",
      highlight: false
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 relative z-10" id="dashboard-section">
      
      {/* 1. Welcome Card Header */}
      <motion.div 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80 }}
        className="relative bg-white/95 backdrop-blur-md border-8 border-[#AED6F1] shadow-2xl rounded-3xl p-6 md:p-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden"
      >
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#AED6F1]/20 rounded-full blur-2xl"></div>
        
        <div className="space-y-3 z-10 flex-1">
          <div className="inline-block bg-[#2874A6] text-white shadow-md rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest border border-white mb-2 animate-pulse">
            Dashboard Utama 🏠
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
            <h1 className="text-2xl md:text-3xl font-black text-[#2E4053] tracking-tight">
              Halo, {studentName ? <span className="text-[#FF7F50]">{studentName}</span> : "Teman Pintar!"} 👋
            </h1>
            
            {isEditingName ? (
              <div className="flex gap-2 items-center mt-2 md:mt-0">
                <input
                  id="dashboard-name-input"
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-3 py-1 text-sm font-bold border-2 border-[#F1948A] rounded-xl outline-none focus:ring-2 focus:ring-[#F1948A]/30 w-44 text-slate-800"
                  placeholder="Ganti namamu..."
                  maxLength={25}
                />
                <button
                  id="btn-save-name"
                  onClick={handleSaveName}
                  className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-edit-name-toggle"
                onClick={() => {
                  setTempName(studentName);
                  setIsEditingName(true);
                }}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                title="Edit Nama"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="text-[#546E7A] text-xs md:text-sm font-medium leading-relaxed max-w-xl">
            Siap menjelajahi dunia gelombang hari ini? Di sini kamu bisa memantau perkembangan belajarmu, hasil eksperimen riil memakai HP, dan status sertifikat kelulusanmu!
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 z-10 shrink-0">
          <div className="w-16 h-16 bg-[#FF7F50] rounded-2xl rotate-3 flex items-center justify-center shadow-lg border-2 border-white select-none text-3xl">
            🐰
          </div>
          <span className="text-[10px] font-black uppercase text-[#546E7A] tracking-wider">Kiki si Kelinci</span>
        </div>
      </motion.div>

      {/* 2. Interactive Bento Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stat A: Belajar Materi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border-4 border-[#F7DC6F] shadow-lg rounded-3xl p-5 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-yellow-50 rounded-2xl border border-[#F7DC6F] text-[#7D6608]">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-[#7D6608] bg-yellow-100/50 px-2.5 py-1 rounded-full uppercase">
                Progress Membaca
              </span>
            </div>
            
            <div>
              <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Materi Terbaca</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-slate-800">{materiCount}</span>
                <span className="text-slate-400 font-bold text-sm">/ 3 Bab</span>
              </div>
            </div>

            {/* Checklists */}
            <div className="space-y-1.5 pt-2 text-[11px] font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${materiProgress.definisi ? "text-emerald-500" : "text-slate-300"}`} />
                <span className={materiProgress.definisi ? "line-through text-slate-400" : ""}>Bab 1: Definisi Gelombang</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${materiProgress.rumus ? "text-emerald-500" : "text-slate-300"}`} />
                <span className={materiProgress.rumus ? "line-through text-slate-400" : ""}>Bab 2: Rumus & Variabel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 ${materiProgress.contoh ? "text-emerald-500" : "text-slate-300"}`} />
                <span className={materiProgress.contoh ? "line-through text-slate-400" : ""}>Bab 3: Contoh Soal & Latihan</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-dashed border-slate-100 mt-4 flex items-center justify-between">
            <div className="flex-1 mr-4">
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-[#F7DC6F] h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${materiPercent}%` }}
                ></div>
              </div>
            </div>
            <button
              id="dash-btn-materi"
              onClick={() => setView("materi")}
              className="text-[#7D6608] hover:text-[#D4AC0D] font-black text-xs flex items-center shrink-0"
            >
              Baca <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Stat B: Praktikum Sensor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border-4 border-[#A9DFBF] shadow-lg rounded-3xl p-5 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-emerald-50 rounded-2xl border border-[#A9DFBF] text-[#1E8449]">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-[#1E8449] bg-emerald-100/50 px-2.5 py-1 rounded-full uppercase">
                Sensor Riil
              </span>
            </div>
            
            <div>
              <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Eksperimen Anda</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-slate-800">{totalTrials}</span>
                <span className="text-slate-400 font-bold text-sm">kali diukur</span>
              </div>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl p-2.5 border border-emerald-100 text-center">
              <span className="text-[10px] font-bold text-[#1E8449] block">Rerata Kecepatan Suara:</span>
              <span className="text-xl font-black text-emerald-800 mt-0.5 block">
                {averageSpeed ? `${averageSpeed} m/s` : "Belum Ada Data"}
              </span>
              <span className="text-[9px] text-slate-400 font-medium block mt-1">
                {averageSpeed 
                  ? `Sangat Hebat! Teori: ±343 m/s` 
                  : "Cobalah di tab Praktikum Sensor!"}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-dashed border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold">Tabel & grafik otomatis terisi</span>
            <button
              id="dash-btn-praktikum"
              onClick={() => setView("praktikum")}
              className="text-[#1E8449] hover:text-[#27AE60] font-black text-xs flex items-center shrink-0"
            >
              Ukur <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Stat C: Skor Kuis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-4 border-[#F1948A] shadow-lg rounded-3xl p-5 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-rose-50 rounded-2xl border border-[#F1948A] text-[#922B21]">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-[#922B21] bg-rose-100/50 px-2.5 py-1 rounded-full uppercase">
                Hasil Ujian
              </span>
            </div>
            
            <div>
              <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider">Nilai Kuis Terbaik</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-slate-800">
                  {quizPercentage !== null ? `${quizPercentage}%` : "—"}
                </span>
                <span className="text-slate-400 font-bold text-sm">
                  {quizScore !== null ? `(${quizScore}/5)` : "Belum ujian"}
                </span>
              </div>
            </div>

            {/* Certificate Status Badge */}
            <div className={`p-2.5 rounded-2xl border text-center ${
              quizPercentage && quizPercentage >= 80 
                ? "bg-amber-50 border-amber-300 text-amber-900 animate-pulse" 
                : "bg-slate-50 border-slate-200 text-slate-500"
            }`}>
              <div className="flex items-center justify-center gap-1.5 text-xs font-black">
                <Star className={`w-4 h-4 ${quizPercentage && quizPercentage >= 80 ? "fill-amber-400 text-amber-500" : "text-slate-400"}`} />
                <span>{quizPercentage && quizPercentage >= 80 ? "Sertifikat Kelulusan Aktif! 🏆" : "Sertifikat Belum Terbuka"}</span>
              </div>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                {quizPercentage && quizPercentage >= 80 
                  ? "Cetak sertifikatmu di tab Kuis Uji Coba!" 
                  : "Dapatkan nilai ≥ 80% untuk mengunduh sertifikat!"}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-dashed border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-semibold">Tantang pemahamanmu!</span>
            <button
              id="dash-btn-kuis"
              onClick={() => setView("kuis")}
              className="text-[#922B21] hover:text-[#C0392B] font-black text-xs flex items-center shrink-0"
            >
              Uji Coba <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

      </div>

      {/* 4. Papan Pengembang (Developer Credits Panel) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border-8 border-[#A9DFBF] shadow-2xl rounded-3xl p-6 md:p-8"
      >
        <div className="text-center space-y-2 max-w-xl mx-auto border-b-2 border-dashed border-[#A9DFBF] pb-4 mb-6">
          <div className="inline-flex items-center gap-1.5 bg-[#27AE60] text-white font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow-sm border border-white">
            <Users className="w-3.5 h-3.5" /> Tim Pengembang Hebat
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#2E4053]">
            Kenali Pengembang Aplikasi Kami 🐰🎓
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Aplikasi interaktif <strong>Gelombang Pintar</strong> ini didesain dan direkayasa oleh para mahasiswa berdedikasi tinggi untuk memudahkan pemahaman sains:
          </p>
        </div>

        {/* Developers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {developers.map((dev, idx) => (
            <div 
              key={idx}
              id={`dev-card-${idx}`}
              className={`p-5 flex flex-col justify-between transition-all duration-300 relative group rounded-2xl border-2 ${
                dev.highlight 
                  ? "bg-amber-50/75 border-[#F4D03F] shadow-md hover:shadow-xl scale-[1.02] md:scale-[1.03]" 
                  : "bg-slate-50 border-slate-100 hover:border-[#A9DFBF] hover:shadow-lg"
              }`}
            >
              {dev.highlight && (
                <div className="absolute -top-3.5 right-4 bg-[#F4D03F] text-[#7D6608] font-black text-[9px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md border border-white animate-pulse">
                  👑 Kontributor Terbanyak
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-white border shadow-md flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${
                    dev.highlight ? "border-[#F4D03F] bg-amber-50" : ""
                  }`}>
                    {dev.avatar}
                  </div>
                  <div>
                    <h4 className="font-black text-[#2E4053] text-sm md:text-base leading-tight flex items-center gap-1">
                      {dev.name} {dev.highlight && <span className="text-amber-500">★</span>}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                      Mahasiswa Fisika / Pengembang
                    </span>
                  </div>
                </div>

                <div className={`text-[10px] font-black px-2.5 py-1 rounded-lg border inline-block ${dev.color}`}>
                  {dev.role}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                  {dev.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-4 text-[9px] text-slate-400 font-bold flex items-center justify-between">
                <span className={dev.highlight ? "text-[#7D6608]" : ""}>⭐ Kontribusi Utama</span>
                <span className={dev.highlight ? "text-[#7D6608]" : ""}>Fisika Gelombang</span>
              </div>
            </div>
          ))}
        </div>

        {/* Collaborative quote or dedication */}
        <div className="bg-[#FEF9E7] border border-[#F7DC6F] p-4 rounded-2xl mt-6 flex items-start gap-3">
          <div className="text-2xl mt-0.5">💡</div>
          <div>
            <p className="text-xs font-black text-[#7D6608]">Apresiasi Pengembang:</p>
            <p className="text-[11px] text-[#7D6608] font-medium leading-relaxed mt-0.5">
              "Fisika bukan sekadar menghafal rumus di atas kertas, melainkan memahami getaran nyata di alam sekitar. Melalui kerja keras tim kami, kami berharap perangkat ponsel pintar yang ada di genggaman tangan dapat diubah menjadi alat laboratorium fisika yang canggih, interaktif, dan mudah diakses oleh seluruh siswa di Indonesia!"
            </p>
          </div>
        </div>
      </motion.div>

      {/* 5. Mascot Tip Corner */}
      <div className="bg-[#FEF9E7] border-4 border-[#F7DC6F] rounded-3xl p-5 flex flex-col md:flex-row items-center gap-4 relative">
        <div className="text-4xl animate-float">🐰</div>
        <div className="space-y-1 text-center md:text-left flex-1">
          <p className="text-xs font-black text-[#7D6608] block uppercase tracking-wider">
            Petunjuk dari Kiki Kelinci:
          </p>
          <p className="text-[11px] text-[#7D6608] font-medium leading-relaxed">
            "Apakah kamu tahu? <strong>Grafik dan tabel pada menu Praktikum Sensor akan otomatis terisi secara real-time</strong> sesaat setelah suara tepukanmu terdeteksi oleh kedua HP! Kamu tidak perlu menginputnya secara manual. Klik tab 'Praktikum Sensor' di atas untuk mencobanya sekarang!"
          </p>
        </div>
      </div>

    </div>
  );
}
