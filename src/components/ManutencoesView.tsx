import React, { useState } from "react";
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Save,
  Printer,
  FileSpreadsheet,
  Car,
  Pencil,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { RegistroManutencao, Viatura, ConfigSistema } from "../types";
import {
  formatPlaca,
  formatPrefixo,
  formatDateBR,
  exportToExcelStyled,
} from "../utils/formatters";
import { ImportExcelButton } from "./ImportExcelButton";
import { parseExcelToManutencoes } from "../utils/excelParsers";
import { triggerPrintGeneric } from "../utils/printHelper";

interface ManutencoesViewProps {
  manutencoes: RegistroManutencao[];
  viaturas: Viatura[];
  onAddManutencao: (m: RegistroManutencao) => void;
  onUpdateManutencao: (m: RegistroManutencao) => void;
  onDeleteManutencao?: (id: string) => void;
  onImportManutencoes?: (manutencoes: RegistroManutencao[]) => void;
  config?: ConfigSistema;
}

export const ManutencoesView: React.FC<ManutencoesViewProps> = ({
  manutencoes,
  viaturas,
  onAddManutencao,
  onUpdateManutencao,
  onDeleteManutencao,
  onImportManutencoes,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RegistroManutencao | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [newManut, setNewManut] = useState<Partial<RegistroManutencao>>({
    ordemServico: `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    prefixo: viaturas[0]?.prefixo || "9.1901",
    placa: viaturas[0]?.placa || "RPV 9G24",
    oficina: "Oficina Especializada PMBA",
    tipo: "Mecânica Geral",
    descricaoServico: "",
    dataEntrada: new Date().toISOString().split("T")[0],
    dataPrevisaoSaida: "",
    valorEstimado: 0,
    status: "em_andamento",
    responsavelAbertura: "SPO / Gestão de Frota",
  });

  const filtered = manutencoes.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      m.prefixo.toLowerCase().includes(term) ||
      m.placa.toLowerCase().includes(term) ||
      m.ordemServico.toLowerCase().includes(term) ||
      m.oficina.toLowerCase().includes(term);

    const matchesStatus = filterStatus === "todos" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViaturaSelect = (prefixo: string) => {
    const selected = viaturas.find((v) => v.prefixo === prefixo);
    setNewManut((prev) => ({
      ...prev,
      prefixo,
      placa: selected ? selected.placa : prev.placa,
    }));
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManut.descricaoServico?.trim()) {
      alert("Informe a descrição do serviço de manutenção.");
      return;
    }

    const item: RegistroManutencao = {
      id: `manut-${Date.now()}`,
      ordemServico: newManut.ordemServico || `OS-${new Date().getFullYear()}-001`,
      prefixo: newManut.prefixo || "9.1901",
      placa: newManut.placa || "RPV 9G24",
      oficina: newManut.oficina || "Oficina Credenciada",
      tipo: (newManut.tipo as any) || "Mecânica Geral",
      descricaoServico: newManut.descricaoServico,
      dataEntrada: newManut.dataEntrada || new Date().toISOString().split("T")[0],
      dataPrevisaoSaida: newManut.dataPrevisaoSaida,
      valorEstimado: Number(newManut.valorEstimado) || 0,
      status: (newManut.status as any) || "em_andamento",
      responsavelAbertura: newManut.responsavelAbertura || "SPO / 19ª CIPM",
    };

    onAddManutencao(item);
    setShowAddModal(false);
    setNewManut({
      ordemServico: `OS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      prefixo: viaturas[0]?.prefixo || "9.1901",
      placa: viaturas[0]?.placa || "RPV 9G24",
      oficina: "Oficina Especializada PMBA",
      tipo: "Mecânica Geral",
      descricaoServico: "",
      dataEntrada: new Date().toISOString().split("T")[0],
      dataPrevisaoSaida: "",
      valorEstimado: 0,
      status: "em_andamento",
      responsavelAbertura: "SPO / Gestão de Frota",
    });
  };

  const handleExportCSV = () => {
    if (manutencoes.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }

    const headers = [
      "ORDEM SERVIÇO",
      "PREFIXO",
      "PLACA",
      "OFICINA",
      "TIPO DE SERVIÇO",
      "STATUS",
      "DATA ENTRADA",
      "VALOR ESTIMADO",
      "VALOR FINAL"
    ];
    const rows = manutencoes.map((m) => [
      m.ordemServico,
      formatPrefixo(m.prefixo),
      formatPlaca(m.placa),
      m.oficina,
      m.tipo,
      m.status,
      formatDateBR(m.dataEntrada),
      `R$ ${(m.valorEstimado || 0).toFixed(2)}`,
      m.valorFinal ? `R$ ${m.valorFinal.toFixed(2)}` : "--",
    ]);

    exportToExcelStyled({
      filename: `manutencoes_19cipm_${new Date().toISOString().split("T")[0]}.xls`,
      title: `RELATÓRIO DE MANUTENÇÕES - ${config?.unidade || "19ª CIPM/PARIPE"}`,
      headers,
      rows,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdateManutencao(editingItem);
    setEditingItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 text-slate-800">
      {/* Header Card (Cabeçalho com fundo preto e letras brancas) */}
      <div className="bg-black text-white border border-neutral-800 rounded-2xl p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-900 text-white border border-neutral-700">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Controle de Manutenções
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium">
                {config?.unidade || "19ª CIPM"} • Ordens de Serviço, oficinas credenciadas e reparos em andamento
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-exportar-manutencoes"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-xl transition cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            id="btn-imprimir-manutencoes"
            onClick={() => triggerPrintGeneric()}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-xl transition cursor-pointer shadow-xs"
            title="Imprimir relatório de manutenções"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Imprimir</span>
          </button>

          <ImportExcelButton
            buttonId="btn-importar-excel-manutencoes"
            onImport={async (rows) => {
              const parsed = parseExcelToManutencoes(rows);
              if (onImportManutencoes) {
                onImportManutencoes(parsed);
              } else {
                parsed.forEach((m) => onAddManutencao(m));
              }
            }}
            title="Importar manutenções a partir de planilha Excel (.xlsx, .xls ou .csv)"
          />

          <button
            type="button"
            id="btn-nova-manutencao"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Manutenção</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Ordens</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{manutencoes.length}</div>
        </div>
        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Em Andamento</div>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {manutencoes.filter((m) => m.status === "em_andamento").length}
          </div>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Aguardando Peças</div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {manutencoes.filter((m) => m.status === "aguardando_pecas").length}
          </div>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Concluídas</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {manutencoes.filter((m) => m.status === "concluida").length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-5 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por prefixo, placa, OS ou oficina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="aguardando_pecas">Aguardando Peças</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black text-white font-bold border-b border-neutral-800 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">O.S. / Prefixo</th>
                <th className="py-3 px-4">Placa / Oficina</th>
                <th className="py-3 px-4">Tipo de Serviço</th>
                <th className="py-3 px-4">Entrada / Previsão</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhum registro de manutenção encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-blue-700">{m.ordemServico}</div>
                      <div className="text-slate-900 font-bold mt-0.5">{m.prefixo}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-800">{m.placa}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{m.oficina}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{m.tipo}</span>
                      <div className="text-[11px] text-slate-500 line-clamp-1 max-w-[220px]">
                        {m.descricaoServico}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>Entrada: {m.dataEntrada}</div>
                      {m.dataPrevisaoSaida && (
                        <div className="text-[11px] text-slate-500">Prev: {m.dataPrevisaoSaida}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      R$ {Number(m.valorFinal || m.valorEstimado || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      {m.status === "concluida" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Concluída
                        </span>
                      )}
                      {m.status === "em_andamento" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Em Andamento
                        </span>
                      )}
                      {m.status === "aguardando_pecas" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" /> Aguardando Peças
                        </span>
                      )}
                      {m.status === "cancelada" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          Cancelada
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {m.status !== "concluida" && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateManutencao({
                                ...m,
                                status: "concluida",
                                dataConclusao: new Date().toISOString().split("T")[0],
                                valorFinal: m.valorFinal || m.valorEstimado,
                              });
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-300 rounded-md transition cursor-pointer"
                            title="Concluir manutenção"
                          >
                            Concluir
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingItem(m)}
                          className="p-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer"
                          title="Editar manutenção"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(m.id)}
                          className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
                          title="Excluir manutenção"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal Nova Manutenção */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                Nova Ordem de Manutenção
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Prefixo da Viatura</label>
                  <select
                    value={newManut.prefixo}
                    onChange={(e) => handleViaturaSelect(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  >
                    {viaturas.map((v) => (
                      <option key={v.id} value={v.prefixo}>
                        {v.prefixo} - {v.placa} ({v.modelo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nº Ordem Serviço</label>
                  <input
                    type="text"
                    value={newManut.ordemServico}
                    onChange={(e) => setNewManut({ ...newManut, ordemServico: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-blue-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Oficina / Fornecedor</label>
                  <input
                    type="text"
                    value={newManut.oficina}
                    onChange={(e) => setNewManut({ ...newManut, oficina: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                    placeholder="Nome da oficina"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tipo de Manutenção</label>
                  <select
                    value={newManut.tipo}
                    onChange={(e) => setNewManut({ ...newManut, tipo: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  >
                    <option value="Mecânica Geral">Mecânica Geral</option>
                    <option value="Freios e Suspensão">Freios e Suspensão</option>
                    <option value="Elétrica">Elétrica</option>
                    <option value="Funilaria/Pintura">Funilaria/Pintura</option>
                    <option value="Preventiva">Preventiva</option>
                    <option value="Corretiva">Corretiva</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Descrição do Serviço / Peças</label>
                <textarea
                  rows={3}
                  value={newManut.descricaoServico}
                  onChange={(e) => setNewManut({ ...newManut, descricaoServico: e.target.value })}
                  placeholder="Detalhes dos defeitos identificados, peças a substituir..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Data Entrada</label>
                  <input
                    type="date"
                    value={newManut.dataEntrada}
                    onChange={(e) => setNewManut({ ...newManut, dataEntrada: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Valor Estimado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newManut.valorEstimado}
                    onChange={(e) => setNewManut({ ...newManut, valorEstimado: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition cursor-pointer font-bold shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  Salvar Manutenção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Manutenção */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-600" />
                Editar Ordem de Manutenção ({editingItem.ordemServico})
              </h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Viatura (Prefixo)</label>
                  <input
                    type="text"
                    required
                    value={editingItem.prefixo}
                    onChange={(e) => setEditingItem({ ...editingItem, prefixo: formatPrefixo(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Placa</label>
                  <input
                    type="text"
                    required
                    value={editingItem.placa}
                    onChange={(e) => setEditingItem({ ...editingItem, placa: formatPlaca(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Oficina / Prestador</label>
                  <input
                    type="text"
                    required
                    value={editingItem.oficina}
                    onChange={(e) => setEditingItem({ ...editingItem, oficina: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tipo de Serviço</label>
                  <input
                    type="text"
                    required
                    value={editingItem.tipo}
                    onChange={(e) => setEditingItem({ ...editingItem, tipo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Descrição dos Reparos</label>
                <textarea
                  rows={2}
                  required
                  value={editingItem.descricaoServico}
                  onChange={(e) => setEditingItem({ ...editingItem, descricaoServico: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  >
                    <option value="em_andamento">Em Andamento</option>
                    <option value="aguardando_pecas">Aguardando Peças</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Valor Estimado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.valorEstimado}
                    onChange={(e) => setEditingItem({ ...editingItem, valorEstimado: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Valor Final (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingItem.valorFinal || 0}
                    onChange={(e) => setEditingItem({ ...editingItem, valorFinal: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition cursor-pointer font-bold shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-2xl text-slate-800">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Confirmar Exclusão de Manutenção</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Deseja realmente excluir permanentemente este registro de manutenção? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteManutencao) {
                    onDeleteManutencao(deleteConfirmId);
                  }
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
