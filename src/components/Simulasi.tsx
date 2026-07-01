import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Play, Pause, RefreshCw, Zap, Gauge, Eye, Activity } from "lucide-react";

export default function Simulasi() {
  const [waveType, setWaveType] = useState<"transversal" | "longitudinal">("transversal");
  const [lambda, setLambda] = useState<number>(3.0); // Wavelength in meters (1.0 - 6.0)
  const [frequency, setFrequency] = useState<number>(2.0); // Frequency in Hz (0.5 - 5.0)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  const speed = Number((lambda * frequency).toFixed(2)); // v = lambda * f (m/s)

  // Animation frame logic for time variable
  const [time, setTime] = useState<number>(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    let lastTime = performance.now();
    const animate = (now: number) => {
      if (isPlaying) {
        const delta = (now - lastTime) / 1000; // in seconds
        // Speed affects how fast time ticks in the wave equation
        // Wave equation: y = A * sin(k*x - omega*t)
        // omega = 2 * pi * f. Let's accumulate time based on frequency.
        setTime((prev) => prev + delta * frequency * 2 * Math.PI);
      }
      lastTime = now;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, frequency]);

  // Reset simulation variables
  const handleReset = () => {
    setLambda(3.0);
    setFrequency(2.0);
    setTime(0);
    setIsPlaying(true);
  };

  // Generate path for transversal wave
  // We will map a container width of 500px to represent 10 meters of physical space
  const getTransversalPath = () => {
    const points: string[] = [];
    const width = 600;
    const height = 150;
    const amplitude = 35;
    const centerY = height / 2;

    // Physical scale: 600px width = 12 meters
    // Pixels per meter = 50px
    const pxPerMeter = 50;
    // k (wave number) = 2 * pi / lambda
    const k = (2 * Math.PI) / (lambda * pxPerMeter);

    for (let x = 0; x <= width; x += 3) {
      // Wave equation: y = A * sin(k*x - time)
      const y = centerY + amplitude * Math.sin(k * x - time);
      if (x === 0) {
        points.push(`M ${x} ${y}`);
      } else {
        points.push(`L ${x} ${y}`);
      }
    }
    return points.join(" ");
  };

  // Get current speed category mascot
  const getMascotCommentary = () => {
    if (speed < 4.0) {
      return {
        emoji: "🐢",
        animal: "Tomi si Kura-kura",
        text: "Sangat lambat! Tomi si Kura-kura bisa mengikutinya sambil berjalan santai. Cepat rambat rendah karena frekuensi atau panjang gelombangnya kecil.",
        color: "bg-teal-50 border-4 border-teal-300 text-teal-900 shadow-lg"
      };
    } else if (speed < 10.0) {
      return {
        emoji: "🐑",
        animal: "Mimi si Domba",
        text: "Sedang! Mimi si Domba bisa berjalan cepat menyamai gelombang ini. Kombinasi frekuensi dan panjang gelombang yang pas!",
        color: "bg-emerald-50 border-4 border-emerald-300 text-emerald-900 shadow-lg"
      };
    } else if (speed < 18.0) {
      return {
        emoji: "🐰",
        animal: "Kiki si Kelinci",
        text: "Cepat sekali! Kiki si Kelinci harus melompat-lompat dengan lincah untuk mengejar ujung gelombang ini!",
        color: "bg-amber-50 border-4 border-amber-300 text-amber-900 shadow-lg"
      };
    } else {
      return {
        emoji: "🚀",
        animal: "Ciko si Cheetah",
        text: "Wuuusshhh! Super Cepat! Ciko si Cheetah harus berlari sekencang roket untuk menyusul gelombang berenergi tinggi ini!",
        color: "bg-rose-50 border-4 border-rose-300 text-rose-900 shadow-lg"
      };
    }
  };

  const mascot = getMascotCommentary();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 relative z-10" id="simulasi-section">
      {/* Wave Title Sign */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative bg-white/90 backdrop-blur-md border-8 border-[#5DADE2] shadow-2xl rounded-3xl p-6 mb-8 text-center"
      >
        <div className="absolute -top-4 -left-4 bg-[#FF7F50] text-white shadow-lg rounded-full px-5 py-1.5 font-bold text-xs uppercase tracking-widest rotate-[-3deg] border-2 border-white animate-pulse">
          Laboratorium Simulasi 🧪
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#2E4053] tracking-tight mt-2">
          Simulasi Gelombang Interaktif
        </h1>
        <p className="text-[#546E7A] mt-2 text-sm md:text-base max-w-xl mx-auto font-medium">
          Ubah-ubah nilai variabel di bawah untuk melihat bagaimana bentuk dan kecepatan rambat gelombang berubah secara langsung!
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Side: Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border-4 border-[#A9DFBF] shadow-xl rounded-3xl p-6 space-y-5">
            <h3 className="font-black text-lg text-[#1E8449] border-b-2 border-dashed border-[#A9DFBF] pb-2 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-emerald-500" />
              Pengaturan Gelombang
            </h3>

            {/* Toggle Wave Type */}
            <div className="space-y-2">
              <span className="font-bold text-xs text-[#546E7A] uppercase tracking-wider block">Tipe Gelombang:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-wave-transversal"
                  onClick={() => setWaveType("transversal")}
                  className={`py-2 px-3 rounded-full font-bold text-xs transition-all ${
                    waveType === "transversal"
                      ? "bg-[#AED6F1] border-b-4 border-[#5DADE2] text-[#2874A6] translate-y-[1px]"
                      : "bg-white border-b-4 border-slate-200 text-[#546E7A] hover:bg-slate-50 hover:translate-y-[-1px]"
                  }`}
                >
                  🌊 Transversal
                </button>
                <button
                  id="btn-wave-longitudinal"
                  onClick={() => setWaveType("longitudinal")}
                  className={`py-2 px-3 rounded-full font-bold text-xs transition-all ${
                    waveType === "longitudinal"
                      ? "bg-[#A9DFBF] border-b-4 border-[#27AE60] text-[#1E8449] translate-y-[1px]"
                      : "bg-white border-b-4 border-slate-200 text-[#546E7A] hover:bg-slate-50 hover:translate-y-[-1px]"
                  }`}
                >
                  🪗 Longitudinal
                </button>
              </div>
            </div>

            {/* Slider Wavelength */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <span className="text-[#1E8449] font-black">λ</span> (Panjang Gelombang):
                </span>
                <span className="text-[#1E8449] font-black">{lambda} m</span>
              </div>
              <input
                id="slider-lambda"
                type="range"
                min="1.0"
                max="6.0"
                step="0.1"
                value={lambda}
                onChange={(e) => setLambda(Number(e.target.value))}
                className="w-full accent-[#27AE60] cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block italic font-medium">
                Jarak antara dua puncak bukit yang berurutan.
              </span>
            </div>

            {/* Slider Frequency */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <span className="text-[#7D6608] font-black">f</span> (Frekuensi):
                </span>
                <span className="text-[#7D6608] font-black">{frequency} Hz</span>
              </div>
              <input
                id="slider-frequency"
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full accent-[#F7DC6F] cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block italic font-medium">
                Banyaknya puncak gelombang yang lewat setiap detiknya.
              </span>
            </div>

            {/* Play/Pause/Reset Controls */}
            <div className="flex gap-2 pt-2">
              <button
                id="btn-play-pause"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 py-3 px-5 rounded-full font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all hover:translate-y-[1px] active:translate-y-[2px] ${
                  isPlaying 
                    ? "bg-[#F1948A] border-b-4 border-[#C0392B] text-[#922B21]" 
                    : "bg-[#AED6F1] border-b-4 border-[#5DADE2] text-[#2874A6]"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Jalankan
                  </>
                )}
              </button>
              <button
                id="btn-reset-sim"
                onClick={handleReset}
                className="p-3 bg-white border-b-4 border-slate-200 text-slate-600 hover:bg-slate-50 hover:translate-y-[-1px] rounded-full shadow-sm transition-all"
                title="Reset"
              >
                <RefreshCw className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Visualizer and Calculations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Wave Screen Canvas */}
          <div className="bg-white border-4 border-[#5DADE2] shadow-2xl rounded-3xl p-5 overflow-hidden relative flex flex-col justify-between">
            {/* Background elements for outdoor cartoon feel */}
            <div className="absolute top-4 right-10 flex gap-4 opacity-30 select-none pointer-events-none">
              <div className="text-4xl animate-float-delayed">☁️</div>
              <div className="text-3xl animate-float">☁️</div>
            </div>
            <div className="absolute top-2 left-6 text-4xl opacity-40 select-none pointer-events-none animate-spin" style={{ animationDuration: "30s" }}>
              ☀️
            </div>

            {/* Live Data Badge */}
            <div className="flex justify-between items-center z-10 mb-4">
              <div className="bg-white/90 backdrop-blur-xs border border-[#5DADE2] shadow-sm rounded-full px-4 py-1.5 text-xs font-bold text-[#2874A6] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                Live wave view
              </div>
              <div className="bg-[#FF7F50] text-white shadow-md rounded-full px-4 py-1 text-xs font-black rotate-3 border-2 border-white">
                v = {speed} m/s
              </div>
            </div>

            {/* The Wave Graphic */}
            <div className="h-44 bg-slate-50/50 border border-slate-100 rounded-2xl relative flex items-center justify-center overflow-hidden">
              {waveType === "transversal" ? (
                <>
                  <svg className="w-full h-full" viewBox="0 0 600 150">
                    {/* Grid lines */}
                    <g stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5">
                      <line x1="0" y1="75" x2="600" y2="75" />
                      {[50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550].map((x) => (
                        <line key={x} x1={x} y1="0" x2={x} y2="150" />
                      ))}
                    </g>
                    {/* Ocean Wave Path */}
                    <path
                      d={getTransversalPath()}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    {/* Seafoam/Inner path */}
                    <path
                      d={getTransversalPath()}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.8"
                    />

                    {/* Animated mascot surfing the wave */}
                    {(() => {
                      const mascotX = 300;
                      const pxPerMeter = 50;
                      const k = (2 * Math.PI) / (lambda * pxPerMeter);
                      const mascotY = 75 + 35 * Math.sin(k * mascotX - time);
                      const slope = 35 * k * Math.cos(k * mascotX - time);
                      const angle = (Math.atan(slope) * 180) / Math.PI;

                      return (
                        <g transform={`translate(${mascotX}, ${mascotY}) rotate(${angle})`}>
                          {/* Surfboard */}
                          <ellipse cx="0" cy="8" rx="20" ry="4" fill="#f43f5e" stroke="#1e293b" strokeWidth="2" />
                          {/* Surfer Mascot */}
                          <text x="-10" y="-3" fontSize="24" className="select-none">
                            {mascot.emoji}
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                  <div className="absolute bottom-1.5 left-3 text-[10px] font-mono text-slate-400 font-semibold">
                    Mascot surfing with velocity v = {speed} m/s
                  </div>
                </>
              ) : (
                // Longitudinal Wave representation (Sound waves or slinky)
                <div className="w-full h-full flex flex-col justify-center items-center px-6">
                  <div className="w-full h-24 bg-white border border-slate-100 rounded-xl relative overflow-hidden flex items-center justify-around">
                    {/* Sound waves emitted from a speaker on the left */}
                    <div className="absolute left-2 text-4xl z-10 animate-float">
                      📢
                    </div>
                    
                    {/* Dynamic bars representing compression/rarefaction */}
                    <div className="w-full h-full flex justify-between items-center pl-14 pr-4">
                      {Array.from({ length: 28 }).map((_, idx) => {
                        const x = idx * 15;
                        const pxPerMeter = 30;
                        const k = (2 * Math.PI) / (lambda * pxPerMeter);
                        const displacement = 12 * Math.cos(k * x - time);

                        return (
                          <motion.div
                            key={idx}
                            animate={{
                              x: isPlaying ? [displacement, displacement] : 0,
                            }}
                            transition={{ duration: 0.05 }}
                            className="h-16 w-1 rounded-full bg-emerald-500"
                            style={{
                              opacity: 0.3 + (Math.cos(k * x - time) + 1) * 0.35
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Cute floating notes going right at the wave speed */}
                    {isPlaying && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[1, 2, 3].map((n) => {
                          const duration = 12 / (frequency * lambda || 1);
                          return (
                            <motion.div
                              key={n}
                              initial={{ x: 50, y: 30 + n * 15, opacity: 0 }}
                              animate={{ x: 550, opacity: [0, 1, 1, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: Math.max(1, Math.min(6, duration)),
                                delay: n * 0.8,
                                ease: "linear"
                              }}
                              className="absolute text-sm"
                            >
                              🎵
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Grass Footer */}
            <div className="h-8 bg-[#A9DFBF] border-t-2 border-[#27AE60] rounded-b-2xl mt-4 flex items-center justify-between px-4">
              <span className="text-[10px] font-bold text-[#1E8449]">MEDIUM MERAMBAT: UDARA SEKITAR</span>
              <div className="flex gap-1 select-none">
                <span className="text-xs">🌱</span>
                <span className="text-xs">🌼</span>
              </div>
            </div>
          </div>

          {/* Mathematical Connection Panel */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border-4 border-[#AED6F1] shadow-xl rounded-3xl p-5 space-y-3">
              <h4 className="font-black text-slate-800 flex items-center gap-1.5">
                <Activity className="w-4.5 h-4.5 text-emerald-500" />
                Bagaimana Menghitungnya?
              </h4>
              <p className="text-xs text-[#546E7A] leading-relaxed font-semibold">
                Kecepatan gelombang (<span className="text-[#2874A6] font-bold">v</span>) adalah hasil perkalian antara panjang gelombang (<span className="text-[#1E8449] font-bold">λ</span>) dengan frekuensinya (<span className="text-[#7D6608] font-bold">f</span>).
              </p>
              <div className="bg-[#EBF5FB] border-2 border-dashed border-[#AED6F1] p-3 rounded-xl font-mono text-center text-xs text-slate-700">
                <div className="font-bold">v = λ × f</div>
                <div className="text-[11px] text-slate-500 mt-1 font-semibold">
                  v = {lambda} m × {frequency} Hz
                </div>
                <div className="font-extrabold text-[#2874A6] mt-1 text-sm">
                  v = {speed} m/s
                </div>
              </div>
            </div>

            {/* Character bubble commentary */}
            <div className={`rounded-3xl p-5 flex gap-3 items-start transition-all ${mascot.color}`}>
              <div className="text-3xl animate-bounce">{mascot.emoji}</div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-800">{mascot.animal} berkata:</h4>
                <p className="text-xs leading-relaxed opacity-95 font-semibold">{mascot.text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
