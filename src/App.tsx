import React, { useState, useEffect, useCallback } from "react";
import {
  AppState,
  Checklist,
  CargaViatura,
  Viatura,
  GastoManutencao,
  RevisaoViatura,
  ItemInventario,
  RegistroPneu,
  Usuario,
  ConfigSistema,
  RegistroManutencao,
  RegistroHigienizacao,
  ViewTab
} from "./types";
import {
  MOCK_VIATURAS,
  MOCK_USUARIOS,
  MOCK_GASTOS,
  MOCK_REVISOES,
  MOCK_INVENTARIO,
  MOCK_PNEUS,
  MOCK_MANUTENCOES,
  MOCK_HIGIENIZACOES,
  DEFAULT_CONFIG
} from "./constants";

// Components
import { HeaderApp } from "./components/HeaderApp";
import { MenuLateral } from "./components/MenuLateral";
import { DashboardView } from "./components/DashboardView";
import { ChecklistCarroView } from "./components/ChecklistCarroView";
import { ChecklistMotoView } from "./components/ChecklistMotoView";
import { RelatoriosVistoriaView } from "./components/RelatoriosVistoriaView";
import { CargaViaturasView } from "./components/CargaViaturasView";
import { GastosManutencaoView } from "./components/GastosManutencaoView";
import { ControleRevisoesView } from "./components/ControleRevisoesView";
import { InventarioMateriaisView } from "./components/InventarioMateriaisView";
import { ControlePneusView } from "./components/ControlePneusView";
import { GerenciamentoViaturasView } from "./components/GerenciamentoViaturasView";
import { GerenciamentoUsuariosView } from "./components/GerenciamentoUsuariosView";
import { ManutencoesView } from "./components/ManutencoesView";
import { HigienizacoesView } from "./components/HigienizacoesView";
import { ViaturasBaixadasView } from "./components/ViaturasBaixadasView";
import { GerarQrCodeView } from "./components/GerarQrCodeView";
import { ModalConfiguracaoCabecalho } from "./components/ModalConfiguracaoCabecalho";
import { ModalDownloadApp } from "./components/ModalDownloadApp";
import { EmailModal } from "./components/EmailModal";
import { CheckCircle2, QrCode, Lock, Shield, ArrowRight } from "lucide-react";
import { formatPrefixo, formatPlaca } from "./utils/formatters";

