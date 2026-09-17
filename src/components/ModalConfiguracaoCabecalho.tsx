import React, { useState } from "react";
import {
  X,
  Settings,
  Image,
  Upload,
  RotateCcw,
  Check,
  Shield,
  FileText,
  Mail,
  Phone,
  Building,
  Car,
  Bike,
  Sparkles
} from "lucide-react";
import { ConfigSistema } from "../types";
import { DEFAULT_CONFIG } from "../constants";
import { Brasao19CIPM, BrasaoPMBA } from "./Brasoes";

interface ModalConfiguracaoCabecalhoProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConfigSistema;
  onSaveConfig: (newConfig: ConfigSistema) => void;
}

export const ModalConfiguracaoCabecalho: React.FC<ModalConfiguracaoCabecalhoProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<ConfigSistema>({
    ...DEFAULT_CONFIG,
    ...config,
  });

  const [activeTab, setActiveTab] = useState<"textos" | "brasoes" | "diagramas">("textos");
  const [salvoSucesso, setSalvoSucesso] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof ConfigSistema
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem selecionada é muito grande. Escolha uma imagem de até 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({
          ...prev,
          [field]: reader.result,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSalvoSucesso(true);
    setTimeout(() => {
      setSalvoSucesso(false);
      onClose();
    }, 900);
  };

  const handleResetToDefault = () => {
    if (window.confirm("Deseja restaurar todas as configurações de cabeçalho, brasões e diagramas para o padrão oficial da 19ª CIPM?")) {
      setFormData({ ...DEFAULT_CONFIG });
    }
  };

  return (
    <div
      id="modal-configuracao-cabecalho-backdrop"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        id="modal-configuracao-container"
        className="bg-white border border-slate-300 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-slate-800 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header (Cabeçalho Fundo Preto) */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-black text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-900 text-white rounded-xl border border-neutral-700 shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Personalização de Cabeçalhos, Brasões e Diagramas
              </h3>
              <p className="text-xs text-neutral-300">
                Edite os textos, dados da unidade, brasões, ícone e diagramas do aplicativo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Miniature Header Preview */}
        <div className="px-4 py-3 bg-slate-100 border-b border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pré-visualização do Cabeçalho em Tempo Real</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Left Crest / Icon */}
              <div className="shrink-0 w-11 h-11 flex items-center justify-center">
                {formData.brasaoEsquerdaUrl ? (
                  <img
                    src={formData.brasaoEsquerdaUrl}
                    alt="Brasão Unidade"
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 object-contain drop-shadow-xs"
                  />
                ) : (
                  <Brasao19CIPM className="w-11 h-11" />
                )}
              </div>

              {/* System icon if configured */}
              {formData.iconeSistemaUrl && (
                <div className="shrink-0 w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                  <img
                    src={formData.iconeSistemaUrl}
                    alt="Ícone do Sistema"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <div className="text-xs sm:text-sm font-extrabold uppercase text-slate-900 tracking-tight">
                  {formData.systemTitle || "SISTEMA DE GESTÃO DE FROTA"}
                </div>
                <div className="text-[11px] font-semibold text-blue-700 tracking-wide">
                  {formData.orgaoSuperior || "POLÍCIA MILITAR DA BAHIA"} • {formData.comandoRegional || "CPRC-BTS"}
                </div>
                <div className="text-[10px] text-slate-500">
                  {formData.subTitle || "19ª CIPM / PARIPE"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-[11px] font-bold text-slate-700">{formData.unidade}</div>
                <div className="text-[10px] text-slate-500">{formData.cidade}</div>
              </div>
              <div className="shrink-0 w-10 h-10 flex items-center justify-center">
                {formData.brasaoDireitaUrl ? (
                  <img
                    src={formData.brasaoDireitaUrl}
                    alt="Brasão PMBA"
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-contain drop-shadow-xs"
                  />
                ) : (
                  <BrasaoPMBA className="w-10 h-10" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("textos")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 flex items-center gap-2 ${
              activeTab === "textos"
                ? "bg-white text-blue-700 border-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Dados & Textos do Cabeçalho</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("brasoes")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 flex items-center gap-2 ${
              activeTab === "brasoes"
                ? "bg-white text-blue-700 border-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Brasões & Ícone do Sistema</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("diagramas")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg transition border-b-2 flex items-center gap-2 ${
              activeTab === "diagramas"
                ? "bg-white text-blue-700 border-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900 border-transparent"
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Diagramas de Viatura (Carro & Moto)</span>
          </button>
        </div>

        {/* Tab Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === "textos" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Título Principal do Sistema
                </label>
                <input
                  type="text"
                  value={formData.systemTitle}
                  onChange={(e) => setFormData({ ...formData, systemTitle: e.target.value })}
                  placeholder="Ex: SISTEMA DE GESTÃO DE FROTA"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden font-semibold"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subtítulo / Lema da Unidade
                </label>
                <input
                  type="text"
                  value={formData.subTitle}
                  onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                  placeholder="Ex: 19ª CIPM / PARIPE • O GUARDIÃO DO SUBÚRBIO"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Órgão Superior / Corporação
                </label>
                <input
                  type="text"
                  value={formData.orgaoSuperior || ""}
                  onChange={(e) => setFormData({ ...formData, orgaoSuperior: e.target.value })}
                  placeholder="Ex: POLÍCIA MILITAR DA BAHIA"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Comando Regional / CPR
                </label>
                <input
                  type="text"
                  value={formData.comandoRegional || ""}
                  onChange={(e) => setFormData({ ...formData, comandoRegional: e.target.value })}
                  placeholder="Ex: CPRC-BTS"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Unidade Operacional (UOp Padrão)
                </label>
                <input
                  type="text"
                  value={formData.unidade}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                  placeholder="Ex: 19ª CIPM"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Cidade / Estado
                </label>
                <input
                  type="text"
                  value={formData.cidade || ""}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="Ex: Salvador - BA"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  E-mail de Destino para Relatórios
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={formData.emailDestino}
                    onChange={(e) => setFormData({ ...formData, emailDestino: e.target.value })}
                    placeholder="frotas19cipm@pm.ba.gov.br"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Telefone / Plantão da Frota
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.telefonePlantao || ""}
                    onChange={(e) => setFormData({ ...formData, telefonePlantao: e.target.value })}
                    placeholder="(71) 3117-2100"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Texto do Rodapé do Sistema
                </label>
                <input
                  type="text"
                  value={formData.rodapeTexto || ""}
                  onChange={(e) => setFormData({ ...formData, rodapeTexto: e.target.value })}
                  placeholder="Ex: 19ª CIPM • PARIPE • Versão 2.4 Online/Offline"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden"
                />
              </div>
            </div>
          )}

          {activeTab === "brasoes" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Ícone Principal do Sistema (Imagem 4) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center">
                <div className="text-xs font-bold text-slate-800 uppercase mb-1">
                  Ícone do Sistema (Imagem 4)
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Exibido no cabeçalho e no menu lateral
                </p>

                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden mb-3 shadow-xs">
                  {formData.iconeSistemaUrl ? (
                    <img
                      src={formData.iconeSistemaUrl}
                      alt="Ícone Sistema"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-8 h-8 text-slate-300" />
                  )}
                </div>

                <label className="w-full cursor-pointer py-1.5 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition mb-2">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Escolher Imagem</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "iconeSistemaUrl")}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      iconeSistemaUrl: "/assets/icone_frota_19cipm.jpg",
                    }))
                  }
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Restaurar Ícone 19ª CIPM
                </button>
              </div>

              {/* Brasão Esquerdo (19ª CIPM / Unidade) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center">
                <div className="text-xs font-bold text-slate-800 uppercase mb-1">
                  Brasão da Unidade (Esquerda)
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Exibido no topo à esquerda e relatórios A4
                </p>

                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden mb-3 shadow-xs p-1">
                  {formData.brasaoEsquerdaUrl ? (
                    <img
                      src={formData.brasaoEsquerdaUrl}
                      alt="Brasão Unidade"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Brasao19CIPM className="w-20 h-20" />
                  )}
                </div>

                <label className="w-full cursor-pointer py-1.5 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition mb-2">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Substituir Brasão</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "brasaoEsquerdaUrl")}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      brasaoEsquerdaUrl: "",
                    }))
                  }
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Restaurar Brasão Oficial SVG
                </button>
              </div>

              {/* Brasão Direito (PMBA) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center text-center">
                <div className="text-xs font-bold text-slate-800 uppercase mb-1">
                  Brasão Corporação (Direita)
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Exibido no topo à direita e relatórios A4
                </p>

                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden mb-3 shadow-xs p-1">
                  {formData.brasaoDireitaUrl ? (
                    <img
                      src={formData.brasaoDireitaUrl}
                      alt="Brasão PMBA"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <BrasaoPMBA className="w-20 h-20" />
                  )}
                </div>

                <label className="w-full cursor-pointer py-1.5 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition mb-2">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Substituir Brasão</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "brasaoDireitaUrl")}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      brasaoDireitaUrl: "",
                    }))
                  }
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Restaurar Brasão PMBA SVG
                </button>
              </div>
            </div>
          )}

          {activeTab === "diagramas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Diagrama de Carro (Imagem 1) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="w-4 h-4 text-blue-700" />
                  <div className="text-xs font-bold text-slate-900 uppercase">
                    Diagrama de Carro / 4 Rodas (Imagem 1)
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Imagem utilizada no checklist para marcar avarias (Duster 4 Vistas)
                </p>

                <div className="w-full h-44 bg-white rounded-xl border border-slate-300 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
                  {formData.diagramaCarroUrl ? (
                    <img
                      src={formData.diagramaCarroUrl}
                      alt="Diagrama Carro"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src="/assets/viatura_carro_duster.jpg"
                      alt="Diagrama Carro Padrão"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex-1 cursor-pointer py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carregar Nova Imagem de Carro</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "diagramaCarroUrl")}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        diagramaCarroUrl: "/assets/viatura_carro_duster.jpg",
                      }))
                    }
                    className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Imagem 1</span>
                  </button>
                </div>
              </div>

              {/* Diagrama de Moto (Imagem 2) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <Bike className="w-4 h-4 text-amber-600" />
                  <div className="text-xs font-bold text-slate-900 uppercase">
                    Diagrama de Moto / 2 Rodas (Imagem 2)
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Imagem utilizada no checklist para marcar avarias da motocicleta
                </p>

                <div className="w-full h-44 bg-white rounded-xl border border-slate-300 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
                  {formData.diagramaMotoUrl ? (
                    <img
                      src={formData.diagramaMotoUrl}
                      alt="Diagrama Moto"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src="/assets/viatura_moto_pmba.jpg"
                      alt="Diagrama Moto Padrão"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex-1 cursor-pointer py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carregar Nova Imagem de Moto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "diagramaMotoUrl")}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        diagramaMotoUrl: "/assets/viatura_moto_pmba.jpg",
                      }))
                    }
                    className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Imagem 2</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 transition py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Valores Padrão</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-salvar-configuracao"
                className={`flex-1 sm:flex-none px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-lg shadow-sm flex items-center justify-center gap-2 transition ${
                  salvoSucesso ? "bg-emerald-600" : "bg-blue-700 hover:bg-blue-800"
                }`}
              >
                {salvoSucesso ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Configurações Salvas!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
