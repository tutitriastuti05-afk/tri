import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Award, CheckCircle2, RefreshCw, HelpCircle, AlertCircle, Play, Sparkles } from "lucide-react";

export default function Materi() {
  const [activeTab, setActiveTab] = useState<"definisi" | "rumus" | "contoh">("definisi");
  const [calcLambda, setCalcLambda] = useState<number>(4);
  const [calcFreq, setCalcFreq] = useState<number>(5);
  const [selectedSample, setSelectedSample] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [checkedAnswer, setCheckedAnswer] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gelombang_pintar_materi_read");
      const current = saved ? JSON.parse(saved) : {};
      current[activeTab] = true;
      localStorage.setItem("gelombang_pintar_materi_read", JSON.stringify(current));
    } catch (e) {
      console.error("Error saving reading progress:", e);
    }
  }, [activeTab]);

  // Practice sample questions
  const samples = [
    {
      question: "Sebuah gelombang memiliki panjang gelombang (λ) sebesar 6 meter dan bergetar dengan frekuensi (f) sebesar 10 Hz. Berapakah cepat rambat gelombang tersebut?",
      lambda: 6,
      freq: 10,
      answer: 60,
      options: [16, 4, 60, 1.6],
      explanation: "v = λ × f = 6 meter × 10 Hz = 60 m/s."
    },
    {
      question: "Suatu gelombang merambat dengan cepat rambat (v) sebesar 340 m/s. Jika frekuensinya (f) adalah 170 Hz, berapakah panjang gelombangnya (λ)?",
      lambda: 2,
      freq: 170,
      answer: 2,
      options: [0.5, 2, 510, 57800],
      explanation: "v = λ × f  =>  λ = v / f = 340 / 170 = 2 meter."
    }
  ];

  const handleCheckAnswer = (opt: number) => {
    if (opt === samples[selectedSample].answer) {
      setCheckedAnswer(true);
    } else {
      setCheckedAnswer(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 relative z-10" id="materi-section">
      {/* Title Sign */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative bg-white/90 backdrop-blur-md border-8 border-[#5DADE2] shadow-2xl rounded-3xl p-6 mb-8 text-center"
      >
        <div className="absolute -top-4 -left-4 bg-[#FF7F50] text-white shadow-lg rounded-full px-5 py-1.5 font-bold text-xs uppercase tracking-widest rotate-[-3deg] border-2 border-white animate-pulse">
          Materi Lengkap 📖
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#2E4053] tracking-tight mt-2">
          Cepat Rambat Gelombang
        </h1>
        <p className="text-[#546E7A] mt-2 text-sm md:text-base max-w-xl mx-auto font-medium">
          Yuk, belajar memahami bagaimana gelombang merambat melewati udara, tali, atau air bersama si kelinci cerdik!
        </p>
      </motion.div>

      {/* Navigation Tabs (Artistic Flair styled) */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
        {[
          { 
            id: "definisi", 
            label: "Definisi 🌊", 
            selectedClass: "bg-[#AED6F1] border-b-4 border-[#5DADE2] text-[#2874A6]" 
          },
          { 
            id: "rumus", 
            label: "Rumus & Variabel 📐", 
            selectedClass: "bg-[#A9DFBF] border-b-4 border-[#27AE60] text-[#1E8449]" 
          },
          { 
            id: "contoh", 
            label: "Contoh Soal 📝", 
            selectedClass: "bg-[#F1948A] border-b-4 border-[#C0392B] text-[#922B21]" 
          }
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id as any);
                setCheckedAnswer(null);
              }}
              className={`py-3 px-2 md:px-4 rounded-full font-bold text-xs md:text-sm transition-all ${
                isSelected 
                  ? `${tab.selectedClass} translate-y-[1px]` 
                  : "bg-white border-b-4 border-slate-200 text-[#546E7A] hover:bg-slate-50 hover:translate-y-[-1px]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === "definisi" && (
          <motion.div
            key="definisi"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Mascot Tip */}
            <div className="flex items-start gap-4 bg-white border-4 border-[#F7DC6F] shadow-xl rounded-3xl p-6">
              <div className="w-16 h-16 shrink-0 bg-[#F7DC6F] border-2 border-white rounded-full flex items-center justify-center text-3xl shadow-md animate-float">
                🐰
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-[#7D6608]">Kiki si Kelinci Gelombang berkata:</h3>
                <p className="text-[#546E7A] leading-relaxed text-sm md:text-base font-medium">
                  &quot;Tahukah kamu? Ketika kamu berteriak, suaramu merambat di udara dalam bentuk gelombang! 
                  <b> Cepat Rambat Gelombang</b> adalah jarak yang ditempuh oleh satu gelombang penuh dalam satu satuan detik!&quot;
                </p>
              </div>
            </div>

            {/* Core Card 1 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#EBF5FB] border-4 border-[#AED6F1] shadow-xl rounded-3xl p-6 space-y-4">
                <h3 className="text-xl font-black text-[#2874A6] flex items-center gap-2">
                  <span>🌊</span> Apa itu Gelombang?
                </h3>
                <p className="text-[#546E7A] text-sm md:text-base leading-relaxed font-medium">
                  Gelombang adalah <b>getaran yang merambat</b>, membawa energi dari satu titik ke titik lainnya tanpa memindahkan materi yang dilaluinya.
                </p>
                <div className="bg-white border-2 border-dashed border-[#AED6F1] p-4 rounded-2xl space-y-2">
                  <span className="font-bold text-xs text-[#2874A6] uppercase tracking-widest block">Contoh di Alam:</span>
                  <ul className="text-sm text-[#546E7A] font-semibold list-disc list-inside space-y-1">
                    <li>Riak air di kolam saat dilempar batu</li>
                    <li>Getaran senar gitar yang berbunyi</li>
                    <li>Gelombang laut yang menyapu pantai</li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#E8F8F5] border-4 border-[#A9DFBF] shadow-xl rounded-3xl p-6 space-y-4">
                <h3 className="text-xl font-black text-[#1E8449] flex items-center gap-2">
                  <span>⚡</span> Cepat Rambat Gelombang
                </h3>
                <p className="text-[#546E7A] text-sm md:text-base leading-relaxed font-medium">
                  Cepat rambat adalah <b>kecepatan gelombang berpindah tempat</b>. Seperti mobil yang berjalan di jalan raya, gelombang juga punya &quot;kecepatan&quot; dalam meter per sekon (m/s).
                </p>
                <div className="bg-white border-2 border-dashed border-[#A9DFBF] p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-sm text-[#546E7A] font-semibold">
                    <span className="text-2xl shrink-0">💡</span>
                    <span>Kecepatan gelombang dipengaruhi oleh <b>mediumnya</b>. Suara merambat lebih cepat di besi dibandingkan di udara!</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Types of Waves Mini-Demo */}
            <div className="bg-[#FEF9E7] border-4 border-[#F7DC6F] shadow-xl rounded-3xl p-6">
              <h3 className="text-xl font-black text-[#7D6608] mb-4 flex items-center gap-2 border-b-2 border-dashed border-[#F7DC6F] pb-2">
                <span>🎡</span> 2 Jenis Gelombang Berdasarkan Arah Rambatnya
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border-2 border-[#F7DC6F] p-4 rounded-2xl space-y-2 shadow-sm">
                  <h4 className="font-bold text-[#7D6608] flex items-center gap-2">
                    <span className="text-sky-500">〰️</span> Gelombang Transversal
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Arah getarannya <b>tegak lurus</b> dengan arah rambatan gelombang. Membentuk bukit dan lembah.
                  </p>
                  <div className="h-16 w-full bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center relative">
                    <svg className="w-full h-10" viewBox="0 0 400 40">
                      <path 
                        d="M 0 20 Q 25 5, 50 20 T 100 20 T 150 20 T 200 20 T 250 20 T 300 20 T 350 20 T 400 20" 
                        fill="none" 
                        stroke="#0ea5e9" 
                        strokeWidth="3"
                        className="animate-[wave-move_4s_linear_infinite]"
                      />
                    </svg>
                  </div>
                  <span className="text-[11px] text-slate-500 italic font-semibold block">Contoh: Gelombang tali, gelombang cahaya.</span>
                </div>

                <div className="bg-white border-2 border-[#F7DC6F] p-4 rounded-2xl space-y-2 shadow-sm">
                  <h4 className="font-bold text-[#7D6608] flex items-center gap-2">
                    <span className="text-emerald-500">🪗</span> Gelombang Longitudinal
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Arah getarannya <b>sejajar</b> dengan arah rambatan gelombang. Membentuk rapatan dan renggangan.
                  </p>
                  <div className="h-16 w-full bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex items-around justify-around relative px-4">
                    {/* Simulated slinky slinky effect */}
                    <div className="flex gap-2 w-full justify-between items-center h-full">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <motion.div 
                          key={i}
                          animate={{ 
                            scaleX: i % 2 === 0 ? [1, 1.8, 1] : [1.8, 1, 1.8],
                          }}
                          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          className="h-10 w-6 border-l-4 border-r-4 border-emerald-500 rounded-xs"
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 italic font-semibold block">Contoh: Gelombang suara di udara, gelombang slinki.</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "rumus" && (
          <motion.div
            key="rumus"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Formula Block */}
            <div className="bg-[#E8F8F5] border-4 border-[#A9DFBF] shadow-xl rounded-3xl p-6 text-center space-y-4">
              <h3 className="font-black text-2xl text-[#1E8449]">Rumus Segitiga Gelombang</h3>
              <p className="text-[#546E7A] text-sm max-w-md mx-auto font-medium">
                Sama seperti rumus Fisika seru lainnya, kita bisa menyusun rumus cepat rambat menjadi segitiga agar mudah dihafal!
              </p>

              {/* Formula Render */}
              <div className="inline-block bg-white border-2 border-dashed border-[#27AE60] rounded-2xl p-6 px-10 my-4 shadow-sm">
                <div className="text-5xl font-black text-slate-800 flex items-center justify-center gap-4">
                  <span className="text-[#2874A6]">v</span>
                  <span className="text-3xl text-slate-400">=</span>
                  <span className="text-[#1E8449]">λ</span>
                  <span className="text-3xl text-slate-400">×</span>
                  <span className="text-[#D4AC0D]">f</span>
                </div>
              </div>

              {/* Variables Legend */}
              <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto text-left mt-4">
                <div className="bg-white border-2 border-[#5DADE2] p-4 rounded-2xl">
                  <h4 className="font-black text-[#2874A6] text-lg">v</h4>
                  <p className="font-bold text-sm text-slate-700">Cepat Rambat Gelombang</p>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Satuan: meter / sekon (m/s)</p>
                </div>
                <div className="bg-white border-2 border-[#27AE60] p-4 rounded-2xl">
                  <h4 className="font-black text-[#1E8449] text-lg">λ (Lambda)</h4>
                  <p className="font-bold text-sm text-slate-700">Panjang Gelombang</p>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Satuan: meter (m)</p>
                </div>
                <div className="bg-white border-2 border-[#D4AC0D] p-4 rounded-2xl">
                  <h4 className="font-black text-[#7D6608] text-lg">f (Frekuensi)</h4>
                  <p className="font-bold text-sm text-slate-700">Frekuensi Gelombang</p>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Satuan: Hertz (Hz)</p>
                </div>
              </div>
            </div>

            {/* Interactive Calculator Box */}
            <div className="bg-white border-4 border-[#F7DC6F] shadow-xl rounded-3xl p-6 space-y-4">
              <h3 className="font-black text-xl text-[#7D6608] flex items-center gap-2 border-b-2 border-dashed border-[#F7DC6F] pb-2">
                <span>🧮</span> Kalkulator Mini Interaktif
              </h3>
              <p className="text-sm text-[#546E7A] font-medium">
                Ubah angka panjang gelombang (λ) dan frekuensi (f) di bawah ini untuk melihat hasil cepat rambatnya secara otomatis!
              </p>

              <div className="grid md:grid-cols-2 gap-6 p-5 bg-[#FEF9E7] border border-[#F7DC6F] rounded-2xl">
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-slate-700 text-sm flex justify-between">
                      <span>Panjang Gelombang (λ):</span>
                      <span className="text-[#1E8449] font-black">{calcLambda} meter</span>
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="20" 
                      value={calcLambda} 
                      onChange={(e) => setCalcLambda(Number(e.target.value))}
                      className="w-full accent-[#27AE60] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 text-sm flex justify-between">
                      <span>Frekuensi (f):</span>
                      <span className="text-[#7D6608] font-black">{calcFreq} Hz</span>
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="30" 
                      value={calcFreq} 
                      onChange={(e) => setCalcFreq(Number(e.target.value))}
                      className="w-full accent-[#F7DC6F] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-white border border-[#F7DC6F] rounded-xl p-4 text-center space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Perhitungan:</span>
                  <div className="font-mono text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-lg font-semibold">
                    v = λ × f
                  </div>
                  <div className="font-mono text-sm text-slate-700">
                    v = <span className="text-[#1E8449] font-bold">{calcLambda} m</span> × <span className="text-[#7D6608] font-bold">{calcFreq} Hz</span>
                  </div>
                  <div className="text-3xl font-black text-[#2874A6] pt-2 border-t border-slate-100 w-full">
                    v = {calcLambda * calcFreq} m/s
                  </div>
                </div>
              </div>
            </div>

            {/* Relationship summary */}
            <div className="bg-[#FEF9E7] border-4 border-[#F7DC6F] shadow-xl rounded-3xl p-6">
              <h3 className="font-black text-[#7D6608] text-lg mb-2 flex items-center gap-2">
                <span>⭐</span> Hubungan Antar Variabel
              </h3>
              <ul className="space-y-2 text-sm text-[#546E7A] font-medium list-inside list-disc">
                <li>Jika <b>frekuensi (f) bertambah</b> dan panjang gelombang (λ) tetap, maka cepat rambat gelombang (v) akan <b>bertambah besar</b>.</li>
                <li>Jika <b>panjang gelombang (λ) bertambah</b> dan frekuensi (f) tetap, maka cepat rambat gelombang (v) juga akan <b>bertambah besar</b>.</li>
                <li>Pada medium yang sama (misal udara saja), cepat rambat gelombang cenderung konstan. Oleh karena itu, jika frekuensi diperbesar, panjang gelombang akan otomatis mengecil agar nilai perkaliannya tetap sama!</li>
              </ul>
            </div>
          </motion.div>
        )}

        {activeTab === "contoh" && (
          <motion.div
            key="contoh"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Selector buttons */}
            <div className="flex gap-4">
              {samples.map((_, idx) => {
                const isSelected = selectedSample === idx;
                return (
                  <button
                    key={idx}
                    id={`sample-btn-${idx}`}
                    onClick={() => {
                      setSelectedSample(idx);
                      setCheckedAnswer(null);
                    }}
                    className={`px-5 py-2.5 rounded-full font-bold text-xs md:text-sm transition-all ${
                      isSelected 
                        ? "bg-[#F1948A] border-b-4 border-[#C0392B] text-[#922B21] translate-y-[1px]" 
                        : "bg-white border-b-4 border-slate-200 text-[#546E7A] hover:bg-slate-50 hover:translate-y-[-1px]"
                    }`}
                  >
                    Contoh Soal {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Question Card */}
            <div className="bg-white border-4 border-[#F1948A] shadow-xl rounded-3xl p-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#C0392B] uppercase tracking-widest block">Latihan Yuk!</span>
                <p className="text-lg font-black text-[#2E4053] leading-relaxed">
                  {samples[selectedSample].question}
                </p>
              </div>

              {/* Interactive choices */}
              <div className="grid grid-cols-2 gap-4">
                {samples[selectedSample].options.map((opt, idx) => (
                  <button
                    key={idx}
                    id={`opt-btn-${idx}`}
                    onClick={() => handleCheckAnswer(opt)}
                    className="p-4 rounded-2xl border-2 border-[#F1948A] font-bold text-[#922B21] bg-[#FDF2F2] hover:bg-[#FCE4E4] shadow-sm text-left transition-all hover:translate-y-[-1px]"
                  >
                    {opt} {selectedSample === 0 ? "m/s" : "meter"}
                  </button>
                ))}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {checkedAnswer !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 border-2 rounded-2xl flex items-start gap-3 ${
                      checkedAnswer 
                        ? "bg-[#E8F8F5] border-[#27AE60] text-[#1E8449]" 
                        : "bg-[#FDF2F2] border-[#C0392B] text-[#922B21]"
                    }`}
                  >
                    <div className="text-2xl mt-0.5">
                      {checkedAnswer ? "🎉" : "😅"}
                    </div>
                    <div>
                      <h4 className="font-bold text-base mb-1">
                        {checkedAnswer ? "Wah, Jawabanmu Benar! Hebat!" : "Oops, Masih Kurang Tepat! Coba lagi ya!"}
                      </h4>
                      <p className="text-sm opacity-90 font-mono mt-1 font-semibold">
                        <b>Penjelasan:</b> {samples[selectedSample].explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