const LOCAL_STORAGE_KEY = "frota_19cipm_app_state_v2";
const CONFIG_STORAGE_KEY = "frota_19cipm_config_v2";

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<ViewTab>("dashboard");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // Sync / Online Status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline">("synced");

  // Current logged in user (Default to Despachante / Sgt PM)
  const [currentUser, setCurrentUser] = useState<Usuario>(MOCK_USUARIOS[1]);

  // Main App State
  const [viaturas, setViaturas] = useState<Viatura[]>(MOCK_VIATURAS);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [cargas, setCargas] = useState<CargaViatura[]>([]);
  const [gastos, setGastos] = useState<GastoManutencao[]>(MOCK_GASTOS);
  const [revisoes, setRevisoes] = useState<RevisaoViatura[]>(MOCK_REVISOES);
  const [inventario, setInventario] = useState<ItemInventario[]>(MOCK_INVENTARIO);
  const [pneus, setPneus] = useState<RegistroPneu[]>(MOCK_PNEUS);
  const [usuarios, setUsuarios] = useState<Usuario[]>(MOCK_USUARIOS);
  const [manutencoes, setManutencoes] = useState<RegistroManutencao[]>(MOCK_MANUTENCOES);
  const [higienizacoes, setHigienizacoes] = useState<RegistroHigienizacao[]>(MOCK_HIGIENIZACOES);

  // Dynamic Header, Crests and Diagram Configuration
  const [config, setConfig] = useState<ConfigSistema>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          diagramaCarroUrl: parsed.diagramaCarroUrl || DEFAULT_CONFIG.diagramaCarroUrl,
          diagramaMotoUrl: parsed.diagramaMotoUrl || DEFAULT_CONFIG.diagramaMotoUrl,
        };
      }
    } catch (e) {
      console.error("Error reading config from localStorage", e);
    }
    return DEFAULT_CONFIG;
  });
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

  // State for editing a checklist
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);

  // Email modal checklist state
  const [emailModalChecklist, setEmailModalChecklist] = useState<Checklist | null>(null);

  // QR Code access and submit state
  const [isQrCodeSession, setIsQrCodeSession] = useState<boolean>(false);
  const [qrCodeConfirmation, setQrCodeConfirmation] = useState<{
    prefixo: string;
    placa: string;
    tipo: string;
    dataHora: string;
  } | null>(null);

  // Toast / Notification banner
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSaveConfig = (newConfig: ConfigSistema) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.error("Error saving config to localStorage", e);
    }
    showToast("Configurações do cabeçalho, brasões e diagramas salvas com sucesso!", "success");
  };

  // Sync with Server (or fallback to LocalStorage)
  const fetchServerData = useCallback(async () => {
    setSyncStatus("syncing");
    const normalizeRevisoes = (list: any[]): RevisaoViatura[] => {
      return list.map((r) => ({
        id: r.id || `rev-${Math.random().toString(36).substring(2, 7)}`,
        prefixo: r.prefixo || "",
        placa: r.placa || "",
        tipoServico: r.tipoServico || r.tipo || "Revisão Periódica",
        kmUltimaRevisao: Number(r.kmUltimaRevisao ?? r.km ?? 0),
        kmProximaRevisao: Number(r.kmProximaRevisao ?? (Number(r.km || 0) + 10000)),
        dataProximaRevisao: r.dataProximaRevisao || r.data || new Date().toISOString().split("T")[0],
        oficina: r.oficina || "Oficina Central PMBA",
        status: (r.status === "concluida" || r.status === "vencida" || r.status === "agendada") ? r.status : "agendada",
        observacoes: r.observacoes || r.itens || "",
      }));
    };

    const normalizeHigienizacoes = (list: any[]): RegistroHigienizacao[] => {
      return list.map((h) => ({
        id: h.id || `hig-${Math.random().toString(36).substring(2, 7)}`,
        prefixo: h.prefixo || "",
        placa: h.placa || "",
        tipo: h.tipo || "Lavagem Geral",
        data: h.data || new Date().toISOString().split("T")[0],
        responsavel: h.responsavel || "Setor de Transporte",
        local: h.local || "Base 19ª CIPM - Paripe",
        km: Number(h.km || 0),
        custo: Number(h.custo || 0),
        observacoes: h.observacoes || "",
      }));
    };

    try {
      const response = await fetch("/api/sync");
      if (response.ok) {
        const data: AppState = await response.json();
        if (data) {
          if (data.viaturas?.length) setViaturas(data.viaturas);
          if (data.checklists) setChecklists(data.checklists);
          if (data.cargas) setCargas(data.cargas);
          if (data.gastos?.length) setGastos(data.gastos);
          if (data.revisoes?.length) setRevisoes(normalizeRevisoes(data.revisoes));
          if (data.inventario?.length) setInventario(data.inventario);
          if (data.pneus?.length) setPneus(data.pneus);
          if (data.usuarios?.length) setUsuarios(data.usuarios);
          if ((data as any).manutencoes?.length) setManutencoes((data as any).manutencoes);
          if ((data as any).higienizacoes?.length) setHigienizacoes(normalizeHigienizacoes((data as any).higienizacoes));
          setSyncStatus("synced");
          return;
        }
      }
    } catch (e) {
      console.warn("Backend sync failed, falling back to LocalStorage:", e);
    }

    // Fallback LocalStorage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: AppState & { manutencoes?: RegistroManutencao[]; higienizacoes?: RegistroHigienizacao[] } = JSON.parse(saved);
        if (parsed.viaturas) setViaturas(parsed.viaturas);
        if (parsed.checklists) setChecklists(parsed.checklists);
        if (parsed.cargas) setCargas(parsed.cargas);
        if (parsed.gastos) setGastos(parsed.gastos);
        if (parsed.revisoes) setRevisoes(normalizeRevisoes(parsed.revisoes));
        if (parsed.inventario) setInventario(parsed.inventario);
        if (parsed.pneus) setPneus(parsed.pneus);
        if (parsed.usuarios) setUsuarios(parsed.usuarios);
        if (parsed.manutencoes) setManutencoes(parsed.manutencoes);
        if (parsed.higienizacoes) setHigienizacoes(normalizeHigienizacoes(parsed.higienizacoes));
      }
    } catch (err) {
      console.error("Error reading localStorage", err);
    }
    setSyncStatus(navigator.onLine ? "synced" : "offline");
  }, []);

  // Save current state to server & LocalStorage
  const persistState = useCallback(async (stateToSave: Partial<AppState & { manutencoes?: RegistroManutencao[]; higienizacoes?: RegistroHigienizacao[] }>) => {
    // 1. LocalStorage
    try {
      const currentFullState = {
        viaturas,
        checklists,
        cargas,
        gastos,
        revisoes,
        inventario,
        pneus,
        usuarios,
        manutencoes,
        higienizacoes,
        config,
        ...stateToSave,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentFullState));
    } catch (e) {
      console.warn("Error saving to localStorage", e);
    }

    // 2. Server
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stateToSave),
      });
      setSyncStatus("synced");
    } catch (e) {
      console.warn("Error persisting to server, will sync when online:", e);
      setSyncStatus(navigator.onLine ? "synced" : "offline");
    }
  }, [viaturas, checklists, cargas, gastos, revisoes, inventario, pneus, usuarios, manutencoes, higienizacoes, config]);

  // Initial load
  useEffect(() => {
    fetchServerData();

    // Check URL parameters for QR Code direct scan
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab") as ViewTab | null;
      const qrParam = urlParams.get("qrcode");
      if (tabParam === "checklist-carro" || tabParam === "checklist-moto") {
        setCurrentTab(tabParam);
        if (qrParam === "1" || qrParam === "true") {
          setIsQrCodeSession(true);
        }
      } else if (tabParam === "gerar-qrcode") {
        setCurrentTab("gerar-qrcode");
      }
    } catch (e) {
      console.warn("Could not parse url params", e);
    }

    const handleOnline = () => {
      setIsOnline(true);
      fetchServerData();
      showToast("Conexão restabelecida! Dados sincronizados.", "success");
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("offline");
      showToast("Modo Offline ativado. Todos os checklists continuarão sendo salvos localmente.", "info");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchServerData]);

  // Backup J.SOM
  const handleBackupJson = () => {
    const fullBackupData = {
      sistema: "GESTÃO DE FROTA - 19ª CIPM/PARIPE",
      exportadoEm: new Date().toISOString(),
      viaturas,
      checklists,
      cargas,
      gastos,
      revisoes,
      inventario,
      pneus,
      usuarios,
      manutencoes,
      higienizacoes,
      config,
    };
    const jsonString = JSON.stringify(fullBackupData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `backup_frota_19cipm_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Backup J.SOM baixado com sucesso!", "success");
  };

  // Recuperação de J.SOM
  const handleRestoreJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed) {
          if (Array.isArray(parsed.viaturas)) setViaturas(parsed.viaturas);
          if (Array.isArray(parsed.checklists)) setChecklists(parsed.checklists);
          if (Array.isArray(parsed.cargas)) setCargas(parsed.cargas);
          if (Array.isArray(parsed.gastos)) setGastos(parsed.gastos);
          if (Array.isArray(parsed.revisoes)) setRevisoes(parsed.revisoes);
          if (Array.isArray(parsed.inventario)) setInventario(parsed.inventario);
          if (Array.isArray(parsed.pneus)) setPneus(parsed.pneus);
          if (Array.isArray(parsed.usuarios)) setUsuarios(parsed.usuarios);
          if (Array.isArray(parsed.manutencoes)) setManutencoes(parsed.manutencoes);
          if (Array.isArray(parsed.higienizacoes)) setHigienizacoes(parsed.higienizacoes);
          if (parsed.config) setConfig(parsed.config);

          await persistState(parsed);
          showToast("Recuperação de J.SOM concluída! Todos os dados foram restaurados com sucesso.", "success");
        }
      } catch (err) {
        console.error("Erro ao restaurar backup:", err);
        showToast("Falha ao recuperar backup J.SOM. O arquivo está corrompido ou em formato inválido.", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = () => {
    if (window.confirm("Deseja realmente sair da sessão do Sistema de Gestão de Frota?")) {
      showToast("Sessão finalizada.", "info");
      window.location.reload();
    }
  };

  // Checklist Handlers
  const handleSaveChecklist = async (chk: Checklist) => {
    let updatedChecklists: Checklist[];
    const index = checklists.findIndex((c) => c.id === chk.id);
    if (index >= 0) {
      updatedChecklists = [...checklists];
      updatedChecklists[index] = chk;
    } else {
      updatedChecklists = [chk, ...checklists];
    }
    setChecklists(updatedChecklists);

    const updatedViaturas = viaturas.map((v) => {
      if (
        v.prefixo.replace(/\s+/g, "") === chk.prefixo.replace(/\s+/g, "") ||
        v.placa.replace(/\s+/g, "") === chk.placa.replace(/\s+/g, "")
      ) {
        return {
          ...v,
          status: "indisponivel" as const,
          kmAtual: Math.max(v.kmAtual, chk.kmInicial),
        };
      }
      return v;
    });
    setViaturas(updatedViaturas);

    let updatedCargas = [...cargas];
    const existingCargaIndex = updatedCargas.findIndex((c) => c.id === `crg-from-${chk.id}`);
    const novaCarga: CargaViatura = {
      id: existingCargaIndex >= 0 ? updatedCargas[existingCargaIndex].id : `crg-from-${chk.id}`,
      dataCarga: chk.dataCarga,
      nomeMotorista: chk.nomeCondutor,
      matricula: chk.matricula,
      prefixo: chk.prefixo,
      placa: chk.placa,
      horaCarga: chk.horaCarga,
      kmInicial: chk.kmInicial,
      dataDescarga: existingCargaIndex >= 0 ? updatedCargas[existingCargaIndex].dataDescarga : "",
      horaDescarga: existingCargaIndex >= 0 ? updatedCargas[existingCargaIndex].horaDescarga : "",
      kmFinal: existingCargaIndex >= 0 ? updatedCargas[existingCargaIndex].kmFinal : null,
      kmRodado: existingCargaIndex >= 0 ? updatedCargas[existingCargaIndex].kmRodado : 0,
      uop: chk.uop,
      turno: chk.turnoServico,
    };

    if (existingCargaIndex >= 0) {
      updatedCargas[existingCargaIndex] = novaCarga;
    } else {
      updatedCargas = [novaCarga, ...updatedCargas];
    }
    setCargas(updatedCargas);

    await persistState({
      checklists: updatedChecklists,
      viaturas: updatedViaturas,
      cargas: updatedCargas,
    });

    setEditingChecklist(null);

    // If submitted via QR Code, show dedicated lock confirmation screen
    if (isQrCodeSession) {
      setQrCodeConfirmation({
        prefixo: chk.prefixo,
        placa: chk.placa,
        tipo: chk.tipoViatura === "4 rodas" ? "Viatura 4 Rodas (Carro)" : "Viatura 2 Rodas (Motocicleta)",
        dataHora: `${chk.dataCarga} às ${chk.horaCarga}`,
      });
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {}
      showToast(`Checklist da viatura ${chk.prefixo} enviado com sucesso!`);
      return;
    }

    setCurrentTab("relatorios");
    showToast(`Checklist do prefixo ${chk.prefixo} salvo! Viatura lançada em Carga e marcada como Indisponível no Dashboard.`);
  };

  const handleDeleteChecklist = async (id: string) => {
    const updated = checklists.filter((c) => c.id !== id);
    setChecklists(updated);
    await persistState({ checklists: updated });
    showToast("Vistoria excluída. O registro na Carga de Viaturas foi preservado.", "info");
  };

  const handleEditChecklist = (chk: Checklist) => {
    setEditingChecklist(chk);
    if (chk.tipoViatura === "4 rodas") {
      setCurrentTab("checklist-carro");
    } else {
      setCurrentTab("checklist-moto");
    }
  };

  // Carga Viaturas Handlers
  const handleUpdateCarga = async (carga: CargaViatura) => {
    const updated = cargas.map((c) => (c.id === carga.id ? carga : c));
    setCargas(updated);

    let updatedViaturas = viaturas;
    if (carga.kmFinal !== null && carga.kmFinal !== undefined) {
      updatedViaturas = viaturas.map((v) => {
        if (
          v.prefixo.replace(/\s+/g, "") === carga.prefixo.replace(/\s+/g, "") ||
          v.placa.replace(/\s+/g, "") === carga.placa.replace(/\s+/g, "")
        ) {
          return {
            ...v,
            status: "disponivel" as const,
            kmAtual: Math.max(v.kmAtual, carga.kmFinal || 0),
          };
        }
        return v;
      });
      setViaturas(updatedViaturas);
    }

    await persistState({ cargas: updated, viaturas: updatedViaturas });
    showToast(
      carga.kmFinal
        ? `Descarga registrada com sucesso! ${carga.kmRodado} KM percorridos. Viatura ${carga.prefixo} retornou ao status DISPONÍVEL.`
        : `Carga da viatura ${carga.prefixo} atualizada.`
    );
  };

  const handleDeleteCarga = async (id: string) => {
    const updated = cargas.filter((c) => c.id !== id);
    setCargas(updated);
    await persistState({ cargas: updated });
    showToast("Registro de carga excluído com sucesso.");
  };

  const handleAddManualCarga = async (carga: CargaViatura) => {
    const updated = [carga, ...cargas];
    setCargas(updated);

    const updatedViaturas = viaturas.map((v) => {
      if (
        (v.prefixo === carga.prefixo || v.placa === carga.placa) &&
        carga.kmFinal === null
      ) {
        return {
          ...v,
          status: "indisponivel" as const,
          kmAtual: Math.max(v.kmAtual, carga.kmInicial),
        };
      }
      return v;
    });
    setViaturas(updatedViaturas);

    await persistState({ cargas: updated, viaturas: updatedViaturas });
    showToast(`Carga avulsa da viatura ${carga.prefixo} cadastrada com sucesso!`);
  };

  // Gastos Handlers
  const handleAddGasto = async (g: GastoManutencao) => {
    const updated = [g, ...gastos];
    setGastos(updated);
    await persistState({ gastos: updated });
    showToast("Gasto com manutenção cadastrado com sucesso.");
  };

  const handleUpdateGasto = async (g: GastoManutencao) => {
    const updated = gastos.map((item) => (item.id === g.id ? g : item));
    setGastos(updated);
    await persistState({ gastos: updated });
    showToast("Registro de gasto atualizado.");
  };

  const handleDeleteGasto = async (id: string) => {
    const updated = gastos.filter((item) => item.id !== id);
    setGastos(updated);
    await persistState({ gastos: updated });
    showToast("Registro de gasto excluído.");
  };

  // Revisões Handlers
  const handleAddRevisao = async (r: RevisaoViatura) => {
    const updated = [r, ...revisoes];
    setRevisoes(updated);
    await persistState({ revisoes: updated });
    showToast("Revisão agendada com sucesso.");
  };

  const handleUpdateRevisao = async (r: RevisaoViatura) => {
    const updated = revisoes.map((item) => (item.id === r.id ? r : item));
    setRevisoes(updated);
    await persistState({ revisoes: updated });
    showToast("Revisão atualizada com sucesso.");
  };

  const handleDeleteRevisao = async (id: string) => {
    const updated = revisoes.filter((item) => item.id !== id);
    setRevisoes(updated);
    await persistState({ revisoes: updated });
    showToast("Revisão excluída.");
  };

  // Manutenções Handlers
  const handleAddManutencao = async (m: RegistroManutencao) => {
    const updated = [m, ...manutencoes];
    setManutencoes(updated);
    await persistState({ manutencoes: updated });
    showToast(`Ordem de Manutenção ${m.ordemServico} cadastrada com sucesso!`);
  };

  const handleUpdateManutencao = async (m: RegistroManutencao) => {
    const updated = manutencoes.map((item) => (item.id === m.id ? m : item));
    setManutencoes(updated);
    await persistState({ manutencoes: updated });
    showToast(`Manutenção ${m.ordemServico} atualizada.`);
  };

  const handleDeleteManutencao = async (id: string) => {
    const updated = manutencoes.filter((item) => item.id !== id);
    setManutencoes(updated);
    await persistState({ manutencoes: updated });
    showToast("Manutenção excluída com sucesso.");
  };

  // Higienizações Handlers
  const handleAddHigienizacao = async (h: RegistroHigienizacao) => {
    const updated = [h, ...higienizacoes];
    setHigienizacoes(updated);
    await persistState({ higienizacoes: updated });
    showToast(`Higienização da viatura ${h.prefixo} registrada com sucesso!`);
  };

  const handleUpdateHigienizacao = async (h: RegistroHigienizacao) => {
    const updated = higienizacoes.map((item) => (item.id === h.id ? h : item));
    setHigienizacoes(updated);
    await persistState({ higienizacoes: updated });
    showToast(`Higienização da viatura ${h.prefixo} atualizada.`);
  };

  const handleDeleteHigienizacao = async (id: string) => {
    const updated = higienizacoes.filter((item) => item.id !== id);
    setHigienizacoes(updated);
    await persistState({ higienizacoes: updated });
    showToast("Higienização excluída com sucesso.");
  };

  // Inventário Handlers
  const handleAddInventario = async (item: ItemInventario) => {
    const updated = [item, ...inventario];
    setInventario(updated);
    await persistState({ inventario: updated });
    showToast("Item patrimonial cadastrado no inventário.");
  };

  const handleUpdateInventario = async (item: ItemInventario) => {
    const updated = inventario.map((i) => (i.id === item.id ? item : i));
    setInventario(updated);
    await persistState({ inventario: updated });
    showToast("Item de inventário atualizado.");
  };

  const handleDeleteInventario = async (id: string) => {
    const updated = inventario.filter((i) => i.id !== id);
    setInventario(updated);
    await persistState({ inventario: updated });
    showToast("Item excluído do inventário.");
  };

  // Pneus Handlers
  const handleAddPneu = async (p: RegistroPneu) => {
    const updated = [p, ...pneus];
    setPneus(updated);
    await persistState({ pneus: updated });
    showToast("Registro de pneu adicionado com sucesso.");
  };

  const handleUpdatePneu = async (p: RegistroPneu) => {
    const updated = pneus.map((item) => (item.id === p.id ? p : item));
    setPneus(updated);
    await persistState({ pneus: updated });
    showToast("Registro de pneu atualizado.");
  };

  const handleDeletePneu = async (id: string) => {
    const updated = pneus.filter((item) => item.id !== id);
    setPneus(updated);
    await persistState({ pneus: updated });
    showToast("Registro de pneu excluído.");
  };

  // Viaturas Handlers
  const handleAddViatura = async (v: Viatura) => {
    const updated = [v, ...viaturas];
    setViaturas(updated);
    await persistState({ viaturas: updated });
    showToast(`Viatura ${v.prefixo} (${v.placa}) adicionada com sucesso.`);
  };

  const handleUpdateViatura = async (v: Viatura) => {
    const updated = viaturas.map((item) => (item.id === v.id ? v : item));
    setViaturas(updated);
    await persistState({ viaturas: updated });
    showToast(`Viatura ${v.prefixo} atualizada.`);
  };

  const handleDeleteViatura = async (id: string) => {
    const updated = viaturas.filter((item) => item.id !== id);
    setViaturas(updated);
    await persistState({ viaturas: updated });
    showToast("Viatura excluída da frota.");
  };

  // Usuários Handlers
  const handleAddUsuario = async (u: Usuario) => {
    const updated = [u, ...usuarios];
    setUsuarios(updated);
    await persistState({ usuarios: updated });
    showToast(`Usuário ${u.nome} cadastrado.`);
  };

  const handleUpdateUsuario = async (u: Usuario) => {
    const updated = usuarios.map((item) => (item.id === u.id ? u : item));
    setUsuarios(updated);
    await persistState({ usuarios: updated });
    showToast(`Usuário ${u.nome} atualizado.`);
  };

  const handleDeleteUsuario = async (id: string) => {
    const updated = usuarios.filter((item) => item.id !== id);
    setUsuarios(updated);
    await persistState({ usuarios: updated });
    showToast("Usuário excluído.");
  };

  // Batch Excel Import Handlers
  const handleImportChecklists = async (imported: Checklist[]) => {
    if (imported.length === 0) return;
    const existingIds = new Set(checklists.map((c) => c.id));
    const toAdd = imported.filter((c) => !existingIds.has(c.id));
    const toUpdateMap = new Map(imported.map((c) => [c.id, c]));
    const updated = [
      ...toAdd,
      ...checklists.map((c) => toUpdateMap.get(c.id) || c),
    ];
    setChecklists(updated);
    await persistState({ checklists: updated });
    showToast(`${imported.length} vistorias importadas/atualizadas com sucesso!`);
  };

  const handleImportCargas = async (imported: CargaViatura[]) => {
    if (imported.length === 0) return;
    const existingIds = new Set(cargas.map((c) => c.id));
    const toAdd = imported.filter((c) => !existingIds.has(c.id));
    const toUpdateMap = new Map(imported.map((c) => [c.id, c]));
    const updated = [
      ...toAdd,
      ...cargas.map((c) => toUpdateMap.get(c.id) || c),
    ];
    setCargas(updated);
    await persistState({ cargas: updated });
    showToast(`${imported.length} cargas de viaturas importadas com sucesso!`);
  };

  const handleImportViaturas = async (imported: Viatura[]) => {
    if (imported.length === 0) return;
    const existingIds = new Set(viaturas.map((v) => v.id));
    const existingPrefixos = new Set(viaturas.map((v) => v.prefixo.trim().toUpperCase()));
    const toAdd: Viatura[] = [];
    const toUpdateMap = new Map<string, Viatura>();

    imported.forEach((v) => {
      if (existingIds.has(v.id) || existingPrefixos.has(v.prefixo.trim().toUpperCase())) {
        toUpdateMap.set(v.id, v);
      } else {
        toAdd.push(v);
      }
    });

    const updated = [
      ...toAdd,
      ...viaturas.map((v) => toUpdateMap.get(v.id) || v),
    ];
    setViaturas(updated);
    await persistState({ viaturas: updated });
    showToast(`${imported.length} viaturas importadas/atualizadas com sucesso!`);
  };

  const handleImportRevisoes = async (imported: RevisaoViatura[]) => {
    if (imported.length === 0) return;
    const existingIds = new Set(revisoes.map((r) => r.id));
    const toAdd = imported.filter((r) => !existingIds.has(r.id));
    const toUpdateMap = new Map(imported.map((r) => [r.id, r]));
    const updated = [
      ...toAdd,
      ...revisoes.map((r) => toUpdateMap.get(r.id) || r),
    ];
    setRevisoes(updated);
    await persistState({ revisoes: updated });
    showToast(`${imported.length} revisões importadas com sucesso!`);
  };

  const handleImportManutencoes = async (imported: RegistroManutencao[]) => {
    if (imported.length === 0) return;
    const existingIds = new Set(manutencoes.map((m) => m.id));
    const toAdd = imported.filter((m) => !existingIds.has(m.id));
    const toUpdateMap = new Map(imported.map((m) => [m.id, m]));
    const updated = [
      ...toAdd,
      ...manutencoes.map((m) => toUpdateMap.get(m.id) || m),
    ];
    setManutencoes(updated);
    await persistState({ manutencoes: updated });
    showToast(`${imported.length} manutenções importadas com sucesso!`);
  };

  const handleImportGastos = async (imported: GastoManutencao[]) => {
    if (imported.length === 0) return;
    const existingIds = new Set(gastos.map((g) => g.id));
    const toAdd = imported.filter((g) => !existingIds.has(g.id));
    const toUpdateMap = new Map(imported.map((g) => [g.id, g]));
    const updated = [
      ...toAdd,
      ...gastos.map((g) => toUpdateMap.get(g.id) || g),
    ];
    setGastos(updated);
    await persistState({ gastos: updated });
    showToast(`${imported.length} registros de gastos importados com sucesso!`);
  };

  const handleImportHigienizacoes = async (imported: RegistroHigienizacao[]) => {
    if (imported.length === 0) return;
    const existingIds = new Set(higienizacoes.map((h) => h.id));
    const toAdd = imported.filter((h) => !existingIds.has(h.id));
    const toUpdateMap = new Map(imported.map((h) => [h.id, h]));
    const updated = [
      ...toAdd,
      ...higienizacoes.map((h) => toUpdateMap.get(h.id) || h),
    ];
    setHigienizacoes(updated);
    await persistState({ higienizacoes: updated });
    showToast(`${imported.length} higienizações importadas com sucesso!`);
  };

  const handleImportPneus = async (imported: RegistroPneu[]) => {
    if (imported.length === 0) return;
    const existingIds = new Set(pneus.map((p) => p.id));
    const toAdd = imported.filter((p) => !existingIds.has(p.id));
    const toUpdateMap = new Map(imported.map((p) => [p.id, p]));
    const updated = [
      ...toAdd,
      ...pneus.map((p) => toUpdateMap.get(p.id) || p),
    ];
    setPneus(updated);
    await persistState({ pneus: updated });
    showToast(`${imported.length} pneus importados com sucesso!`);
  };

  const handleImportInventario = async (imported: ItemInventario[]) => {
    if (imported.length === 0) return;
    const existingIds = new Set(inventario.map((i) => i.id));
    const toAdd = imported.filter((i) => !existingIds.has(i.id));
    const toUpdateMap = new Map(imported.map((i) => [i.id, i]));
    const updated = [
      ...toAdd,
      ...inventario.map((i) => toUpdateMap.get(i.id) || i),
    ];
    setInventario(updated);
    await persistState({ inventario: updated });
    showToast(`${imported.length} itens de inventário importados com sucesso!`);
  };

  const handleImportUsuarios = async (imported: Usuario[]) => {
    if (imported.length === 0) return;
    const existingIds = new Set(usuarios.map((u) => u.id));
    const toAdd = imported.filter((u) => !existingIds.has(u.id));
    const toUpdateMap = new Map(imported.map((u) => [u.id, u]));
    const updated = [
      ...toAdd,
      ...usuarios.map((u) => toUpdateMap.get(u.id) || u),
    ];
    setUsuarios(updated);
    await persistState({ usuarios: updated });
    showToast(`${imported.length} usuários/policiais importados com sucesso!`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Superior Fixo com Relógio em Tempo Real e Indicadores */}
      <HeaderApp
        onToggleMenu={() => setMenuOpen(!menuOpen)}
        isMenuOpen={menuOpen}
        syncStatus={syncStatus}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
        availableUsers={usuarios}
        isOnline={isOnline}
        onManualSync={fetchServerData}
        config={config}
        onOpenConfig={() => setIsConfigModalOpen(true)}
        onOpenDownloadApp={() => setIsDownloadModalOpen(true)}
      />

      {/* Main Layout: Menu Lateral (Dark/Black) + Content (Light) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Menu Lateral em Preto Predominante com Letras Brancas */}
        <MenuLateral
          currentTab={currentTab}
          activeTab={currentTab}
          userRole={currentUser.perfil}
          currentUser={currentUser}
          availableUsers={usuarios}
          onSelectUser={(u) => {
            setCurrentUser(u);
            showToast(`Militar alterado para ${u.cargoPosto} ${u.nome}`);
          }}
          onSelectTab={(tab) => {
            if (tab !== "checklist-carro" && tab !== "checklist-moto") {
              setEditingChecklist(null);
            }
            setCurrentTab(tab);
          }}
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          totalChecklists={checklists.length}
          totalViaturasIndisponiveis={viaturas.filter((v) => v.status === "indisponivel").length}
          totalViaturasBaixadas={viaturas.filter((v) => v.status === "baixada").length}
          config={config}
          onOpenConfig={() => setIsConfigModalOpen(true)}
          onOpenDownloadApp={() => setIsDownloadModalOpen(true)}
          onBackupJson={handleBackupJson}
          onRestoreJson={handleRestoreJson}
          onLogout={handleLogout}
        />

        {/* Content Area in Clean Light Theme */}
        <main className="flex-1 overflow-y-auto bg-slate-100 text-slate-800 relative focus:outline-none">
          {/* Toast Notification */}
          {notification && (
            <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white border border-emerald-500 rounded-xl p-3 shadow-xl text-slate-800 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="text-xs font-semibold">{notification.message}</span>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-slate-400 hover:text-slate-800 text-xs font-bold px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* QR Code Submission Final Screen (Closed session) */}
          {qrCodeConfirmation ? (
            <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
              <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Header Preto com letras brancas */}
                <div className="bg-black text-white p-6 border-b border-neutral-800 text-center relative">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-3">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-wider text-white">
                    Checklist Enviado com Sucesso!
                  </h2>
                  <p className="text-xs text-neutral-300 font-medium mt-1">
                    {config?.unidade || "19ª CIPM / PARIPE"} • Sistema de Gestão de Frotas
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-semibold">Prefixo da Viatura:</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        {formatPrefixo(qrCodeConfirmation.prefixo)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-semibold">Placa:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {formatPlaca(qrCodeConfirmation.placa)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500 font-semibold">Categoria:</span>
                      <span className="font-semibold text-slate-800">
                        {qrCodeConfirmation.tipo}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 font-semibold">Data / Hora do Envio:</span>
                      <span className="font-mono text-slate-700">
                        {qrCodeConfirmation.dataHora}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-amber-900">
                      <p className="font-bold uppercase tracking-wide">Sessão Encerrada com Sucesso</p>
                      <p className="mt-1 leading-relaxed">
                        Os dados do checklist foram gravados no servidor e na carga de viaturas.
                        Por segurança, esta tela foi finalizada e não permite novos envios na mesma sessão.
                      </p>
                      <p className="mt-2 font-semibold text-slate-800">
                        Para preencher um novo checklist, é necessário fazer uma nova leitura do QR Code.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setQrCodeConfirmation(null);
                        setIsQrCodeSession(false);
                        setCurrentTab("dashboard");
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
                    >
                      <span>Ir para o Sistema Principal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Views Routing */}
              {currentTab === "dashboard" && (
                <DashboardView
                  viaturas={viaturas}
                  checklists={checklists}
                  cargas={cargas}
                  revisoes={revisoes}
                  gastos={gastos}
                  onNavigateTab={(tab) => {
                    setEditingChecklist(null);
                    setCurrentTab(tab);
                  }}
                  config={config}
                />
              )}

              {currentTab === "checklist-carro" && (
                <ChecklistCarroView
                  onSave={handleSaveChecklist}
                  onCancel={() => {
                    setEditingChecklist(null);
                    setCurrentTab("relatorios");
                  }}
                  currentUser={currentUser}
                  existingChecklist={editingChecklist}
                  diagramaCarroUrl={config?.diagramaCarroUrl}
                  config={config}
                />
              )}

              {currentTab === "checklist-moto" && (
                <ChecklistMotoView
                  onSave={handleSaveChecklist}
                  onCancel={() => {
                    setEditingChecklist(null);
                    setCurrentTab("relatorios");
                  }}
                  currentUser={currentUser}
                  existingChecklist={editingChecklist}
                  diagramaMotoUrl={config?.diagramaMotoUrl}
                  config={config}
                />
              )}

              {currentTab === "carga-viaturas" && (
                <CargaViaturasView
                  cargas={cargas}
                  onUpdateCarga={handleUpdateCarga}
                  onDeleteCarga={handleDeleteCarga}
                  onAddManualCarga={handleAddManualCarga}
                  onImportCargas={handleImportCargas}
                  config={config}
                />
              )}

              {currentTab === "controle-estoque" && (
                <InventarioMateriaisView
                  inventario={inventario}
                  onAddItem={handleAddInventario}
                  onUpdateItem={handleUpdateInventario}
                  onDeleteItem={handleDeleteInventario}
                  onImportInventario={handleImportInventario}
                  config={config}
                />
              )}

              {currentTab === "controle-revisoes" && (
                <ControleRevisoesView
                  revisoes={revisoes}
                  onAddRevisao={handleAddRevisao}
                  onUpdateRevisao={handleUpdateRevisao}
                  onDeleteRevisao={handleDeleteRevisao}
                  onImportRevisoes={handleImportRevisoes}
                  config={config}
                />
              )}

              {currentTab === "manutencoes" && (
                <ManutencoesView
                  manutencoes={manutencoes}
                  viaturas={viaturas}
                  onAddManutencao={handleAddManutencao}
                  onUpdateManutencao={handleUpdateManutencao}
                  onDeleteManutencao={handleDeleteManutencao}
                  onImportManutencoes={handleImportManutencoes}
                  config={config}
                />
              )}

              {currentTab === "higienizacoes" && (
                <HigienizacoesView
                  higienizacoes={higienizacoes}
                  viaturas={viaturas}
                  onAddHigienizacao={handleAddHigienizacao}
                  onUpdateHigienizacao={handleUpdateHigienizacao}
                  onDeleteHigienizacao={handleDeleteHigienizacao}
                  onImportHigienizacoes={handleImportHigienizacoes}
                  config={config}
                />
              )}

              {currentTab === "relatorios" && (
                <RelatoriosVistoriaView
                  checklists={checklists}
                  onEditChecklist={handleEditChecklist}
                  onDeleteChecklist={handleDeleteChecklist}
                  onEmailChecklist={(chk) => setEmailModalChecklist(chk)}
                  onImportChecklists={handleImportChecklists}
                  config={config}
                />
              )}

              {currentTab === "gastos-manutencao" && (
                <GastosManutencaoView
                  gastos={gastos}
                  onAddGasto={handleAddGasto}
                  onUpdateGasto={handleUpdateGasto}
                  onDeleteGasto={handleDeleteGasto}
                  onImportGastos={handleImportGastos}
                  config={config}
                />
              )}

              {currentTab === "cadastro-viaturas" && (
                <GerenciamentoViaturasView
                  viaturas={viaturas}
                  onAddViatura={handleAddViatura}
                  onUpdateViatura={handleUpdateViatura}
                  onDeleteViatura={handleDeleteViatura}
                  onImportViaturas={handleImportViaturas}
                  config={config}
                />
              )}

              {currentTab === "viaturas-baixadas" && (
                <ViaturasBaixadasView
                  viaturas={viaturas}
                  onUpdateViatura={handleUpdateViatura}
                  onImportViaturas={handleImportViaturas}
                  config={config}
                />
              )}

              {currentTab === "controle-pneus" && (
                <ControlePneusView
                  pneus={pneus}
                  onAddPneu={handleAddPneu}
                  onUpdatePneu={handleUpdatePneu}
                  onDeletePneu={handleDeletePneu}
                  onImportPneus={handleImportPneus}
                  config={config}
                />
              )}

              {currentTab === "gestao-motoristas" && (
                <GerenciamentoUsuariosView
                  usuarios={usuarios}
                  onAddUsuario={handleAddUsuario}
                  onUpdateUsuario={handleUpdateUsuario}
                  onDeleteUsuario={handleDeleteUsuario}
                  onImportUsuarios={handleImportUsuarios}
                  config={config}
                />
              )}

              {currentTab === "gerar-qrcode" && (
                <GerarQrCodeView
                  viaturas={viaturas}
                  config={config}
                  onNavigateToChecklist={(tipo) => {
                    setCurrentTab(tipo === "carro" ? "checklist-carro" : "checklist-moto");
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Email Modal */}
      {emailModalChecklist && (
        <EmailModal
          checklist={emailModalChecklist}
          onClose={() => setEmailModalChecklist(null)}
          config={config}
        />
      )}

      {/* Custom Header, Crests & Diagrams Configuration Modal */}
      <ModalConfiguracaoCabecalho
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      {/* Download Desktop App (.exe) & Standalone Offline HTML Modal */}
      <ModalDownloadApp
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        config={config}
      />
    </div>
  );
}
