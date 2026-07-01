import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, ChevronRight, Play, BookOpen, Award, Compass, Activity, Smile, Info, BookOpenCheck } from "lucide-react";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Materi from "./components/Materi";
import Simulasi from "./components/Simulasi";
import Praktikum from "./components/Praktikum";
import Kuis from "./components/Kuis";

export default function App() {
  const [currentView, setCurrentView] = useState<"dashboard" | "materi" | "simulasi" | "praktikum" | "kuis">("dashboard");
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Quick introduction mascot tips
  const tips = [
    {
      title: "Bagaimana cara melakukan Praktikum 2 HP?",
      desc: "Siapkan 2 HP. Di HP 1, klik 'Create Room' dan masukkan jarak (misal 5 meter). Di HP 2, masukkan kode Room 4 digit dan klik 'Gabung'. Aktifkan sensor mikrofon pada kedua HP. Letakkan HP 1 dekat sumber tepukan dan HP 2 pada jarak 5 meter. Bertepuklah keras sekali di dekat HP 1. Bunyi tepukan akan terekam oleh HP 1 dan merambat ke HP 2 secara otomatis untuk dihitung kecepatannya!"
    },
    {
      title: "Bagaimana cara melakukan Praktikum 1 HP (Gema)?",
      desc: "Pilih tab 'Metode Gema (1 HP)', masukkan jarak antara kamu berdiri dengan dinding datar (misal 3 meter). Aktifkan sensor mikrofon. Berdirilah tegak menghadap dinding, lalu tepuk tangan keras satu kali. HP akan menghitung selisih waktu bunyi asli dengan pantulannya (gema) untuk menghitung kecepatan bunyi!"
    },
    {
      title: "Tips menghindari gangguan suara (Noise/Galat):",
      desc: "Lakukan praktikum di ruangan yang relatif tenang agar mikrofon tidak terpicu suara bising latar belakang. Kamu bisa mengatur sensitivitas pemicu mikrofon menggunakan slider di panel Sensor Mikrofon."
    }
  ];

  return (
    <div className="min-h-screen bg-[#87CEEB] flex flex-col relative overflow-x-hidden print:bg-white print:min-h-0 font-sans" id="main-container">
      {/* Background blobs and hills for Artistic Flair */}
      <div className="absolute inset-0 w-full h-full opacity-35 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-44 h-44 bg-white rounded-full blur-2xl"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 w-full h-1/3 bg-[#7DCEA0] rounded-t-[100px]"></div>
      </div>

      {/* Background Outdoor Cartoon elements (clouds) */}
      <div className="absolute top-20 left-[10%] opacity-30 pointer-events-none select-none text-6xl animate-float z-0">☁️</div>
      <div className="absolute top-48 right-[15%] opacity-35 pointer-events-none select-none text-5xl animate-float-delayed z-0">☁️</div>
      <div className="absolute bottom-40 left-[5%] opacity-20 pointer-events-none select-none text-4xl animate-float-delayed z-0">☁️</div>

      {/* Main Navigation (Hidden on print) */}
      <div className="print:hidden relative z-20">
        <Navigation currentView={currentView} setView={setCurrentView} />
      </div>

      {/* Core Educational Mascot Welcome Sign (Only shown on main Materi tab when starting) */}
      {currentView === "materi" && (
        <div className="max-w-4xl mx-auto px-4 pt-8 print:hidden relative z-10">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 backdrop-blur-md border-4 border-[#A9DFBF] shadow-2xl rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6"
          >
            <div className="w-20 h-20 bg-[#FF7F50] rounded-2xl rotate-3 flex items-center justify-center shadow-lg border-2 border-white shrink-0 select-none text-4xl animate-bounce">
              🐰
            </div>
            <div className="space-y-2 text-center md:text-left flex-1">
              <h2 className="text-xl md:text-2xl font-black text-[#2E4053] tracking-tight">
                Selamat Datang di Gelombang Pintar!
              </h2>
              <p className="text-xs md:text-sm text-[#546E7A] font-medium leading-relaxed">
                Halo! Aku <strong>Kiki si Kelinci Gelombang</strong>, mascot pemandumu! Di aplikasi ini, kamu bisa belajar Fisika 
                secara menyenangkan: membaca materi seru, bermain dengan simulasi ombak pantai, melakukan pengukuran cepat rambat suara 
                langsung pakai HP-mu, dan mengikuti kuis berhadiah sertifikat!
              </p>
              <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                <button
                  id="btn-quick-sim"
                  onClick={() => setCurrentView("simulasi")}
                  className="px-4 py-2 bg-[#AED6F1] border-b-2 border-[#5DADE2] text-[#2874A6] rounded-full font-bold text-xs flex items-center gap-1.5 transition-all hover:translate-y-[1px] active:translate-y-[2px]"
                >
                  <Compass className="w-3.5 h-3.5" /> Buka Simulasi
                </button>
                <button
                  id="btn-quick-sensor"
                  onClick={() => setCurrentView("praktikum")}
                  className="px-4 py-2 bg-[#A9DFBF] border-b-2 border-[#27AE60] text-[#1E8449] rounded-full font-bold text-xs flex items-center gap-1.5 transition-all hover:translate-y-[1px] active:translate-y-[2px]"
                >
                  <Activity className="w-3.5 h-3.5" /> Eksperimen Riil (2 HP)
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Dynamic Viewport Frame */}
      <main className="flex-1 pb-24 relative z-10 print:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {currentView === "dashboard" && <Dashboard setView={setCurrentView} />}
            {currentView === "materi" && <Materi />}
            {currentView === "simulasi" && <Simulasi />}
            {currentView === "praktikum" && <Praktikum />}
            {currentView === "kuis" && <Kuis />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer styled beautifully with #212F3D (Artistic Flair) */}
      <footer className="relative z-40 px-12 py-5 bg-[#212F3D] text-white/60 text-xs flex flex-col md:flex-row justify-between items-center gap-4 border-t-4 border-[#2E4053] print:hidden">
        <p>© 2026 Gelombang Pintar - Media Pembelajaran Interaktif Fisika</p>
        <div className="flex gap-6 text-xs">
          <span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" /> Sensor Ready</span>
          <span className="flex items-center gap-1.5 font-bold"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" /> Devices Synced</span>
          <span className="text-xs select-none">🌱🌼🌱</span>
        </div>
      </footer>

      {/* Persistent Help Floating Bubble button (Hidden on print) */}
      <button
        id="floating-help-btn"
        onClick={() => setShowHelpModal(true)}
        className="fixed bottom-14 right-4 z-50 p-3 bg-yellow-400 hover:bg-yellow-500 text-slate-800 rounded-full border-cartoon shadow-cartoon hover:scale-110 active:scale-95 transition-all print:hidden"
        title="Bantuan Praktikum"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* Help Instructions Modal Popup Dialog */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-cartoon shadow-cartoon-lg rounded-3xl p-6 max-w-lg w-full relative"
            >
              <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                <span>📚</span> Panduan Eksperimen & Tips
              </h3>
              
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {tips.map((tip, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 border-cartoon-sm rounded-2xl space-y-1.5">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                      <span className="text-amber-500">⭐</span> {tip.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  id="close-help-modal-btn"
                  onClick={() => setShowHelpModal(false)}
                  className="py-2 px-5 bg-pink-400 hover:bg-pink-500 text-slate-800 font-extrabold rounded-xl border-cartoon shadow-cartoon-sm hover:-translate-y-0.5 active:translate-y-0.5 text-xs transition-all"
                >
                  Mengerti, Kiki! 👍
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
