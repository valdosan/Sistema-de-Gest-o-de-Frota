import React, { useRef } from "react";
import {
  LayoutDashboard,
  Car,
  Bike,
  QrCode,
  Truck,
  Package,
  Gauge,
  Wrench,
  Sparkles,
  FileCheck2,
  DollarSign,
  ShieldCheck,
  Archive,
  Globe,
  ExternalLink,
  FolderOpen,
  Download,
  Upload,
  LogOut,
  Settings,
  X
} from "lucide-react";
import { PerfilUsuario, ConfigSistema, ViewTab, Usuario } from "../types";
import { Brasao19CIPM } from "./Brasoes";

export type { ViewTab };

interface MenuLateralProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab?: ViewTab;
  activeTab?: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  userRole?: PerfilUsuario | string;
  currentUser?: Usuario | null;
  onSelectUser?: (user: Usuario) => void;
  availableUsers?: Usuario[];
  totalChecklists?: number;
  totalViaturasIndisponiveis?: number;
  totalViaturasBaixadas?: number;
  config?: ConfigSistema;
  onOpenConfig?: () => void;
  onOpenDownloadApp?: () => void;
  onBackupJson?: () => void;
  onRestoreJson?: (file: File) => void;
  onLogout?: () => void;
}

interface MenuItemDef {
  id: ViewTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: PerfilUsuario[];
  badge?: string;
  dynamicBadge?: "checklists" | "indisponiveis" | "baixadas";
}

// Exact 12 items in requested order and sequence:
// 1. Dash Board
// 2. Checklist viaturas 4 rodas
// 3. Checklist viaturas 2 rodas
// 4. Carga de Viaturas
// 5. Controle de Estoque
// 6. Revisões
// 7. Manutenções
// 8. Higienizações
// 9. Relatórios
// 10. Gastos com Manutenção
// 11. Cadastro de Viaturas
// 12. Viaturas Baixadas
const MENU_ITEMS_PRINCIPAIS: MenuItemDef[] = [
  {
    id: "dashboard",
    label: "Dash Board",
    icon: LayoutDashboard,
  },
  {
    id: "checklist-carro",
    label: "Checklist viaturas 4 rodas",
    icon: Car,
  },
  {
    id: "checklist-moto",
    label: "Checklist viaturas 2 rodas",
    icon: Bike,
  },
  {
    id: "gerar-qrcode",
    label: "Gerar QRCode",
    icon: QrCode,
  },
  {
    id: "carga-viaturas",
    label: "Carga de Viaturas",
    icon: Truck,
  },
  {
    id: "controle-estoque",
    label: "Controle de Estoque",
    icon: Package,
  },
  {
    id: "controle-revisoes",
    label: "Revisões",
    icon: Gauge,
  },
  {
    id: "manutencoes",
    label: "Manutenções",
    icon: Wrench,
  },
  {
    id: "higienizacoes",
    label: "Higienizações",
    icon: Sparkles,
  },
  {
    id: "relatorios",
    label: "Relatórios",
    icon: FileCheck2,
    dynamicBadge: "checklists",
  },
  {
    id: "gastos-manutencao",
    label: "Gastos com Manutenção",
    icon: DollarSign,
  },
  {
    id: "cadastro-viaturas",
    label: "Cadastro de Viaturas",
    icon: ShieldCheck,
    dynamicBadge: "indisponiveis",
  },
  {
    id: "viaturas-baixadas",
    label: "Viaturas Baixadas",
    icon: Archive,
    dynamicBadge: "baixadas",
  },
];

