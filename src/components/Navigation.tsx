import React, { useState } from "react";
import { BookOpen, Activity, Compass, Award, Menu, X, Home } from "lucide-react";

interface NavigationProps {
  currentView: "dashboard" | "materi" | "simulasi" | "praktikum" | "kuis";
  setView: (view: "dashboard" | "materi" | "simulasi" | "praktikum" | "kuis") => void;
}

export default function Navigation({ currentView, setView }: NavigationProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const menuItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: Home, 
      selectedClass: "bg-[#F5B041] border-b-4 border-[#CA6F1E] text-white", 
      unselectedClass: "bg-white border-b-4 border-slate-200 text-[#546E7A] hover:bg-slate-50"
    },
    { 
      id: "materi", 
      label: "Materi Belajar", 
      icon: BookOpen, 
      selectedClass: "bg-[#F7DC6F] border-b-4 border-[#D4AC0D] text-[#7D6608]", 
      unselectedClass: "bg-white border-b-4 border-slate-200 text-[#546E7A] hover:bg-slate-50"
    },
    { 
      id: "simulasi", 
      label: "Simulasi Interaktif", 
      icon: Compass, 
      selectedClass: "bg-[#AED6F1] border-b-4 border-[#5DADE2] text-[#2874A6]", 
      unselectedClass: "bg-white border-b-4 border-slate-200 text-[#546E7A] hover:bg-slate-50"
    },
    { 
      id: "praktikum", 
      label: "Praktikum Sensor", 
      icon: Activity, 
      selectedClass: "bg-[#A9DFBF] border-b-4 border-[#27AE60] text-[#1E8449]", 
      unselectedClass: "bg-white border-b-4 border-slate-200 text-[#546E7A] hover:bg-slate-50"
    },
    { 
      id: "kuis", 
      label: "Kuis Uji Coba", 
      icon: Award, 
      selectedClass: "bg-[#F1948A] border-b-4 border-[#C0392B] text-[#922B21]", 
      unselectedClass: "bg-white border-b-4 border-slate-200 text-[#546E7A] hover:bg-slate-50"
    },
  ];

  const handleSelect = (id: "dashboard" | "materi" | "simulasi" | "praktikum" | "kuis") => {
    setView(id);
    setIsOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b-4 border-[#5DADE2] sticky top-0 z-50 px-6 py-4" id="nav-container">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo and Brand (Artistic style) */}
        <div 
          onClick={() => setView("dashboard")} 
          className="flex items-center gap-4 cursor-pointer group select-none"
        >
          <div className="w-14 h-14 bg-[#FF7F50] rounded-2xl rotate-3 flex items-center justify-center shadow-lg border-2 border-white group-hover:rotate-12 transition-transform duration-300">
            <span className="text-white text-3xl font-black">🐰</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#2E4053] tracking-tight leading-none">
              Gelombang <span className="text-[#FF7F50]">Pintar</span>
            </h1>
            <p className="text-[10px] font-bold text-[#546E7A] uppercase tracking-widest mt-1.5 leading-none">
              Ekspedisi Cepat Rambat Gelombang
            </p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleSelect(item.id as any)}
                className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-all ${
                  isSelected 
                    ? `${item.selectedClass} translate-y-[1px] shadow-sm` 
                    : `${item.unselectedClass} hover:translate-y-[-1px]`
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            id="mobile-menu-btn"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 border-2 border-[#5DADE2] rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5 text-[#2E4053]" /> : <Menu className="w-5 h-5 text-[#2E4053]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden mt-4 bg-white/95 border-t border-[#5DADE2] p-4 rounded-2xl flex flex-col gap-2.5 shadow-lg">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-item-${item.id}`}
                onClick={() => handleSelect(item.id as any)}
                className={`w-full py-3 px-5 rounded-xl font-bold text-sm flex items-center gap-3 border transition-all ${
                  isSelected 
                    ? `${item.selectedClass}` 
                    : `${item.unselectedClass}`
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
