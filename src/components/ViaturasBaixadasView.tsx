import React, { useState } from "react";
import {
  Archive,
  Search,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  Pencil,
  Trash2,
  Calendar,
  X,
  PlusCircle,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import { Viatura, ConfigSistema } from "../types";
import { formatPlaca, formatPrefixo, formatDateBR, exportToExcelStyled } from "../utils/formatters";
import { ImportExcelButton } from "./ImportExcelButton";
import { parseExcelToViaturas } from "../utils/excelParsers";
import { triggerPrintGeneric } from "../utils/printHelper";

interface ViaturasBaixadasViewProps {
  viaturas: Viatura[];
  onUpdateViatura: (v: Viatura) => void;
  onDeleteViatura?: (id: string) => void;
  onImportViaturas?: (viaturas: Viatura[]) => void;
  config?: ConfigSistema;
}

export const ViaturasBaixadasView: React.FC<ViaturasBaixadasViewProps> = ({
  viaturas,
  onUpdateViatura,
  onDeleteViatura,
  onImportViaturas,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showBaixarModal, setShowBaixarModal] = useState<boolean>(false);
  const [editingViatura, setEditingViatura] = useState<Viatura | null>(null);

  // Form State para Baixa ou Edição
  const [formData, setFormData] = useState({
    id: "",
    selectedViaturaId: "",
    numPatrimonio: "",
    dataBaixa: new Date().toISOString().split("T")[0],
    marca: "",
    modelo: "",
    placa: "",
    chassi: "",
    prefixo: "",
    responsavelEntrega: "",
    local: "Base 19ª CIPM - Paripe",
    responsavelRecebimento: "",
    motivoBaixa: "Desativação patrimonial / Leilão",
  });

  const baixadas = viaturas.filter((v) => v.status === "baixada");
  const ativas = viaturas.filter((v) => v.status !== "baixada");

  const filtered = baixadas.filter((v) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      (v.numPatrimonio && v.numPatrimonio.toLowerCase().includes(term)) ||
      (v.prefixo && v.prefixo.toLowerCase().includes(term)) ||
      (v.placa && v.placa.toLowerCase().includes(term)) ||
      (v.marca && v.marca.toLowerCase().includes(term)) ||
      (v.modelo && v.modelo.toLowerCase().includes(term)) ||
      (v.chassi && v.chassi.toLowerCase().includes(term)) ||
      (v.responsavelEntrega && v.responsavelEntrega.toLowerCase().includes(term)) ||
      (v.responsavelRecebimento && v.responsavelRecebimento.toLowerCase().includes(term)) ||
      (v.local && v.local.toLowerCase().includes(term))
    );
  });

  const handleOpenBaixarModal = () => {
    setEditingViatura(null);
    setFormData({
      id: "",
      selectedViaturaId: "",
      numPatrimonio: "",
      dataBaixa: new Date().toISOString().split("T")[0],
      marca: "",
      modelo: "",
      placa: "",
      chassi: "",
      prefixo: "",
      responsavelEntrega: "",
      local: "Base 19ª CIPM - Paripe",
      responsavelRecebimento: "",
      motivoBaixa: "Desativação patrimonial / Leilão",
    });
    setShowBaixarModal(true);
  };

  const handleOpenEditModal = (v: Viatura) => {
    setEditingViatura(v);
    setFormData({
      id: v.id,
      selectedViaturaId: v.id,
      numPatrimonio: v.numPatrimonio || "",
      dataBaixa: v.dataBaixa || new Date().toISOString().split("T")[0],
      marca: v.marca || "",
      modelo: v.modelo || "",
      placa: v.placa || "",
      chassi: v.chassi || "",
      prefixo: v.prefixo || "",
      responsavelEntrega: v.responsavelEntrega || "",
      local: v.local || "Base 19ª CIPM - Paripe",
      responsavelRecebimento: v.responsavelRecebimento || "",
      motivoBaixa: v.motivoBaixa || "Desativação patrimonial / Leilão",
    });
    setShowBaixarModal(true);
  };

  const handleSelectViaturaToBaixar = (id: string) => {
    const v = viaturas.find((item) => item.id === id);
    if (v) {
      setFormData((prev) => ({
        ...prev,
        selectedViaturaId: v.id,
        prefixo: v.prefixo,
        placa: v.placa,
        marca: v.marca || "",
        modelo: v.modelo || "",
        chassi: v.chassi || "",
        numPatrimonio: v.numPatrimonio || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedViaturaId: "",
      }));
    }
  };

  const handleSubmitBaixa = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prefixo.trim() && !formData.selectedViaturaId) {
      alert("Informe o prefixo ou selecione a viatura.");
      return;
    }

    const finalPlaca = formatPlaca(formData.placa);
    const finalPrefixo = formatPrefixo(formData.prefixo);

    if (editingViatura) {
      // Atualizando registro existente
      onUpdateViatura({
        ...editingViatura,
        numPatrimonio: formData.numPatrimonio.trim(),
        dataBaixa: formData.dataBaixa,
        marca: formData.marca.trim(),
        modelo: formData.modelo.trim(),
        placa: finalPlaca,
        chassi: formData.chassi.trim().toUpperCase(),
        prefixo: finalPrefixo,
        responsavelEntrega: formData.responsavelEntrega.trim(),
        local: formData.local.trim(),
        responsavelRecebimento: formData.responsavelRecebimento.trim(),
        motivoBaixa: formData.motivoBaixa.trim(),
        status: "baixada",
      });
    } else {
      // Nova baixa
      const existing = viaturas.find((v) => v.id === formData.selectedViaturaId);
      if (existing) {
        onUpdateViatura({
          ...existing,
          numPatrimonio: formData.numPatrimonio.trim() || existing.numPatrimonio,
          dataBaixa: formData.dataBaixa,
          marca: formData.marca.trim() || existing.marca,
          modelo: formData.modelo.trim() || existing.modelo,
          placa: finalPlaca || existing.placa,
          chassi: formData.chassi.trim().toUpperCase() || existing.chassi,
          prefixo: finalPrefixo || existing.prefixo,
          responsavelEntrega: formData.responsavelEntrega.trim(),
          local: formData.local.trim(),
          responsavelRecebimento: formData.responsavelRecebimento.trim(),
          motivoBaixa: formData.motivoBaixa.trim(),
          status: "baixada",
        });
      } else {
        // Viatura avulsa baixada
        const novaViatura: Viatura = {
          id: `bx-${Date.now()}`,
          prefixo: finalPrefixo,
          placa: finalPlaca,
          marca: formData.marca.trim(),
          modelo: formData.modelo.trim() || "Viatura Policial",
          ano: new Date().getFullYear().toString(),
          tipo: "4 rodas",
          uop: "19ª CIPM",
          status: "baixada",
          kmAtual: 0,
          dataBaixa: formData.dataBaixa,
          motivoBaixa: formData.motivoBaixa.trim(),
          numPatrimonio: formData.numPatrimonio.trim(),
          chassi: formData.chassi.trim().toUpperCase(),
          responsavelEntrega: formData.responsavelEntrega.trim(),
          local: formData.local.trim(),
          responsavelRecebimento: formData.responsavelRecebimento.trim(),
        };
        onUpdateViatura(novaViatura);
      }
    }

    setShowBaixarModal(false);
    setEditingViatura(null);
  };

  const handleReativar = (v: Viatura) => {
    if (
      window.confirm(
        `Deseja realmente reativar a viatura ${v.prefixo} (${v.placa}) para o serviço operacional ativo?`
      )
    ) {
      onUpdateViatura({
        ...v,
        status: "disponivel",
        motivoBaixa: undefined,
        dataBaixa: undefined,
      });
    }
  };

  const handleDelete = (v: Viatura) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir permanentemente o registro da viatura baixada ${v.prefixo} (${v.placa})?`
      )
    ) {
      if (onDeleteViatura) {
        onDeleteViatura(v.id);
      } else {
        onUpdateViatura({
          ...v,
          status: "disponivel",
          motivoBaixa: undefined,
          dataBaixa: undefined,
        });
      }
    }
  };

  const handleExportPlanilha = () => {
    if (baixadas.length === 0) {
      alert("Nenhuma viatura baixada para exportar.");
      return;
    }

    const headers = [
      "1-Nº PATRIMÔNIO",
      "2-DATA DA BAIXA",
      "3-MARCA",
      "4-MODELO",
      "5-PLACA",
      "6-CHASSI",
      "7-PREFIXO",
      "8-RESPONSÁVEL PELA ENTREGA",
      "9-LOCAL",
      "10-RESPONSÁVEL PELO RECEBIMENTO",
      "MOTIVO DA BAIXA",
    ];

    const rows = baixadas.map((v) => [
      v.numPatrimonio || "-",
      formatDateBR(v.dataBaixa),
      v.marca || "-",
      v.modelo,
      formatPlaca(v.placa),
      v.chassi || "-",
      formatPrefixo(v.prefixo),
      v.responsavelEntrega || "-",
      v.local || "-",
      v.responsavelRecebimento || "-",
      v.motivoBaixa || "-",
    ]);

    exportToExcelStyled({
      filename: `Viaturas_Baixadas_${config?.unidade ? config.unidade.replace(/\s+/g, "_") : "19CIPM"}_${new Date().toISOString().slice(0, 10)}.xls`,
      title: `HISTÓRICO DE VIATURAS BAIXADAS / DESATIVADAS - ${config?.unidade || "19ª CIPM/PARIPE"}`,
      headers,
      rows,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 text-slate-800">
      {/* Header Card (Cabeçalho com fundo preto e letras brancas) */}
      <div className="bg-black text-white border border-neutral-800 rounded-2xl p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-neutral-900 text-amber-400 border border-neutral-700">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Viaturas Baixadas / Desativadas
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 font-medium">
              {config?.unidade || "19ª CIPM"} • Histórico de veículos retirados de circulação, alienados ou leiloados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-exportar-viaturas-baixadas"
            onClick={handleExportPlanilha}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-xl transition cursor-pointer shadow-xs"
            title="Exportar planilha formatada com cabeçalho preto e letras brancas"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar Planilha</span>
          </button>

          <button
            type="button"
            id="btn-imprimir-viaturas-baixadas"
            onClick={() => triggerPrintGeneric()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-xl transition cursor-pointer shadow-xs"
            title="Imprimir relatório de viaturas baixadas"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Imprimir</span>
          </button>

          <ImportExcelButton
            buttonId="btn-importar-excel-viaturas-baixadas"
            onImport={async (rows) => {
              const parsed = parseExcelToViaturas(rows);
              // Assegura que o status é baixada
              const parsedBaixadas = parsed.map((v) => ({ ...v, status: "baixada" as const }));
              if (onImportViaturas) {
                onImportViaturas(parsedBaixadas);
              } else {
                parsedBaixadas.forEach((v) => onUpdateViatura(v));
              }
            }}
            title="Importar viaturas baixadas a partir de planilha Excel (.xlsx, .xls ou .csv)"
          />

          <button
            type="button"
            id="btn-dar-baixa-viatura"
            onClick={handleOpenBaixarModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition cursor-pointer shadow-xs"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Dar Baixa em Viatura</span>
          </button>
        </div>
      </div>

      {/* Barra de Busca e Métricas */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por patrimônio, prefixo, placa, marca, chassi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-600 focus:bg-white transition"
          />
        </div>
        <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
          <span>Total de Viaturas Baixadas:</span>
          <span className="font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            {baixadas.length}
          </span>
        </div>
      </div>

      {/* Tabela de Viaturas Baixadas com 10 Colunas na Sequência Solicitada + Ações */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black text-white font-bold border-b border-neutral-800 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">1 - Nº Patrimônio</th>
                <th className="py-3 px-3">2 - Data da Baixa</th>
                <th className="py-3 px-3">3 - Marca</th>
                <th className="py-3 px-3">4 - Modelo</th>
                <th className="py-3 px-3">5 - Placa</th>
                <th className="py-3 px-3">6 - Chassi</th>
                <th className="py-3 px-3">7 - Prefixo</th>
                <th className="py-3 px-3">8 - Resp. Entrega</th>
                <th className="py-3 px-3">9 - Local</th>
                <th className="py-3 px-3">10 - Resp. Recebimento</th>
                <th className="py-3 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Nenhuma viatura baixada encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition">
                    {/* 1 - Nº PATRIMÔNIO */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {v.numPatrimonio || "--"}
                    </td>

                    {/* 2 - DATA DA BAIXA */}
                    <td className="py-3 px-3 font-mono text-slate-800 whitespace-nowrap">
                      {formatDateBR(v.dataBaixa) || "--"}
                    </td>

                    {/* 3 - MARCA */}
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {v.marca || "--"}
                    </td>

                    {/* 4 - MODELO */}
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {v.modelo}
                    </td>

                    {/* 5 - PLACA */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                      {formatPlaca(v.placa)}
                    </td>

                    {/* 6 - CHASSI */}
                    <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                      {v.chassi || "--"}
                    </td>

                    {/* 7 - PREFIXO */}
                    <td className="py-3 px-3 font-black text-slate-900 text-sm whitespace-nowrap">
                      {formatPrefixo(v.prefixo)}
                    </td>

                    {/* 8 - RESPONSÁVEL PELA ENTREGA */}
                    <td className="py-3 px-3 text-slate-700">
                      {v.responsavelEntrega || "--"}
                    </td>

                    {/* 9 - LOCAL */}
                    <td className="py-3 px-3 text-slate-600">
                      {v.local || "--"}
                    </td>

                    {/* 10 - RESPONSÁVEL PELO RECEBIMENTO */}
                    <td className="py-3 px-3 text-slate-700">
                      {v.responsavelRecebimento || "--"}
                    </td>

                    {/* AÇÕES: LÁPIS (EDITAR), LIXEIRA (EXCLUIR), REATIVAR */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Ícone de Lápis para Editar */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(v)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-200 transition cursor-pointer"
                          title="Editar informações da viatura baixada"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Ícone de Lixeira para Excluir */}
                        <button
                          type="button"
                          onClick={() => handleDelete(v)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-red-200 transition cursor-pointer"
                          title="Excluir registro da viatura baixada"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Botão de Reativar */}
                        <button
                          type="button"
                          onClick={() => handleReativar(v)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-50 border border-amber-200 rounded-lg transition cursor-pointer"
                          title="Reativar viatura para frota operacional"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reativar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Baixar / Editar Viatura */}
      {showBaixarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                {editingViatura ? "Editar Viatura Baixada" : "Registrar Baixa de Viatura"}
              </h2>
              <button
                type="button"
                onClick={() => setShowBaixarModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBaixa} className="space-y-4 text-xs">
              {!editingViatura && ativas.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <label className="block text-slate-700 font-bold mb-1">
                    Selecionar da Frota Ativa (Preenchimento Automático)
                  </label>
                  <select
                    value={formData.selectedViaturaId}
                    onChange={(e) => handleSelectViaturaToBaixar(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
                  >
                    <option value="">-- Selecione ou digite manualmente abaixo --</option>
                    {ativas.map((v) => (
                      <option key={v.id} value={v.id}>
                        {formatPrefixo(v.prefixo)} - {formatPlaca(v.placa)} ({v.modelo})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1 - Nº PATRIMÔNIO */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">1 - Nº Patrimônio</label>
                  <input
                    type="text"
                    placeholder="Ex: PAT-001928"
                    value={formData.numPatrimonio}
                    onChange={(e) => setFormData({ ...formData, numPatrimonio: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono uppercase"
                  />
                </div>

                {/* 2 - DATA DA BAIXA */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">2 - Data da Baixa *</label>
                  <input
                    type="date"
                    required
                    value={formData.dataBaixa}
                    onChange={(e) => setFormData({ ...formData, dataBaixa: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono"
                  />
                </div>

                {/* 3 - MARCA */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">3 - Marca</label>
                  <input
                    type="text"
                    placeholder="Ex: RENAULT, TOYOTA, YAMAHA"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 uppercase"
                  />
                </div>

                {/* 4 - MODELO */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">4 - Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: DUSTER 1.6, COROLLA, LANDER 250"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 uppercase"
                  />
                </div>

                {/* 5 - PLACA */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">5 - Placa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: RPV 9G24"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: formatPlaca(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold uppercase"
                  />
                </div>

                {/* 6 - CHASSI */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">6 - Chassi</label>
                  <input
                    type="text"
                    placeholder="Ex: 93YBB0... (17 caracteres)"
                    value={formData.chassi}
                    onChange={(e) => setFormData({ ...formData, chassi: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono uppercase"
                  />
                </div>

                {/* 7 - PREFIXO */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">7 - Prefixo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 9.1901 ou R.0058"
                    value={formData.prefixo}
                    onChange={(e) => setFormData({ ...formData, prefixo: formatPrefixo(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-black uppercase text-sm"
                  />
                </div>

                {/* 8 - RESPONSÁVEL PELA ENTREGA */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">8 - Responsável pela Entrega</label>
                  <input
                    type="text"
                    placeholder="Ex: SGT PM J. SOUZA - MAT 30.123"
                    value={formData.responsavelEntrega}
                    onChange={(e) => setFormData({ ...formData, responsavelEntrega: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 uppercase"
                  />
                </div>

                {/* 9 - LOCAL */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">9 - Local de Destino / Depósito</label>
                  <input
                    type="text"
                    placeholder="Ex: DAL - Departamento de Apoio Logístico"
                    value={formData.local}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>

                {/* 10 - RESPONSÁVEL PELO RECEBIMENTO */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">10 - Responsável pelo Recebimento</label>
                  <input
                    type="text"
                    placeholder="Ex: CAP PM ALMEIDA - COMISSÃO DE BAIXA"
                    value={formData.responsavelRecebimento}
                    onChange={(e) => setFormData({ ...formData, responsavelRecebimento: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Motivo / Fundamentação da Baixa</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Inservível, dano irreparável decorrente de sinistro, alienação patrimonial conforme BGO..."
                  value={formData.motivoBaixa}
                  onChange={(e) => setFormData({ ...formData, motivoBaixa: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBaixarModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition cursor-pointer shadow-xs"
                >
                  {editingViatura ? "Salvar Alterações" : "Confirmar Baixa Patrimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
