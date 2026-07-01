import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, RefreshCw, CheckCircle, XCircle, ArrowRight, Star, Heart, Printer } from "lucide-react";
import { QuizQuestion } from "../types";

export default function Kuis() {
  const [studentName, setStudentName] = useState<string>(() => {
    return localStorage.getItem("gelombang_pintar_student_name") || "";
  });
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const questions: QuizQuestion[] = [
    {
      id: 1,
      question: "Apa rumus yang tepat untuk menghitung cepat rambat gelombang (v) jika diketahui panjang gelombang (λ) dan frekuensi (f)?",
      options: [
        "v = λ + f",
        "v = λ / f",
        "v = λ × f",
        "v = f / λ"
      ],
      correctAnswer: 2,
      explanation: "Rumus dasar cepat rambat gelombang adalah perkalian panjang gelombang dengan frekuensi (v = λ × f)."
    },
    {
      id: 2,
      question: "Sebuah gelombang air memiliki panjang gelombang 4 meter. Jika dalam waktu 1 detik terbentuk 5 gelombang penuh, berapakah cepat rambat gelombang tersebut?",
      options: [
        "1.25 m/s",
        "9 m/s",
        "20 m/s",
        "0.8 m/s"
      ],
      correctAnswer: 2,
      explanation: "Jumlah gelombang per detik adalah frekuensi (f = 5 Hz). Maka v = λ × f = 4 m × 5 Hz = 20 m/s."
    },
    {
      id: 3,
      question: "Pada suatu medium yang sama, jika kita memperbesar frekuensi gelombang menjadi dua kali lipat, apa yang akan terjadi pada panjang gelombangnya?",
      options: [
        "Panjang gelombang bertambah dua kali lipat",
        "Panjang gelombang berkurang menjadi setengahnya",
        "Panjang gelombang tetap tidak berubah",
        "Panjang gelombang menjadi nol"
      ],
      correctAnswer: 1,
      explanation: "Karena pada medium yang sama kecepatan (v) konstan, perkalian λ × f harus tetap. Jika f dikali 2, maka λ harus dibagi 2 (setengahnya)."
    },
    {
      id: 4,
      question: "Manakah di bawah ini yang merupakan contoh dari gelombang longitudinal yang merambat di sekitar kita sehari-hari?",
      options: [
        "Gelombang cahaya dari lampu",
        "Gelombang riak air kolam",
        "Gelombang suara di udara",
        "Gelombang getaran senar gitar"
      ],
      correctAnswer: 2,
      explanation: "Gelombang suara/bunyi di udara merambat dalam bentuk rapatan dan renggangan, sehingga tergolong gelombang longitudinal."
    },
    {
      id: 5,
      question: "Mengapa suara merambat lebih cepat di dalam air atau besi (benda padat/cair) dibandingkan di udara (gas)?",
      options: [
        "Karena partikel zat padat dan cair lebih rapat sehingga lebih cepat mentransfer getaran",
        "Karena udara menghalangi sinar matahari untuk merambat",
        "Karena besi memiliki gravitasi yang lebih kuat daripada udara",
        "Karena air mengalir lebih cepat daripada angin"
      ],
      correctAnswer: 0,
      explanation: "Kerapatan medium mempengaruhi kecepatan rambat suara. Partikel zat padat yang sangat rapat membuat energi getaran merambat jauh lebih cepat daripada partikel gas yang renggang."
    }
  ];

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert("Masukkan namamu dulu ya, biar bisa dicetak di sertifikat kelulusan!");
      return;
    }
    try {
      localStorage.setItem("gelombang_pintar_student_name", studentName.trim());
    } catch (err) {
      console.error("Error saving student name:", err);
    }
    setQuizStarted(true);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswerChecked(false);
    setScore(0);
    setQuizFinished(false);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedOpt(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOpt === null) {
      alert("Pilih salah satu jawaban dulu ya!");
      return;
    }
    setIsAnswerChecked(true);
    if (selectedOpt === questions[currentIdx].correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOpt(null);
    setIsAnswerChecked(false);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      try {
        localStorage.setItem("gelombang_pintar_student_name", studentName.trim());
        localStorage.setItem("gelombang_pintar_quiz_score", score.toString());
        localStorage.setItem("gelombang_pintar_quiz_total", questions.length.toString());
        const pct = Math.round((score / questions.length) * 100);
        localStorage.setItem("gelombang_pintar_quiz_percentage", pct.toString());
      } catch (err) {
        console.error("Error saving quiz results:", err);
      }
    }
  };

  const handleRestartQuiz = () => {
    setQuizStarted(false);
    setSelectedOpt(null);
    setIsAnswerChecked(false);
    setScore(0);
    setQuizFinished(false);
  };

  const scorePercentage = Math.round((score / questions.length) * 100);

  return (
    <div className="max-w-xl mx-auto px-4 py-6" id="kuis-section">
      {/* Title Sign */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative bg-white/95 backdrop-blur-md border-8 border-[#F1948A] shadow-2xl rounded-3xl p-6 mb-8 text-center"
      >
        <div className="absolute -top-4 -left-4 bg-[#C0392B] text-white shadow-lg rounded-full px-5 py-1.5 font-bold text-xs uppercase tracking-widest rotate-[-3deg] border-2 border-white animate-pulse">
          Kuis Seru 🏆
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-[#2E4053] tracking-tight mt-2">
          Uji Pemahamanmu
        </h1>
        <p className="text-[#546E7A] mt-2 text-sm max-w-sm mx-auto font-medium">
          Asah kemampuan Fisikamu dan dapatkan Sertifikat Juara Kelinci Gelombang!
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* STAGE 1: ENTER NAME */}
        {!quizStarted && (
          <motion.div
            key="name-stage"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border-4 border-[#F1948A] shadow-xl rounded-3xl p-6 text-center space-y-6"
          >
            <div className="text-5xl animate-float">🐰</div>
            <div className="space-y-2">
              <h3 className="font-black text-xl text-slate-800">Halo, Teman Pintar!</h3>
              <p className="text-sm text-slate-600 font-medium">
                Kiki si Kelinci Gelombang sudah menyiapkan 5 pertanyaan menantang. Tulis namamu di bawah untuk memulai!
              </p>
            </div>

            <form onSubmit={handleStartQuiz} className="space-y-4">
              <input
                id="input-student-name"
                type="text"
                placeholder="Tulis nama lengkapmu di sini..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full p-4 border-2 border-[#F1948A] rounded-2xl text-center font-black text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#F1948A]/30 outline-none"
              />
              <button
                id="btn-start-kuis"
                type="submit"
                className="w-full py-3.5 bg-[#F1948A] border-b-4 border-[#C0392B] text-white font-black rounded-full hover:bg-[#EAA199] hover:translate-y-[-1px] transition-all text-sm uppercase tracking-wider shadow-sm"
              >
                Mulai Kuis Sekarang! 🚀
              </button>
            </form>
          </motion.div>
        )}

        {/* STAGE 2: THE QUESTIONS */}
        {quizStarted && !quizFinished && (
          <motion.div
            key="question-stage"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border-4 border-[#F1948A] shadow-xl rounded-3xl p-6 space-y-6"
          >
            {/* Header Status */}
            <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
              <span className="text-xs bg-rose-50 border border-[#F1948A]/30 px-3 py-1 rounded-full font-extrabold text-[#C0392B]">
                Soal {currentIdx + 1} dari {questions.length}
              </span>
              <div className="flex gap-1 text-xs font-bold text-amber-500">
                {Array.from({ length: score }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
            </div>

            {/* Question Text */}
            <h3 className="text-lg font-black text-[#2E4053] leading-relaxed">
              {questions[currentIdx].question}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {questions[currentIdx].options.map((opt, idx) => {
                let buttonStyle = "bg-white border-2 border-slate-200 hover:border-[#F1948A] text-slate-700";
                
                if (selectedOpt === idx) {
                  buttonStyle = "bg-rose-50/50 border-2 border-[#F1948A] text-[#922B21] shadow-xs translate-y-[1px]";
                }

                if (isAnswerChecked) {
                  if (idx === questions[currentIdx].correctAnswer) {
                    buttonStyle = "bg-emerald-50 border-2 border-[#27AE60] text-[#1E8449] font-black";
                  } else if (selectedOpt === idx) {
                    buttonStyle = "bg-rose-100 border-2 border-[#C0392B] text-[#922B21]";
                  } else {
                    buttonStyle = "bg-slate-50 border-2 border-slate-100 text-slate-400 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    id={`quiz-opt-${idx}`}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerChecked}
                    className={`w-full p-4 rounded-2xl text-left text-sm font-black transition-all flex items-center justify-between ${buttonStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswerChecked && idx === questions[currentIdx].correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                    )}
                    {isAnswerChecked && selectedOpt === idx && idx !== questions[currentIdx].correctAnswer && (
                      <XCircle className="w-5 h-5 text-[#C0392B] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Check / Next Button */}
            {!isAnswerChecked ? (
              <button
                id="btn-check-answer"
                onClick={handleCheckAnswer}
                disabled={selectedOpt === null}
                className={`w-full py-3.5 font-black rounded-full text-sm uppercase transition-all shadow-sm ${
                  selectedOpt === null
                    ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-[#F7DC6F] border-b-4 border-[#D4AC0D] text-[#7D6608] hover:bg-yellow-100 hover:translate-y-[-1px]"
                }`}
              >
                Kunci Jawaban 🔒
              </button>
            ) : (
              <div className="space-y-4">
                {/* Explanation Card */}
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-[#FEF9E7] border border-[#F7DC6F] p-4 rounded-2xl text-xs text-[#7D6608] leading-relaxed font-semibold"
                >
                  <span className="font-black text-[#D4AC0D] block mb-1">💡 Penjelasan Kiki:</span>
                  {questions[currentIdx].explanation}
                </motion.div>

                <button
                  id="btn-next-question"
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 bg-[#F1948A] border-b-4 border-[#C0392B] text-white font-black rounded-full hover:bg-[#EAA199] hover:translate-y-[-1px] transition-all text-sm flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {currentIdx + 1 === questions.length ? "Lihat Hasil Akhir" : "Soal Berikutnya"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* STAGE 3: FINISHED RESULTS */}
        {quizFinished && (
          <motion.div
            key="finish-stage"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6"
          >
            {/* Main Score Card */}
            <div className="bg-white border-4 border-[#F1948A] shadow-xl rounded-3xl p-6 text-center space-y-6">
              <div className="text-5xl animate-bounce">
                {scorePercentage >= 80 ? "🏆" : "💪"}
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-[#2E4053]">
                  {scorePercentage >= 80 ? "Luar Biasa! Kamu Lulus!" : "Usaha yang Bagus! Coba Lagi Yuk!"}
                </h3>
                <p className="text-sm text-slate-600 font-medium">
                  {studentName}, kamu berhasil menjawab benar sebanyak <b>{score} dari {questions.length}</b> pertanyaan!
                </p>
              </div>

              {/* Big Score Circular Ring */}
              <div className="inline-block relative">
                <div className="w-32 h-32 rounded-full border-4 border-[#F1948A] bg-rose-50/35 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-4xl font-extrabold text-[#C0392B]">{scorePercentage}%</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Nilai Akhir</span>
                </div>
              </div>

              {/* Certificate Download/Print area */}
              {scorePercentage >= 80 && (
                <div className="bg-[#FEF9E7] border border-[#F7DC6F] p-4 rounded-2xl text-left space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500 animate-pulse" />
                    <span className="font-black text-sm text-[#7D6608]">Sertifikat Kelulusan Terbuka!</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                    Wah hebat! Kamu berhak mendapatkan Sertifikat Kelulusan resmi dari Kiki si Kelinci Gelombang. Silakan cetak sertifikatmu di bawah!
                  </p>
                  <button
                    id="btn-print-cert"
                    onClick={() => window.print()}
                    className="w-full py-2.5 bg-[#F7DC6F] border-b-4 border-[#D4AC0D] text-[#7D6608] font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Printer className="w-4 h-4" /> Cetak Sertifikat Kelulusan
                  </button>
                </div>
              )}

              {/* Restart button */}
              <button
                id="btn-restart-quiz"
                onClick={handleRestartQuiz}
                className="w-full py-2.5 bg-slate-100 border border-slate-200 text-slate-700 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Ulangi Kuis
              </button>
            </div>

            {/* PRINT-ONLY CERTIFICATE FORMAT */}
            {scorePercentage >= 80 && (
              <div className="hidden print:block fixed inset-0 bg-white z-[99999] p-12 border-[12px] border-double border-amber-500 text-slate-900 text-center flex flex-col justify-between">
                <div>
                  <div className="text-5xl my-4">🏆</div>
                  <h1 className="text-3xl font-serif font-extrabold tracking-widest text-amber-800 mt-4">
                    SERTIFIKAT KELULUSAN & PRESTASI
                  </h1>
                  <p className="text-xs italic text-slate-500 uppercase tracking-widest mt-2">
                    Diberikan secara resmi kepada sang penjelajah gelombang yang hebat:
                  </p>
                </div>

                <div className="my-10">
                  <h2 className="text-4xl font-serif font-extrabold border-b-2 border-slate-950 inline-block px-10 py-1 text-slate-900">
                    {studentName}
                  </h2>
                  <p className="text-sm text-slate-600 mt-4 max-w-md mx-auto leading-relaxed">
                    Atas keberhasilannya menyelesaikan materi pembelajaran Fisika mengenai <strong>Cepat Rambat Gelombang</strong> dengan nilai sempurna sebesar <strong>{scorePercentage}%</strong> pada Kuis Interaktif Beranimasi.
                  </p>
                </div>

                <div className="flex justify-around items-center text-sm border-t border-slate-300 pt-8">
                  <div>
                    <p className="italic text-xs text-slate-400">Diverifikasi secara otomatis oleh:</p>
                    <p className="font-bold text-slate-700 mt-4">Kiki si Kelinci Gelombang 🐰</p>
                  </div>
                  <div>
                    <p className="italic text-xs text-slate-400">Tanggal Kelulusan:</p>
                    <p className="font-mono font-bold text-slate-700 mt-4">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
