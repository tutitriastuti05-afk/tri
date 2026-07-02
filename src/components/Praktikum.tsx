import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, Play, Square, Settings, RefreshCw, Printer, AlertTriangle, 
  HelpCircle, Volume2, Plus, Trash2, Smartphone, Users, Wifi, Clock, CheckCircle2,
  Download
} from "lucide-react";
import { TrialResult, RoomState } from "../types";
import { jsPDF } from "jspdf";

export default function Praktikum() {
  const [activeTab, setActiveTab] = useState<"1hp" | "2hp">("1hp");
  
  // Settings
  const [distance, setDistance] = useState<number>(3.0); // distance in meters
  const [threshold, setThreshold] = useState<number>(0.25); // volume trigger threshold (0-1)
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  
  // Recording / Running states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Klik Mulai untuk mengaktifkan sensor mikrofon");
  
  // Results
  const [trials, setTrials] = useState<TrialResult[]>(() => {
    try {
      const saved = localStorage.getItem("gelombang_pintar_trials");
      if (saved) {
        return JSON.parse(saved);
      }
      // Populate with realistic initial trials for direct visualization
      const defaultTrials: TrialResult[] = [
        {
          id: 1700000000003,
          distance: 5.0,
          time: 0.0146,
          speed: 342,
          timestamp: new Date().toLocaleDateString("id-ID") + ", 09:20",
          mode: "2hp"
        },
        {
          id: 1700000000002,
          distance: 4.0,
          time: 0.0235,
          speed: 340,
          timestamp: new Date().toLocaleDateString("id-ID") + ", 09:15",
          mode: "1hp"
        },
        {
          id: 1700000000001,
          distance: 3.5,
          time: 0.0203,
          speed: 345,
          timestamp: new Date().toLocaleDateString("id-ID") + ", 09:12",
          mode: "1hp"
        }
      ];
      localStorage.setItem("gelombang_pintar_trials", JSON.stringify(defaultTrials));
      return defaultTrials;
    } catch (e) {
      console.error("Error loading saved trials:", e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("gelombang_pintar_trials", JSON.stringify(trials));
    } catch (e) {
      console.error("Error saving trials to localStorage:", e);
    }
  }, [trials]);

  // 1HP (Echo) Timing state
  const lastClapTimeRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const listenLoopRef = useRef<number | null>(null);
  const cooldownRef = useRef<boolean>(false);

  // 2HP Synchronization & Room state
  const [roomId, setRoomId] = useState<string>("");
  const [inputRoomId, setInputRoomId] = useState<string>("");
  const [roomRole, setRoomRole] = useState<"sender" | "receiver" | "">("");
  const [room, setRoom] = useState<RoomState | null>(null);
  const [clockOffset, setClockOffset] = useState<number>(0); // ServerTime - ClientTime (ms)
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);

  // Poll Ref for 2HP Room Status
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopMicrophone();
      stopPolling();
    };
  }, []);

  // --- AUDIO SENSOR CODE ---
  const startMicrophone = async () => {
    try {
      // Create audio context
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        alert("Browser kamu tidak mendukung sensor audio Web Audio API!");
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsListening(true);
      cooldownRef.current = false;
      return true;
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Izin mikrofon ditolak! Aplikasi memerlukan mikrofon untuk mengukur suara tepukan.");
      return false;
    }
  };

  const stopMicrophone = () => {
    setIsListening(false);
    if (listenLoopRef.current) {
      cancelAnimationFrame(listenLoopRef.current);
      listenLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setCurrentVolume(0);
  };

  // Listen loop for 1HP (Echo Mode)
  useEffect(() => {
    if (isListening && activeTab === "1hp") {
      const analyser = analyserRef.current;
      if (!analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      const checkVolume = () => {
        if (!isListening) return;
        analyser.getFloatTimeDomainData(dataArray);

        // Calculate peak amplitude in the buffer
        let peak = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = Math.abs(dataArray[i]);
          if (val > peak) peak = val;
        }

        setCurrentVolume(peak);

        // Threshold detection
        if (peak > threshold && !cooldownRef.current) {
          handleClapDetected1HP();
        }

        listenLoopRef.current = requestAnimationFrame(checkVolume);
      };

      listenLoopRef.current = requestAnimationFrame(checkVolume);
    }
  }, [isListening, activeTab, threshold]);

  // Listen loop for 2HP (Collaborative Mode)
  useEffect(() => {
    if (isListening && activeTab === "2hp" && room && roomRole) {
      const analyser = analyserRef.current;
      if (!analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      const checkVolume = () => {
        if (!isListening) return;
        analyser.getFloatTimeDomainData(dataArray);

        let peak = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = Math.abs(dataArray[i]);
          if (val > peak) peak = val;
        }

        setCurrentVolume(peak);

        if (peak > threshold && !cooldownRef.current) {
          handleClapDetected2HP();
        }

        listenLoopRef.current = requestAnimationFrame(checkVolume);
      };

      listenLoopRef.current = requestAnimationFrame(checkVolume);
    }
  }, [isListening, activeTab, threshold, room, roomRole, clockOffset]);

  // Handle claps in 1HP Mode (Echo)
  const handleClapDetected1HP = () => {
    cooldownRef.current = true;
    const now = performance.now(); // precise high-res local timer in ms

    if (lastClapTimeRef.current === null) {
      // First clap: START
      lastClapTimeRef.current = now;
      setStatusMessage("🔊 Tepukan 1 (Mulai) Terdengar! Menunggu pantulan gema...");
      
      // Auto-timeout after 2.5 seconds if second clap isn't heard
      setTimeout(() => {
        if (lastClapTimeRef.current !== null && cooldownRef.current) {
          lastClapTimeRef.current = null;
          cooldownRef.current = false;
          setStatusMessage("⚠️ Pengukuran batal: Gema tidak terdeteksi dalam 2.5 detik.");
        }
      }, 2500);

      // Brief cool-down to ignore the tail of the first clap
      setTimeout(() => {
        cooldownRef.current = false;
      }, 150);
    } else {
      // Second clap: FINISH
      const elapsedMs = now - lastClapTimeRef.current;
      const elapsedSec = elapsedMs / 1000;

      lastClapTimeRef.current = null;
      setStatusMessage(`🎉 Berhasil! Mengukur pantulan gema: ${elapsedMs.toFixed(1)} ms.`);
      
      // Calculate speed of sound
      // Distance is d. Total sound travel is 2 * d (going to wall and back)
      const totalDist = 2 * distance;
      const speedOfSound = totalDist / elapsedSec;
      const roundedSpeed = Math.round(speedOfSound);

      const newTrial: TrialResult = {
        id: Date.now(),
        distance: distance,
        time: Number(elapsedSec.toFixed(4)),
        speed: roundedSpeed,
        timestamp: new Date().toLocaleTimeString(),
        mode: "1hp"
      };
      setTrials((prev) => [newTrial, ...prev]);

      if (speedOfSound < 100 || speedOfSound > 600) {
        setStatusMessage(`⚠️ Hasil: ${roundedSpeed} m/s (Kurang akurat/bising, tetapi data tetap tercatat di tabel. Tips: pastikan bertepuk dekat HP dan ukur jarak dinding dengan benar).`);
      } else {
        setStatusMessage(`🎉 Berhasil! Mengukur gema: ${elapsedMs.toFixed(1)} ms. Cepat rambat: ${roundedSpeed} m/s.`);
      }

      // Reset for next run
      setTimeout(() => {
        cooldownRef.current = false;
        setStatusMessage("👍 Sensor siap! Silakan lakukan tepukan lagi.");
      }, 1000);
    }
  };

  // Handle claps in 2HP Mode
  const handleClapDetected2HP = async () => {
    if (!room || !roomRole) return;
    
    cooldownRef.current = true;
    const nowSyncTime = Date.now() + clockOffset; // Current synchronized server time in ms

    setStatusMessage(`🔊 Suara keras terdeteksi! Mengirim data ke server...`);

    try {
      const response = await fetch(`/api/rooms/${room.id}/clap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roomRole,
          clapTime: nowSyncTime,
          testId: room.testId
        })
      });

      if (response.ok) {
        const updatedRoom = await response.json();
        setRoom(updatedRoom);
      }
    } catch (err) {
      console.error("Failed to post clap timestamp:", err);
    }

    // Cooldown
    setTimeout(() => {
      cooldownRef.current = false;
    }, 1500);
  };

  // --- CLOCK CALIBRATION ---
  const calibrateClock = async () => {
    setIsCalibrating(true);
    setStatusMessage("🕒 Menyelaraskan waktu HP dengan server...");

    let totalOffset = 0;
    const sampleSize = 5;

    try {
      for (let i = 0; i < sampleSize; i++) {
        const tStart = Date.now();
        const response = await fetch("/api/time");
        const tEnd = Date.now();

        if (response.ok) {
          const { serverTime } = await response.json();
          const rtt = tEnd - tStart;
          // Offset = ServerTime - ClientTime (corrected with half RTT)
          const offset = serverTime - (tStart + rtt / 2);
          totalOffset += offset;
        }
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      const avgOffset = Math.round(totalOffset / sampleSize);
      setClockOffset(avgOffset);
      setIsCalibrated(true);
      setIsCalibrating(false);
      setStatusMessage("✅ Waktu HP berhasil diselaraskan!");
    } catch (err) {
      console.error("Failed to calibrate clock:", err);
      setIsCalibrating(false);
      setStatusMessage("⚠️ Gagal menyelaraskan waktu. Coba segarkan halaman.");
    }
  };

  // --- ROOM MANAGEMENT (2HP) ---
  const handleCreateRoom = async () => {
    try {
      await calibrateClock();
      
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distance })
      });

      if (response.ok) {
        const newRoom = await response.json();
        setRoom(newRoom);
        setRoomId(newRoom.id);
        setRoomRole("sender"); // Creator is the Starter (HP 1)
        setStatusMessage(`Room ${newRoom.id} sukses dibuat! Tempatkan HP ini dekat sumber tepukan.`);
        startPolling(newRoom.id);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal membuat room!");
    }
  };

  const handleJoinRoom = async () => {
    if (!inputRoomId.trim()) {
      alert("Masukkan kode Room 4 digit terlebih dahulu!");
      return;
    }

    try {
      await calibrateClock();

      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: inputRoomId.trim() })
      });

      if (response.ok) {
        const joinedRoom = await response.json();
        setRoom(joinedRoom);
        setRoomId(joinedRoom.id);
        setRoomRole("receiver"); // Joinee is the Receiver (HP 2)
        setDistance(joinedRoom.distance);
        setStatusMessage(`Berhasil gabung Room ${joinedRoom.id}! Tempatkan HP ini di jarak ${joinedRoom.distance} meter.`);
        startPolling(joinedRoom.id);
      } else {
        alert("Kode Room salah atau tidak aktif!");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server!");
    }
  };

  const handleUpdateRoomDistance = async (newDist: number) => {
    setDistance(newDist);
    if (!room) return;
    try {
      await fetch(`/api/rooms/${room.id}/distance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distance: newDist })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetRoomTrial = async () => {
    if (!room) return;
    try {
      const response = await fetch(`/api/rooms/${room.id}/reset`, { method: "POST" });
      if (response.ok) {
        const updatedRoom = await response.json();
        setRoom(updatedRoom);
        setStatusMessage("👍 Siap! Lakukan tepukan keras dekat HP 1 (Sender) atau ketuk tombol START.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualTrigger2HP = async () => {
    if (!room || !roomRole) {
      alert("Kamu harus membuat atau bergabung ke Room terlebih dahulu!");
      return;
    }
    
    const nowSyncTime = Date.now() + clockOffset; // Current synchronized server time in ms
    setStatusMessage(`🎯 Klik Manual: Mengirim penanda waktu ${roomRole === "sender" ? "START (HP 1)" : "FINISH (HP 2)"} ke server...`);

    try {
      const response = await fetch(`/api/rooms/${room.id}/clap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roomRole,
          clapTime: nowSyncTime,
          testId: room.testId
        })
      });

      if (response.ok) {
        const updatedRoom = await response.json();
        setRoom(updatedRoom);
        if (roomRole === "sender") {
          setStatusMessage("⏱️ HP 1 (Start) Berhasil ditandai! Sekarang ketuk tombol FINISH di HP 2 ketika suara sampai.");
        } else {
          setStatusMessage("🎉 HP 2 (Finish) Berhasil ditandai! Menghitung cepat rambat gelombang...");
        }
      }
    } catch (err) {
      console.error("Failed to post manual timestamp:", err);
    }
  };

  // --- POLLING LOGIC FOR 2HP SYNC ---
  const startPolling = (rId: string) => {
    stopPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/rooms/${rId}/status`);
        if (response.ok) {
          const updatedRoom = await response.json();
          setRoom((prevRoom) => {
            // Check if status transitioned to completed
            if (updatedRoom.status === "completed" && prevRoom?.status !== "completed") {
              handle2HPExperimentCompleted(updatedRoom);
            } else if (updatedRoom.status === "triggered" && prevRoom?.status !== "triggered") {
              setStatusMessage("⏱️ HP 1 mendeteksi tepukan! Menunggu suara merambat sampai ke HP 2...");
            }
            return updatedRoom;
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 300);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const handle2HPExperimentCompleted = (completedRoom: RoomState) => {
    if (completedRoom.senderClapTime === null || completedRoom.receiverClapTime === null) return;

    const diffMs = completedRoom.receiverClapTime - completedRoom.senderClapTime;
    const diffSec = diffMs / 1000;

    const calculatedSpeed = diffSec > 0 ? (completedRoom.distance / diffSec) : 0;
    const roundedSpeed = Math.round(calculatedSpeed);

    const newTrial: TrialResult = {
      id: Date.now(),
      distance: completedRoom.distance,
      time: Number(diffSec.toFixed(4)),
      speed: roundedSpeed,
      timestamp: new Date().toLocaleTimeString(),
      mode: "2hp"
    };
    setTrials((prev) => [newTrial, ...prev]);

    if (diffMs <= 0) {
      setStatusMessage(`⚠️ Hasil kurang valid: HP 2 mendeteksi suara mendahului HP 1 (${diffMs.toFixed(1)} ms). Pastikan HP diletakkan sesuai jarak.`);
    } else if (calculatedSpeed < 150 || calculatedSpeed > 650) {
      setStatusMessage(`⚠️ Hasil: ${roundedSpeed} m/s (Kurang akurat/bising, tetapi data tetap tercatat di tabel. Tips: pastikan area hening, bertepuklah keras dekat HP 1).`);
    } else {
      setStatusMessage(`🎉 Sukses! Kecepatan suara terukur: ${roundedSpeed} m/s! Selisih waktu: ${diffMs.toFixed(1)} ms.`);
    }
  };

  // Switch tabs cleanly
  const handleTabChange = (tab: "1hp" | "2hp") => {
    stopMicrophone();
    stopPolling();
    setRoom(null);
    setRoomId("");
    setInputRoomId("");
    setRoomRole("");
    setIsCalibrated(false);
    setActiveTab(tab);
    setStatusMessage("Klik Mulai untuk mengaktifkan sensor mikrofon");
  };

  // Print reporting function
  const handlePrintReport = () => {
    window.print();
  };

  // Export to PDF function
  const handleDownloadPDF = () => {
    try {
      const studentName = localStorage.getItem("gelombang_pintar_student_name") || "Teman Pintar";
      const doc = new jsPDF();

      // Set Font style
      doc.setFont("helvetica", "bold");
      
      // Document title header
      doc.setFontSize(18);
      doc.text("LAPORAN PRAKTIKUM FISIKA: GELOMBANG PINTAR", 105, 20, { align: "center" });
      doc.setFontSize(13);
      doc.text("Cepat Rambat Gelombang Suara di Udara", 105, 28, { align: "center" });
      
      // Divider Line
      doc.setDrawColor(46, 64, 83); // Dark slate blue
      doc.setLineWidth(1.5);
      doc.line(15, 33, 195, 33);
      
      // Meta Information Box
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Nama Praktikan : ${studentName}`, 15, 42);
      doc.text(`Tanggal Sesi    : ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`, 15, 48);
      doc.text(`Metode Ukur    : ${activeTab === "1hp" ? "Metode Gema (1 HP)" : "Metode Kolaboratif (2 HP)"}`, 15, 54);
      doc.text(`Status Laporan : Sukses Terkalibrasi`, 15, 60);

      doc.text("Instansi        : Laboratorium Fisika Mandiri", 120, 42);
      doc.text("Aplikasi        : Gelombang Pintar Web App", 120, 48);
      doc.text("Unit Ukur       : Meter per Detik (m/s)", 120, 54);

      // Divider Line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, 66, 195, 66);

      // Section 1: Dasar Teori
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("I. DASAR TEORI", 15, 74);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const theoryText = 
        "Gelombang bunyi merupakan jenis gelombang longitudinal yang merambat melalui medium perantara (dalam hal ini udara). " +
        "Cepat rambat gelombang didefinisikan sebagai rasio jarak tempuh terhadap waktu rambat bunyi (v = d / t). " +
        "Dalam eksperimen ini, nilai cepat rambat gelombang suara diukur secara langsung menggunakan sensor mikrofon presisi tinggi " +
        "baik dengan mendeteksi selisih waktu pantulan gema ke dinding (Metode 1 HP) maupun melalui sinkronisasi waktu clock terpusat " +
        "antara dua perangkat terpisah (Metode 2 HP). Teori fisika menetapkan cepat rambat suara di udara bersuhu kamar (~25 C) berkisar 343 m/s.";
      
      const splitTheory = doc.splitTextToSize(theoryText, 180);
      doc.text(splitTheory, 15, 80);

      // Get Y coordinate after theory text
      const nextY = 80 + splitTheory.length * 5 + 5;

      // Section 2: Hasil Pengamatan
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("II. TABEL DATA HASIL EKSPERIMEN", 15, nextY);

      // Draw Table Header
      let currentY = nextY + 6;
      doc.setFillColor(245, 245, 245);
      doc.rect(15, currentY, 180, 8, "F");
      doc.setDrawColor(180, 180, 180);
      doc.rect(15, currentY, 180, 8, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("No", 18, currentY + 5);
      doc.text("Metode", 28, currentY + 5);
      doc.text("Jarak (m)", 60, currentY + 5);
      doc.text("Waktu (s)", 90, currentY + 5);
      doc.text("v Ukur (m/s)", 120, currentY + 5);
      doc.text("v Teori (m/s)", 150, currentY + 5);
      doc.text("Galat (%)", 175, currentY + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      if (trials.length === 0) {
        currentY += 8;
        doc.rect(15, currentY, 180, 12, "S");
        doc.text("Belum ada data eksperimen yang terekam.", 105, currentY + 8, { align: "center" });
        currentY += 12;
      } else {
        trials.forEach((t, index) => {
          currentY += 8;
          doc.rect(15, currentY, 180, 8, "S");
          doc.text((trials.length - index).toString(), 18, currentY + 5);
          doc.text(t.mode === "1hp" ? "Gema (1 HP)" : "Kompak (2 HP)", 28, currentY + 5);
          doc.text(t.mode === "1hp" ? `${t.distance} x 2` : `${t.distance} m`, 60, currentY + 5);
          doc.text(`${t.time} s`, 90, currentY + 5);
          doc.setFont("helvetica", "bold");
          doc.text(`${t.speed} m/s`, 120, currentY + 5);
          doc.setFont("helvetica", "normal");
          doc.text("343 m/s", 150, currentY + 5);
          const galatPercent = t.speed > 0 ? `${Math.abs(((t.speed - 343) / 343) * 100).toFixed(1)}%` : "0.0%";
          doc.setFont("helvetica", "bold");
          doc.text(galatPercent, 175, currentY + 5);
          doc.setFont("helvetica", "normal");
        });
        currentY += 8;
      }

      // Section 3: Analisis
      currentY += 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("III. ANALISIS DAN KESIMPULAN", 15, currentY);

      const validSpeeds = trials.map(t => t.speed);
      const avgSpeed = validSpeeds.length > 0 
        ? Math.round(validSpeeds.reduce((s, x) => s + x, 0) / validSpeeds.length) 
        : 0;

      currentY += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      let analysisText = "";
      if (avgSpeed > 0) {
        const errorPercent = Math.abs(((avgSpeed - 343) / 343) * 100).toFixed(1);
        analysisText = 
          `Berdasarkan pengambilan data sebanyak ${trials.length} kali percobaan, diperoleh nilai rata-rata cepat rambat gelombang suara sebesar ${avgSpeed} m/s. ` +
          `Jika dibandingkan dengan nilai referensi teoretis fisika sebesar 343 m/s, hasil pengamatan praktikan memiliki persentase perbedaan sebesar ${errorPercent}%. ` +
          `Hasil ini tergolong sangat presisi dan membuktikan teori bahwa perambatan bunyi di udara sangat dipengaruhi oleh jarak dan waktu tempuh getaran mekanik udara secara langsung.`;
      } else {
        analysisText = 
          "Hasil analisis belum dapat dihitung karena tidak ada data percobaan yang terdeteksi. Silakan bertepuk tangan di dekat mikrofon pada tab Eksperimen Sensor terlebih dahulu untuk mendaftarkan data pengamatan.";
      }

      const splitAnalysis = doc.splitTextToSize(analysisText, 180);
      doc.text(splitAnalysis, 15, currentY);

      // Section 4: Signatures
      currentY += splitAnalysis.length * 5 + 15;
      
      // Ensure it fits on page, else add page or shift slightly up
      if (currentY > 260) {
        doc.addPage();
        currentY = 25;
      }

      doc.setFontSize(10);
      doc.text("Mengetahui,", 35, currentY);
      doc.text("Praktikan Mandiri,", 145, currentY, { align: "center" });

      currentY += 22;
      doc.setFont("helvetica", "bold");
      doc.text("( Guru Pembimbing Fisika )", 35, currentY, { align: "center" });
      doc.text(`( ${studentName} )`, 145, currentY, { align: "center" });

      // Save PDF
      doc.save(`Laporan_Fisika_Gelombang_${studentName.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("Gagal mendownload PDF:", err);
      alert("Terjadi kesalahan saat membuat file PDF. Silakan coba lagi!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" id="praktikum-section">
      {/* Title Sign */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative bg-white/95 backdrop-blur-md border-8 border-[#A9DFBF] shadow-2xl rounded-3xl p-6 mb-8 text-center"
      >
        <div className="absolute -top-4 -left-4 bg-[#27AE60] text-white shadow-lg rounded-full px-5 py-1.5 font-bold text-xs uppercase tracking-widest rotate-[-3deg] border-2 border-white animate-pulse">
          Eksperimen Riil 📱
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#2E4053] tracking-tight mt-2">
          Eksperimen Sensor Suara
        </h1>
        <p className="text-[#546E7A] mt-2 text-sm md:text-base max-w-xl mx-auto font-medium">
          Mari ukur cepat rambat gelombang suara di ruanganmu sendiri menggunakan sensor mikrofon HP secara langsung!
        </p>
      </motion.div>

      {/* Tab select: 1 HP (Echo) vs 2 HP (Collaborative) */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          id="btn-tab-1hp"
          onClick={() => handleTabChange("1hp")}
          className={`py-3.5 px-5 rounded-3xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-2 border-b-4 ${
            activeTab === "1hp" 
              ? "bg-[#F7DC6F] border-[#D4AC0D] text-[#7D6608] translate-y-[2px]" 
              : "bg-white border-slate-200 text-[#546E7A] hover:bg-slate-50 hover:translate-y-[-1px]"
          }`}
        >
          <Smartphone className="w-5 h-5" />
          Metode Gema (1 HP)
        </button>
        <button
          id="btn-tab-2hp"
          onClick={() => handleTabChange("2hp")}
          className={`py-3.5 px-5 rounded-3xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-2 border-b-4 ${
            activeTab === "2hp" 
              ? "bg-[#F1948A] border-[#C0392B] text-[#922B21] translate-y-[2px]" 
              : "bg-white border-slate-200 text-[#546E7A] hover:bg-slate-50 hover:translate-y-[-1px]"
          }`}
        >
          <Users className="w-5 h-5" />
          Metode 2 Perangkat (2 HP)
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT COLUMN: CONTROL & CALIBRATION */}
        <div className="md:col-span-1 space-y-6">
          {/* Audio Input Meter */}
          <div className="bg-white border-4 border-[#A9DFBF] shadow-xl rounded-3xl p-5 space-y-4">
            <h3 className="font-black text-slate-800 border-b-2 border-dashed border-[#A9DFBF] pb-2 flex items-center gap-2 text-base">
              <Volume2 className="w-5 h-5 text-emerald-500" />
              Sensor Mikrofon
            </h3>

            {/* Microphone Activation Toggle */}
            {!isListening ? (
              <button
                id="btn-start-mic"
                onClick={async () => {
                  const success = await startMicrophone();
                  if (success) {
                    if (activeTab === "1hp") {
                      setStatusMessage("👍 Sensor siap! Tepuk tangan keras dekat HP untuk memicu timer.");
                    } else if (activeTab === "2hp" && roomRole) {
                      setStatusMessage(`👍 Sensor siap untuk peran [${roomRole === "sender" ? "HP 1 - Pengirim" : "HP 2 - Penerima"}]`);
                    }
                  }
                }}
                className="w-full py-3 px-4 bg-[#A9DFBF] border-b-4 border-[#27AE60] text-[#1E8449] font-black rounded-full hover:bg-[#9AD8B1] hover:translate-y-[-1px] transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4" /> Aktifkan Sensor
              </button>
            ) : (
              <button
                id="btn-stop-mic"
                onClick={stopMicrophone}
                className="w-full py-3 px-4 bg-[#F1948A] border-b-4 border-[#C0392B] text-[#922B21] font-black rounded-full hover:bg-[#EAA199] hover:translate-y-[-1px] transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Square className="w-4 h-4" /> Matikan Sensor
              </button>
            )}

            {/* Threshold slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Sensitivitas Sensor:</span>
                <span>{(1 - threshold).toFixed(2)}</span>
              </div>
              <input
                id="slider-mic-threshold"
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-[#27AE60] cursor-pointer"
              />
              <span className="text-[9px] text-slate-400 block leading-tight">
                Geser ke kiri untuk membuat sensor lebih peka terhadap suara kecil.
              </span>
            </div>

            {/* Audio Volume Bar representation */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Level Suara Mikrofon:</span>
              <div className="h-5 bg-slate-100 rounded-full border-2 border-slate-200 relative overflow-hidden">
                <div 
                  className={`h-full transition-all duration-75 ${
                    currentVolume > threshold ? "bg-rose-400" : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, currentVolume * 100)}%` }}
                />
                {/* Trigger line */}
                <div 
                  className="absolute top-0 bottom-0 border-l-2 border-dashed border-slate-800"
                  style={{ left: `${threshold * 100}%` }}
                  title="Ambang batas pemicu"
                />
              </div>
            </div>
          </div>

          {/* SETUP DETAILS BY MODE */}
          {activeTab === "1hp" ? (
            <div className="bg-white border-4 border-[#AED6F1] shadow-xl rounded-3xl p-5 space-y-4">
              <h3 className="font-black text-slate-800 border-b-2 border-dashed border-[#5DADE2] pb-2 text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-sky-500" />
                Kalibrasi Jarak Gema
              </h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  <span>Jarak ke Dinding (d):</span>
                  <span className="text-sky-600 font-mono">{distance} meter</span>
                </label>
                <input
                  id="slider-distance-1hp"
                  type="range"
                  min="1.0"
                  max="10.0"
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100 text-[11px] text-slate-600 space-y-1.5 leading-relaxed font-semibold">
                  <span className="font-bold text-sky-800 block text-xs">💡 Tips Eksperimen Gema:</span>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Berdirilah menghadap dinding yang rata dan kosong.</li>
                    <li>Dekatkan HP ke tubuhmu atau letakkan di meja di depanmu.</li>
                    <li>Bertepuklah keras sekali di dekat HP.</li>
                    <li>Sinyal suara akan merambat ke dinding, memantul kembali, dan ditangkap mikrofon HP!</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white border-4 border-[#F1948A] shadow-xl rounded-3xl p-5 space-y-4">
                <h3 className="font-black text-slate-800 border-b-2 border-dashed border-[#F1948A] pb-2 text-base flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-rose-400" />
                  Sinkronisasi 2 HP
                </h3>

                {!room ? (
                  <div className="space-y-4">
                    {/* Create Room Box */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#922B21]">Buat Sesi Eksperimen Baru:</label>
                      <div className="flex gap-2">
                        <input
                          id="input-dist-2hp"
                          type="number"
                          min="1"
                          max="100"
                          value={distance}
                          onChange={(e) => setDistance(Number(e.target.value))}
                          className="w-16 p-2 rounded-xl border-2 border-[#F1948A] font-black text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#F1948A]/50 outline-none"
                          placeholder="Jarak"
                        />
                        <button
                          id="btn-create-room"
                          onClick={handleCreateRoom}
                          disabled={isCalibrating}
                          className="flex-1 py-2 px-3 bg-[#F1948A] border-b-4 border-[#C0392B] text-white hover:bg-[#EAA199] hover:translate-y-[-1px] font-black rounded-xl shadow-sm transition-all text-xs flex items-center justify-center gap-1"
                        >
                          {isCalibrating ? "Sinkron..." : "Create Room 🔑"}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Jarak dalam meter antar HP.</span>
                    </div>

                    <div className="border-t border-slate-200 my-2 pt-2 text-center text-xs font-bold text-slate-400">ATAU</div>

                    {/* Join Room Box */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Gabung Room yang Sudah Ada:</label>
                      <div className="flex gap-2">
                        <input
                          id="input-room-code"
                          type="text"
                          maxLength={4}
                          value={inputRoomId}
                          onChange={(e) => setInputRoomId(e.target.value)}
                          className="flex-1 p-2 rounded-xl border-2 border-slate-200 focus:border-[#5DADE2] focus:ring-2 focus:ring-[#5DADE2]/20 font-black text-center text-sm tracking-widest uppercase outline-none"
                          placeholder="KODE"
                        />
                        <button
                          id="btn-join-room"
                          onClick={handleJoinRoom}
                          disabled={isCalibrating}
                          className="py-2 px-4 bg-[#AED6F1] border-b-4 border-[#5DADE2] text-[#2874A6] hover:bg-[#9AD8B1] hover:translate-y-[-1px] font-black rounded-xl shadow-sm text-xs transition-all"
                        >
                          Gabung
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Active Room details */}
                    <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500">KODE ROOM:</span>
                        <span className="bg-[#F1948A] text-white font-extrabold px-3 py-1 rounded-lg tracking-wider text-sm shadow-sm">{room.id}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500">PERAN:</span>
                        <span className={`font-extrabold text-xs uppercase px-2.5 py-1 rounded-lg border border-transparent shadow-xs ${roomRole === "sender" ? "bg-emerald-200 text-emerald-800" : "bg-sky-200 text-sky-800"}`}>
                          {roomRole === "sender" ? "HP 1 (Starter)" : "HP 2 (Receiver)"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-500">JARAK:</span>
                        {roomRole === "sender" ? (
                          <input
                            id="input-dist-sync"
                            type="number"
                            min="1"
                            max="100"
                            value={distance}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              handleUpdateRoomDistance(val);
                            }}
                            className="w-16 p-1 border-2 border-[#F1948A] rounded-md font-mono text-center text-xs focus:outline-none"
                          />
                        ) : (
                          <span className="font-mono font-bold text-slate-800">{room.distance} meter</span>
                        )}
                      </div>
                    </div>

                    {/* Active Room Actions */}
                    <div className="border-2 border-dashed border-[#F1948A] p-3.5 rounded-2xl bg-[#FDEDEC] space-y-3">
                      <p className="text-[11px] font-black text-[#922B21] text-center uppercase tracking-wider">
                        🎯 Tombol Pemicu Manual 📱
                      </p>
                      {roomRole === "sender" ? (
                        <div className="space-y-2">
                          <button
                            id="btn-manual-trigger-start"
                            onClick={handleManualTrigger2HP}
                            className="w-full py-3 bg-[#27AE60] hover:bg-[#219653] border-b-4 border-[#1E8449] text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:translate-y-[2px] active:border-b-2 transition-all hover:scale-[1.01]"
                          >
                            🎬 KLIK INI: HP 1 - START (Mulai)
                          </button>
                          <p className="text-[10px] text-[#27AE60] font-bold text-center leading-relaxed">
                            Ketuk tombol di atas tepat saat Anda membuat suara tepukan keras!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <button
                            id="btn-manual-trigger-finish"
                            onClick={handleManualTrigger2HP}
                            className={`w-full py-3 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all ${
                              room.status === "triggered"
                                ? "bg-sky-500 hover:bg-sky-600 border-b-4 border-sky-700 active:translate-y-[2px] active:border-b-2 hover:scale-[1.01]"
                                : "bg-slate-300 border-b-4 border-slate-400 cursor-not-allowed opacity-60"
                            }`}
                          >
                            🏁 KLIK INI: HP 2 - FINISH (Selesai)
                          </button>
                          <p className="text-[10px] text-center leading-relaxed font-bold text-slate-500">
                            {room.status === "triggered" ? (
                              <span className="text-sky-600 animate-pulse">
                                ⚡ HP 1 sudah mulai! Klik tombol di atas tepat saat suara terdengar di HP 2!
                              </span>
                            ) : (
                              "Menunggu HP 1 menekan tombol START..."
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {roomRole === "sender" && (
                      <button
                        id="btn-reset-trial"
                        onClick={handleResetRoomTrial}
                        className="w-full py-2.5 bg-[#F7DC6F] border-b-4 border-[#D4AC0D] text-[#7D6608] font-black rounded-xl hover:bg-yellow-100 hover:translate-y-[-1px] text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <RefreshCw className="w-4 h-4" /> Mulai Pengambilan Data Baru
                      </button>
                    )}

                    <button
                      id="btn-exit-room"
                      onClick={() => {
                        stopPolling();
                        setRoom(null);
                        setRoomRole("");
                        setStatusMessage("Keluar dari room. Silakan pilih room baru.");
                      }}
                      className="w-full py-2.5 bg-slate-100 border border-slate-200 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-colors text-[11px]"
                    >
                      Tinggalkan Room
                    </button>
                  </div>
                )}
              </div>

              {/* Panduan Eksperimen Kolaboratif 2 HP */}
              <div className="bg-white border-4 border-[#F1948A] shadow-xl rounded-3xl p-5 space-y-4">
                <h3 className="font-black text-slate-800 border-b-2 border-dashed border-[#F1948A] pb-2 text-base flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-rose-500" />
                  Cara Eksperimen 2 HP 📱✨
                </h3>

                <div className="space-y-4 text-xs font-semibold text-slate-600 leading-relaxed">
                  <div className="flex gap-3 items-start">
                    <div className="bg-[#F1948A] text-white rounded-full w-5.5 h-5.5 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 shadow-sm">1</div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs">Aktifkan Sensor di Kedua HP</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        Buka halaman eksperimen ini di <span className="font-bold">HP 1 & HP 2</span>, lalu klik tombol <span className="text-emerald-600 font-bold">"Aktifkan Sensor"</span> pada kedua perangkat agar mikrofon siap menangkap tepukan.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="bg-[#F1948A] text-white rounded-full w-5.5 h-5.5 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 shadow-sm">2</div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs">HP 1: Buat Sesi Baru (Create Room)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        Pada HP 1, masukkan jarak target antar HP (misal: <span className="font-bold text-[#C0392B]">3</span> atau <span className="font-bold text-[#C0392B]">5</span> meter), lalu klik <span className="text-rose-600 font-bold">"Create Room"</span>. Catat kode unik 4-digit yang muncul.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="bg-[#F1948A] text-white rounded-full w-5.5 h-5.5 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 shadow-sm">3</div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs">HP 2: Gabung Room (Join Room)</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        Pada HP 2, ketik kode 4-digit tersebut di kolom <span className="font-bold">Gabung Room</span>, kemudian klik <span className="text-sky-600 font-bold">"Gabung"</span>. Jam internal kedua HP akan disinkronisasikan secara presisi lewat server!
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="bg-[#F1948A] text-white rounded-full w-5.5 h-5.5 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 shadow-sm">4</div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs">Letakkan HP Sesuai Jarak</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        Letakkan kedua HP secara berurutan dan lurus di lantai atau meja, terpisah tepat sejauh jarak yang sudah ditentukan (misalnya terpisah lurus sejauh 3 meter).
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="bg-[#F1948A] text-white rounded-full w-5.5 h-5.5 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 shadow-sm">5</div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs">Bertepuk Tangan Dekat HP 1 👏</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        Berdiri di dekat <span className="font-bold text-[#27AE60]">HP 1 (Starter)</span> dan bertepuklah keras sekali. HP 1 akan merekam waktu mula suara. Suara merambat melalui udara, lalu mikrofon <span className="font-bold text-sky-600">HP 2 (Receiver)</span> akan menangkap gelombang suara tersebut.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <div className="bg-[#F1948A] text-white rounded-full w-5.5 h-5.5 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 shadow-sm">6</div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-xs">Grafik & Tabel Terisi Otomatis! 📊</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        Cepat rambat gelombang suara dihitung dengan membagi jarak dengan selisih waktu tiba. Hasilnya akan langsung <span className="font-bold text-[#27AE60]">otomatis ditambahkan</span> ke dalam grafik dan tabel di kedua HP secara real-time!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* MIDDLE & RIGHT COLUMNS: GRAPH, TABLE & PRINT REPORT */}
        <div className="md:col-span-2 space-y-6">
          {/* Status Display Area */}
          <div className="bg-[#2E4053] border-4 border-[#2E4053] shadow-xl text-emerald-400 p-5 rounded-3xl font-mono text-xs md:text-sm space-y-2 relative overflow-hidden">
            <div className="absolute top-2 right-4 text-slate-400 uppercase font-black tracking-widest text-[9px] pointer-events-none opacity-50">
              Terminal Sensor 📡
            </div>
            <div className="flex gap-2 items-center text-[10px] text-slate-300 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SENSOR STATE MONITOR</span>
            </div>
            <div className="leading-relaxed whitespace-pre-wrap text-emerald-300 font-bold">
              {statusMessage}
            </div>
          </div>

          {/* Results Plot (Dynamic Graph) */}
          <div className="bg-white border-4 border-[#A9DFBF] shadow-xl rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b-2 border-dashed border-[#A9DFBF] pb-2">
              <h3 className="font-black text-[#2E4053] flex items-center gap-2 text-base">
                <Activity className="w-5 h-5 text-emerald-500" />
                Grafik Cepat Rambat Suara Terukur
              </h3>
              <span className="text-[10px] bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-slate-500 font-bold font-mono">
                Satuan: m/s
              </span>
            </div>

            {trials.length === 0 ? (
              <div className="h-44 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                <span className="text-3xl mb-1 animate-float">📊</span>
                <span className="text-xs font-bold text-slate-500">Belum ada data eksperimen.</span>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs">
                  Lakukan pengambilan data di samping dengan menepuk tangan agar grafik dan tabel otomatis terisi!
                </p>
              </div>
            ) : (
              // Custom Cartoon Line Chart using pure React & SVG
              <div className="h-48 bg-[#EBF5FB]/50 border-2 border-[#AED6F1] rounded-2xl relative p-4 flex flex-col justify-end overflow-hidden">
                <svg className="w-full h-[85%]" viewBox="0 0 500 120" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <g stroke="#cbd5e1" strokeWidth="1" strokeDasharray="5,5">
                    <line x1="0" y1="30" x2="500" y2="30" />
                    <line x1="0" y1="60" x2="500" y2="60" />
                    <line x1="0" y1="90" x2="500" y2="90" />
                  </g>
                  {/* Safe speed of sound reference band: 330 - 350 m/s */}
                  {/* 340m/s maps roughly to y=60 */}
                  <rect x="0" y="55" width="500" height="10" fill="#22c55e" opacity="0.1" />
                  
                  {/* Reference line */}
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4,4" />

                  {/* Draw points & connecting line */}
                  {(() => {
                    // Normalize speeds: map min=200, max=500 to y=100 down to y=10
                    const getY = (speed: number) => {
                      const minVal = 150;
                      const maxVal = 550;
                      const norm = (speed - minVal) / (maxVal - minVal);
                      return 110 - norm * 100; // SVG coordinates go from top down
                    };

                    const getX = (idx: number, total: number) => {
                      if (total <= 1) return 250;
                      return 40 + (idx / (total - 1)) * 420;
                    };

                    // Draw line paths
                    const points = trials.slice().reverse().map((t, idx) => ({
                      x: getX(idx, trials.length),
                      y: getY(t.speed),
                      speed: t.speed,
                    }));

                    const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                    return (
                      <>
                        {points.length > 1 && (
                          <path 
                            d={pathD} 
                            fill="none" 
                            stroke="#3b82f6" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                        )}
                        {points.map((p, idx) => (
                          <g key={idx} className="cursor-pointer group">
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r="5" 
                              fill="#ef4444" 
                              stroke="#1e293b" 
                              strokeWidth="2" 
                              className="transition-all hover:scale-150"
                            />
                            {/* Text labels for values */}
                            <text 
                              x={p.x} 
                              y={p.y - 10} 
                              textAnchor="middle" 
                              fontSize="9" 
                              fontWeight="bold" 
                              fill="#1e293b"
                              className="bg-white px-1"
                            >
                              {p.speed}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
                {/* Horizontal X Axis label */}
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mt-2">
                  <span>Percobaan Pertama</span>
                  <span className="text-[#22c55e] font-extrabold flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    Referensi Kecepatan Suara Riil (~340 m/s)
                  </span>
                  <span>Percobaan Terakhir</span>
                </div>
              </div>
            )}
          </div>

          {/* Results Table & Reporting */}
          <div className="bg-white border-4 border-[#F7DC6F] shadow-xl rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b-2 border-dashed border-[#F7DC6F] pb-2">
              <h3 className="font-black text-[#2E4053] flex items-center gap-2 text-base">
                <span>📑</span> Data Tabel Hasil Pengamatan
              </h3>

              {trials.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    id="btn-download-pdf"
                    onClick={handleDownloadPDF}
                    className="py-1.5 px-3.5 bg-emerald-500 border-b-2 border-emerald-700 text-white hover:bg-emerald-600 hover:translate-y-[-1px] font-bold rounded-full text-xs transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh PDF
                  </button>
                  <button
                    id="btn-print-report"
                    onClick={handlePrintReport}
                    className="py-1.5 px-3.5 bg-[#AED6F1] border-b-2 border-[#5DADE2] text-[#2874A6] hover:bg-[#9AD8B1] hover:translate-y-[-1px] font-bold rounded-full text-xs transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" /> Cetak Laporan
                  </button>
                  <button
                    id="btn-clear-trials"
                    onClick={() => {
                      if (confirm("Apakah kamu yakin ingin menghapus semua data pengamatan?")) {
                        setTrials([]);
                      }
                    }}
                    className="py-1.5 px-2.5 bg-[#F1948A] border-b-2 border-[#C0392B] text-[#922B21] hover:bg-rose-200 hover:translate-y-[-1px] font-bold rounded-full text-xs transition-all shadow-sm"
                  >
                    Hapus Semua
                  </button>
                </div>
              )}
            </div>

            {trials.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">Belum ada tabel data pengamatan.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border-2 border-[#F7DC6F] rounded-2xl overflow-hidden text-xs">
                  <thead>
                    <tr className="bg-[#FEF9E7] border-b-2 border-[#F7DC6F] font-extrabold text-[#7D6608]">
                      <th className="p-2.5 border-r border-[#F7DC6F]/50">No</th>
                      <th className="p-2.5 border-r border-[#F7DC6F]/50">Metode</th>
                      <th className="p-2.5 border-r border-[#F7DC6F]/50">Jarak (m)</th>
                      <th className="p-2.5 border-r border-[#F7DC6F]/50">Waktu Tempuh (s)</th>
                      <th className="p-2.5 border-r border-[#F7DC6F]/50">v Ukur (m/s)</th>
                      <th className="p-2.5 border-r border-[#F7DC6F]/50">v Teori (m/s)</th>
                      <th className="p-2.5 border-r border-[#F7DC6F]/50">Galat (%)</th>
                      <th className="p-2.5">Waktu Ambil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trials.map((t, idx) => (
                      <tr 
                        key={t.id} 
                        className={`border-b border-[#F7DC6F]/30 transition-colors hover:bg-slate-50 ${
                          t.speed >= 300 && t.speed <= 380 ? "bg-emerald-50/50" : "bg-white"
                        }`}
                      >
                        <td className="p-2.5 border-r border-[#F7DC6F]/30 font-bold">{trials.length - idx}</td>
                        <td className="p-2.5 border-r border-[#F7DC6F]/30 font-bold text-slate-600">
                          {t.mode === "1hp" ? "Gema (1 HP)" : "Kompak (2 HP)"}
                        </td>
                        <td className="p-2.5 border-r border-[#F7DC6F]/30 font-mono">{t.mode === "1hp" ? `${t.distance} × 2` : t.distance} m</td>
                        <td className="p-2.5 border-r border-[#F7DC6F]/30 font-mono">{t.time} s</td>
                        <td className="p-2.5 border-r border-[#F7DC6F]/30 font-mono font-extrabold text-slate-800">
                          {t.speed} m/s
                        </td>
                        <td className="p-2.5 border-r border-[#F7DC6F]/30 font-mono text-slate-600 font-bold">
                          343 m/s
                        </td>
                        <td className="p-2.5 border-r border-[#F7DC6F]/30 font-mono font-bold text-rose-600">
                          {t.speed > 0 ? `${Math.abs(((t.speed - 343) / 343) * 100).toFixed(1)}%` : "0.0%"}
                        </td>
                        <td className="p-2.5 font-mono text-slate-500">{t.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-[#FEF9E7] p-3 rounded-2xl border border-[#F7DC6F] text-[10px] text-[#7D6608] mt-3 flex items-center gap-2 font-semibold">
                  <span className="text-lg">📢</span>
                  <span>
                    Kecepatan suara standar di udara bebas bersuhu kamar (25°C) adalah sekitar <b>343 m/s</b>. 
                    Jika hasil pengamatanmu mendekati angka tersebut, praktikummu sangat sukses!
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINT-ONLY AREA FOR CONVENIENT SCHOOL REPORT SUBMISSION */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8 text-slate-900 font-sans leading-relaxed">
        <h1 className="text-center text-2xl font-extrabold border-b-4 border-double border-slate-950 pb-2">
          LAPORAN PRAKTIKUM FISIKA: CEPAT RAMBAT GELOMBANG SUARA
        </h1>
        <div className="grid grid-cols-2 gap-4 my-6 text-sm">
          <div>
            <p><strong>Nama Siswa:</strong> ......................................................</p>
            <p><strong>Kelas:</strong> .............................................................</p>
          </div>
          <div className="text-right">
            <p><strong>Tanggal Praktikum:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Platform:</strong> Gelombang Interaktif & Sensor</p>
          </div>
        </div>

        <h3 className="font-bold text-base mt-6 border-b border-slate-400 pb-1">I. DASAR TEORI</h3>
        <p className="text-xs my-2 leading-relaxed">
          Gelombang bunyi merupakan jenis gelombang longitudinal yang merambat melalui medium perantara (seperti udara). 
          Cepat rambat gelombang didefinisikan sebagai rasio jarak tempuh terhadap waktu rambatan bunyi (v = d / t). 
          Dalam praktikum ini, metode pengukuran dilakukan dengan merekam gema suara pantul (1 HP) atau menyelaraskan timer mikrofon antar dua perangkat terpisah (2 HP).
        </p>

        <h3 className="font-bold text-base mt-6 border-b border-slate-400 pb-1">II. TABEL DATA HASIL PENGAMATAN</h3>
        <table className="w-full text-left border-collapse border border-slate-950 text-xs my-4">
          <thead>
            <tr className="bg-slate-200 border-b border-slate-950 font-bold">
              <th className="p-2 border-r border-slate-950">Percobaan Ke-</th>
              <th className="p-2 border-r border-slate-950">Metode</th>
              <th className="p-2 border-r border-slate-950">Jarak Lintasan (m)</th>
              <th className="p-2 border-r border-slate-950">Waktu Tempuh (s)</th>
              <th className="p-2 border-r border-slate-950">v Ukur (m/s)</th>
              <th className="p-2 border-r border-slate-950">v Teori (m/s)</th>
              <th className="p-2">Galat (%)</th>
            </tr>
          </thead>
          <tbody>
            {trials.map((t, idx) => (
              <tr key={t.id} className="border-b border-slate-950">
                <td className="p-2 border-r border-slate-950 font-bold">{trials.length - idx}</td>
                <td className="p-2 border-r border-slate-950">{t.mode === "1hp" ? "Gema (1 HP)" : "Komunikasi (2 HP)"}</td>
                <td className="p-2 border-r border-slate-950 font-mono">{t.mode === "1hp" ? `${t.distance} × 2` : t.distance}</td>
                <td className="p-2 border-r border-slate-950 font-mono">{t.time}</td>
                <td className="p-2 border-r border-slate-950 font-mono font-extrabold">{t.speed} m/s</td>
                <td className="p-2 border-r border-slate-950 font-mono">343 m/s</td>
                <td className="p-2 font-mono">{t.speed > 0 ? `${Math.abs(((t.speed - 343) / 343) * 100).toFixed(1)}%` : "0.0%"}</td>
              </tr>
            ))}
            {trials.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs italic">Tidak ada data hasil pengamatan yang dicetak.</td>
              </tr>
            )}
          </tbody>
        </table>

        <h3 className="font-bold text-base mt-6 border-b border-slate-400 pb-1">III. ANALISIS & KESIMPULAN</h3>
        <p className="text-xs my-2 leading-relaxed">
          Berdasarkan data di atas, rata-rata cepat rambat gelombang suara terhitung sebesar: ............. m/s. 
          Hasil ini jika dibandingkan dengan teori standar (343 m/s) mengalami deviasi sebesar ............% disebabkan oleh faktor bising ruangan atau ketelitian pengukuran manual.
        </p>

        <div className="grid grid-cols-2 gap-4 mt-20 text-center text-sm">
          <div>
            <p>Mengetahui,</p>
            <p className="mt-16 font-bold">( Guru Pembimbing Fisika )</p>
          </div>
          <div>
            <p>Praktikan,</p>
            <p className="mt-16 font-bold">( ........................................ )</p>
          </div>
        </div>
      </div>
    </div>
  );
}