export const MenuLateral: React.FC<MenuLateralProps> = ({
  isOpen,
  onClose,
  currentTab,
  activeTab,
  onSelectTab,
  currentUser,
  onSelectUser,
  availableUsers = [],
  totalChecklists = 0,
  totalViaturasIndisponiveis = 0,
  totalViaturasBaixadas = 0,
  config,
  onOpenConfig,
  onOpenDownloadApp,
  onBackupJson,
  onRestoreJson,
  onLogout,
}) => {
  const selectedTab = currentTab || activeTab || "dashboard";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const explorerInputRef = useRef<HTMLInputElement | null>(null);

  const handleItemClick = (tab: ViewTab) => {
    onSelectTab(tab);
    onClose();
  };

  const handleOpenWindowsExplorer = () => {
    if (explorerInputRef.current) {
      explorerInputRef.current.click();
    }
  };

  const handleTriggerRestoreJson = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onRestoreJson) {
      onRestoreJson(file);
      onClose();
    }
  };

  const handleConfirmLogout = () => {
    if (onLogout) {
      onLogout();
      onClose();
    } else {
      if (window.confirm("Deseja realmente sair do Sistema de Gestão de Frota?")) {
        window.location.reload();
      }
    }
  };

  const iconeSistema = config?.iconeSistemaUrl || "/assets/icone_frota_19cipm.jpg";

  return (
    <>
      {/* Hidden File Inputs for Windows Explorer & J.SOM Restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
        aria-label="Upload de Backup JSON"
      />
      <input
        type="file"
        ref={explorerInputRef}
        multiple
        className="hidden"
        aria-label="Windows Explorer Arquivos"
      />

      {/* Backdrop */}
      {isOpen && (
        <div
          id="menu-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 transition-opacity print:hidden"
        />
      )}

      {/* Sidebar: PREVALECENDO COR PRETA E LETRAS BRANCAS */}
      <aside
        id="menu-lateral-container"
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-black text-white border-r border-neutral-800 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl print:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header do Menu com texto exato solicitado */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            {/* Ícone do Sistema ou Brasão */}
            {iconeSistema ? (
              <img
                src={iconeSistema}
                alt="Ícone do Sistema"
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-lg object-cover border border-neutral-700 shadow-md shrink-0"
              />
            ) : config?.brasaoEsquerdaUrl ? (
              <img
                src={config.brasaoEsquerdaUrl}
                alt="Brasão"
                referrerPolicy="no-referrer"
                className="w-11 h-11 object-contain drop-shadow-md shrink-0"
              />
            ) : (
              <div className="w-11 h-11 flex items-center justify-center shrink-0">
                <Brasao19CIPM className="w-10 h-10" />
              </div>
            )}

            <div>
              {/* Linha 1: POLÍCIA MILITAR DA BAHIA (substituindo 'menu do sistema') */}
              <div className="text-[10px] uppercase font-extrabold tracking-wider text-blue-400 leading-none">
                POLÍCIA MILITAR DA BAHIA
              </div>
              {/* Linha 2: 19ªCIPM/PARIPE (substituindo '19ª CIPM. PMBA') */}
              <div className="text-base font-black text-white leading-tight mt-0.5">
                19ªCIPM/PARIPE
              </div>
              {/* Linha 3: SISTEMA DE GESTÃO DE FROTA (substituindo '19ª cipm/paripe. O guardiã...') */}
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                SISTEMA DE GESTÃO DE FROTA
              </div>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-sidebar"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-slate-300 hover:text-white border border-neutral-700 transition cursor-pointer"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List com cor preta e letras brancas */}
        <div className="flex-1 overflow-y-auto py-2.5 px-2.5 space-y-1 scrollbar-thin scrollbar-thumb-neutral-700">
          {/* 12 Itens na Ordem e Sequência Exata Solicitada */}
          {MENU_ITEMS_PRINCIPAIS.map((item) => {
            const Icon = item.icon;
            const isActive = selectedTab === item.id;

            let badgeDisplay = item.badge;
            if (item.dynamicBadge === "checklists" && totalChecklists > 0) {
              badgeDisplay = `${totalChecklists}`;
            } else if (item.dynamicBadge === "indisponiveis" && totalViaturasIndisponiveis > 0) {
              badgeDisplay = `${totalViaturasIndisponiveis} Indisp.`;
            } else if (item.dynamicBadge === "baixadas" && totalViaturasBaixadas > 0) {
              badgeDisplay = `${totalViaturasBaixadas}`;
            }

            return (
              <button
                type="button"
                id={`menu-item-${item.id}`}
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white font-bold border border-blue-500 shadow-md"
                    : "text-white hover:bg-neutral-900 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive
                        ? "bg-blue-700 text-white shadow-xs"
                        : "bg-neutral-900 text-slate-200 border border-neutral-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm tracking-wide font-medium">{item.label}</span>
                </div>

                {badgeDisplay && (
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      item.dynamicBadge === "indisponiveis"
                        ? "bg-red-500/20 text-red-300 border border-red-500/40"
                        : item.dynamicBadge === "baixadas"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                    }`}
                  >
                    {badgeDisplay}
                  </span>
                )}
              </button>
            );
          })}

          {/* Duas Linhas Mais Abaixo (Espaçador e Linha Divisória Dupla) */}
          <div className="pt-3 mt-3 border-t border-neutral-800">
            <div className="border-t border-neutral-800 mb-2.5"></div>

            <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              UTILITÁRIOS & SISTEMA
            </div>

            {/* 1. Internet/Google */}
            <a
              href="https://www.google.com"
              target="_blank"
              rel="noopener noreferrer"
              id="menu-btn-google"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-white hover:bg-neutral-900 hover:text-white transition cursor-pointer no-underline"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-neutral-900 text-slate-200 border border-neutral-800">
                  <Globe className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs sm:text-sm font-medium">Internet/Google</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {/* 2. Sei Bahia */}
            <a
              href="https://sip.seibahia.ba.gov.br/login.php?sigla_orgao_sistema=GOVBA&sigla_sistema=SEI"
              target="_blank"
              rel="noopener noreferrer"
              id="menu-btn-seibahia"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-white hover:bg-neutral-900 hover:text-white transition cursor-pointer no-underline"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-neutral-900 text-slate-200 border border-neutral-800">
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs sm:text-sm font-medium">Sei Bahia</span>
              </div>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                GOV.BA
              </span>
            </a>

            {/* 3. Windows explorer */}
            <button
              type="button"
              id="menu-btn-windowsexplorer"
              onClick={handleOpenWindowsExplorer}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-white hover:bg-neutral-900 hover:text-white transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-neutral-900 text-slate-200 border border-neutral-800">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs sm:text-sm font-medium">Windows explorer</span>
              </div>
              <span className="text-[10px] text-slate-400">Arquivos</span>
            </button>

            {/* 4. Backup J.SOM */}
            <button
              type="button"
              id="menu-btn-backup-json"
              onClick={onBackupJson}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-white hover:bg-neutral-900 hover:text-white transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-neutral-900 text-slate-200 border border-neutral-800">
                  <Download className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-xs sm:text-sm font-medium">Backup J.SOM</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">.json</span>
            </button>

            {/* 5. Recuperação de J.SOM */}
            <button
              type="button"
              id="menu-btn-restore-json"
              onClick={handleTriggerRestoreJson}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-white hover:bg-neutral-900 hover:text-white transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-neutral-900 text-slate-200 border border-neutral-800">
                  <Upload className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-xs sm:text-sm font-medium">Recuperação de J.SOM</span>
              </div>
              <span className="text-[10px] text-purple-400 font-mono">Restaurar</span>
            </button>

            {/* Informações do Usuário Logado no Sistema */}
            {currentUser && (
              <div className="mt-3 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-black text-sm shrink-0 border border-blue-500/30 shadow-xs">
                    {currentUser.nome.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wide">
                      Militar Logado no Sistema
                    </div>
                    <div className="text-xs font-bold text-white truncate">
                      {currentUser.cargoPosto} {currentUser.nome}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Mat. {currentUser.matricula} • <span className="uppercase text-blue-400 font-bold">{currentUser.perfil}</span>
                    </div>
                  </div>
                </div>

                {/* Alternar usuário se houver mais militares disponíveis */}
                {availableUsers && availableUsers.length > 1 && onSelectUser && (
                  <div className="mt-2 pt-2 border-t border-neutral-800">
                    <label className="text-[10px] text-slate-400 font-medium block mb-1">
                      Alternar Militar de Serviço:
                    </label>
                    <select
                      value={currentUser.id}
                      onChange={(e) => {
                        const found = availableUsers.find((u) => u.id === e.target.value);
                        if (found) onSelectUser(found);
                      }}
                      className="w-full bg-neutral-950 text-white text-xs border border-neutral-700 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.cargoPosto} {u.nome} ({u.perfil})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Baixar App / Versão Offline (HTML & Windows .exe) */}
            {onOpenDownloadApp && (
              <button
                type="button"
                id="menu-btn-baixar-app"
                onClick={() => {
                  onClose();
                  onOpenDownloadApp();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-emerald-400 hover:text-white hover:bg-neutral-900 transition text-xs sm:text-sm font-bold cursor-pointer mt-1 border border-emerald-900/50 hover:border-emerald-500"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <Download className="w-4 h-4" />
                  </div>
                  <span>Baixar App (.exe / HTML)</span>
                </div>
                <span className="text-[9px] bg-emerald-900/80 text-emerald-200 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Offline
                </span>
              </button>
            )}

            {/* Configuração de Cabeçalho / Personalização */}
            {onOpenConfig && (
              <button
                type="button"
                id="menu-btn-personalizar"
                onClick={() => {
                  onClose();
                  onOpenConfig();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-neutral-900 transition text-xs sm:text-sm font-medium cursor-pointer mt-1"
              >
                <div className="p-1.5 rounded-lg bg-neutral-900 text-slate-200 border border-neutral-800">
                  <Settings className="w-4 h-4 text-slate-300" />
                </div>
                <span>Personalizar Cabeçalho / Brasões</span>
              </button>
            )}

            {/* 6. Ícone Sair */}
            <button
              type="button"
              id="menu-btn-sair"
              onClick={handleConfirmLogout}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-red-300 hover:text-white hover:bg-red-950/40 border border-transparent hover:border-red-900/40 transition cursor-pointer mt-1"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-red-950/50 text-red-400 border border-red-900/50">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold">Ícone Sair</span>
              </div>
              <span className="text-[10px] text-red-400 uppercase font-bold">Logout</span>
            </button>
          </div>
        </div>

        {/* Rodapé do Menu Lateral */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950 text-center">
          <div className="text-[11px] font-bold text-white tracking-wide">
            {config?.systemTitle || "SISTEMA DE GESTÃO DE FROTA"}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            {config?.rodapeTexto || "19ª CIPM • PARIPE • Versão 2.4 Online/Offline"}
          </div>
        </div>
      </aside>
    </>
  );
};
