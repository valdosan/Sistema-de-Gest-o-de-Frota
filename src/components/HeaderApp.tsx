import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, Download, Laptop } from "lucide-react";
import { Brasao19CIPM, BrasaoPMBA } from "./Brasoes";
import { Usuario, ConfigSistema } from "../types";

interface HeaderAppProps {
  onToggleMenu: () => void;
  currentUser?: Usuario | null;
  onLogout?: () => void;
  isOnline?: boolean;
  isSyncing?: boolean;
  onManualSync?: () => void;
  config?: ConfigSistema;
  onOpenConfig?: () => void;
  onOpenDownloadApp?: () => void;
  isMenuOpen?: boolean;
  syncStatus?: "synced" | "syncing" | "offline";
  onSelectUser?: (user: Usuario) => void;
  availableUsers?: Usuario[];
}

export const HeaderApp: React.FC<HeaderAppProps> = ({
  onToggleMenu,
  currentUser,
  onLogout,
  isOnline = true,
  isSyncing = false,
  onManualSync,
  config,
  onOpenConfig,
  onOpenDownloadApp,
  isMenuOpen = false,
  syncStatus,
  onSelectUser,
  availableUsers = [],
}) => {
  const [currentDateStr, setCurrentDateStr] = useState<string>("");
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      const meses = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
      ];
      const dia = now.getDate();
      const mes = meses[now.getMonth()];
      const ano = now.getFullYear();
      setCurrentDateStr(`${dia} de ${mes} de ${ano}`);

      const horas = String(now.getHours()).padStart(2, "0");
      const minutos = String(now.getMinutes()).padStart(2, "0");
      const segundos = String(now.getSeconds()).padStart(2, "0");
      setCurrentTimeStr(`${horas}:${minutos}:${segundos}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const systemTitle = config?.systemTitle || "SISTEMA DE GESTÃO DE FROTA";
  const orgaoSuperior = config?.orgaoSuperior || "POLÍCIA MILITAR DA BAHIA";
  const comandoRegional = config?.comandoRegional || "CPRC-BTS";
  const subTitle = config?.subTitle || "19ª CIPM / PARIPE • O GUARDIÃO DO SUBÚRBIO";
  const iconeSistema = config?.iconeSistemaUrl || "/assets/icone_frota_19cipm.jpg";

  const isActuallyOnline = syncStatus ? syncStatus !== "offline" : isOnline;
  const isActuallySyncing = syncStatus ? syncStatus === "syncing" : isSyncing;

  return (
    <header id="main-header" className="bg-black text-white border-b border-neutral-800 sticky top-0 z-40 shadow-md print:hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Left Side: 4-bars Menu Button + Crest + System Icon + Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            id="btn-toggle-menu"
            onClick={onToggleMenu}
            className={`p-2 sm:p-2.5 rounded-xl border transition flex flex-col justify-center items-center gap-1 w-10 h-10 shrink-0 shadow-xs cursor-pointer ${
              isMenuOpen
                ? "bg-neutral-800 border-neutral-600 text-white"
                : "bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700"
            }`}
            title="Abrir / Recolher Menu Lateral"
          >
            {/* 4 horizontal bars icon */}
            <div className="w-5 h-0.5 bg-white rounded-full"></div>
            <div className="w-5 h-0.5 bg-amber-400 rounded-full"></div>
            <div className="w-5 h-0.5 bg-blue-400 rounded-full"></div>
            <div className="w-5 h-0.5 bg-slate-300 rounded-full"></div>
          </button>

          {/* Left Crest: Custom image or Brasao19CIPM */}
          <div className="shrink-0 flex items-center">
            {config?.brasaoEsquerdaUrl ? (
              <img
                src={config.brasaoEsquerdaUrl}
                alt="Brasão Unidade"
                referrerPolicy="no-referrer"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm"
              />
            ) : (
              <Brasao19CIPM className="h-10 sm:h-12 w-auto drop-shadow-sm" />
            )}
          </div>

          {/* System Icon (Imagem 4) */}
          {iconeSistema && (
            <div className="shrink-0 flex items-center">
              <img
                src={iconeSistema}
                alt="Ícone do Sistema"
                referrerPolicy="no-referrer"
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg object-cover border border-neutral-700 shadow-sm"
                title="Ícone da Frota"
              />
            </div>
          )}

          {/* Texts beside System Icon - White typography on black header */}
          <div>
            <h1 className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wide text-white leading-tight">
              POLÍCIA MILITAR DA BAHIA
            </h1>
            <p className="text-[10px] sm:text-xs text-neutral-200 font-bold uppercase tracking-wider">
              SISTEMA DE GERENCIAMENTO DE FROTA
            </p>
          </div>
        </div>

        {/* Right Side: Date & Time, Online Indicator and PMBA Certification Crest */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 ml-auto">
          {/* Real-time Date and Clock Display (à esquerda do status e brasão) */}
          <div className="text-right">
            <div className="text-[10px] sm:text-xs font-semibold text-neutral-300">
              {currentDateStr || "Carregando data..."}
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider">
              {currentTimeStr || "--:--:--"}
            </div>
          </div>

          {/* Online/Offline Status Indicator */}
          <div className="flex items-center">
            <button
              type="button"
              id="btn-sync-status"
              onClick={onManualSync}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                isActuallyOnline
                  ? "bg-emerald-950 text-emerald-200 border-emerald-700 hover:bg-emerald-900"
                  : "bg-red-950 text-red-200 border-red-700 hover:bg-red-900"
              }`}
              title={isActuallyOnline ? "Sistema Online - Clique para sincronizar agora" : "Sistema Offline (Modo Local)"}
            >
              {isActuallyOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
              {isActuallySyncing && <RefreshCw className="w-3 h-3 animate-spin text-blue-300 ml-0.5" />}
            </button>
          </div>

          {/* Botão Baixar App / Versão Offline (HTML & Windows .exe) */}
          {onOpenDownloadApp && (
            <button
              type="button"
              id="btn-header-download-app"
              onClick={onOpenDownloadApp}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 hover:border-emerald-500 transition cursor-pointer shadow-xs"
              title="Baixar Versão Completa em HTML e Instalador Windows 10/11 (.exe)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Baixar App (.exe / HTML)</span>
              <span className="md:hidden">Baixar</span>
            </button>
          )}

          {/* PMBA Certification Crest (alinhado com margem direita) */}
          <div className="shrink-0 flex items-center">
            {config?.brasaoDireitaUrl ? (
              <img
                src={config.brasaoDireitaUrl}
                alt="Brasão PMBA"
                referrerPolicy="no-referrer"
                className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm"
              />
            ) : (
              <BrasaoPMBA className="h-10 sm:h-12 w-auto drop-shadow-sm" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
