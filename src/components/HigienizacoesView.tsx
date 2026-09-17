import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  X,
  Save,
  Printer,
  FileSpreadsheet,
  Droplets,
  DollarSign,
  Pencil,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { RegistroHigienizacao, Viatura, ConfigSistema } from "../types";
import {
  formatPlaca,
  formatPrefixo,
  formatDateBR,
  exportToExcelStyled,
} from "../utils/formatters";
import { ImportExcelButton } from "./ImportExcelButton";
import { parseExcelToHigienizacoes } from "../utils/excelParsers";
import { triggerPrintGeneric } from "../utils/printHelper";

interface HigienizacoesViewProps {
  higienizacoes: RegistroHigienizacao[];
  viaturas: Viatura[];
  onAddHigienizacao: (h: RegistroHigienizacao) => void;
  onUpdateHigienizacao?: (h: RegistroHigienizacao) => void;
  onDeleteHigienizacao?: (id: string) => void;
  onImportHigienizacoes?: (higienizacoes: RegistroHigienizacao[]) => void;
  config?: ConfigSistema;
}

export const HigienizacoesView: React.FC<HigienizacoesViewProps> = ({
  higienizacoes,
  viaturas,
  onAddHigienizacao,
  onUpdateHigienizacao,
  onDeleteHigienizacao,
  onImportHigienizacoes,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHig, setEditingHig] = useState<RegistroHigienizacao | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [newHig, setNewHig] = useState<Partial<RegistroHigienizacao>>({
    prefixo: viaturas[0]?.prefixo || "9.1901",
    placa: viaturas[0]?.placa || "RPV 9G24",
    tipo: "Lavagem Geral",
    data: new Date().toISOString().split("T")[0],
    responsavel: "Sd PM Motorista de Plantão",
    local: "Pátio 19ª CIPM",
    km: viaturas[0]?.kmAtual || 30000,
    observacoes: "",
    custo: 50.0,
  });

  const filtered = higienizacoes.filter((h) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      h.prefixo.toLowerCase().includes(term) ||
      h.placa.toLowerCase().includes(term) ||
      h.responsavel.toLowerCase().includes(term) ||
      h.local.toLowerCase().includes(term);

    const matchTipo = filterTipo === "todos" || h.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  const handleViaturaSelect = (prefixo: string) => {
    const selected = viaturas.find((v) => v.prefixo === prefixo);
    setNewHig((prev) => ({
      ...prev,
      prefixo,
      placa: selected ? selected.placa : prev.placa,
      km: selected ? selected.kmAtual : prev.km,
    }));
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const item: RegistroHigienizacao = {
      id: `hig-${Date.now()}`,
      prefixo: newHig.prefixo || "9.1901",
      placa: newHig.placa || "RPV 9G24",
      tipo: (newHig.tipo as any) || "Lavagem Geral",
      data: newHig.data || new Date().toISOString().split("T")[0],
      responsavel: newHig.responsavel || "Equipe de Serviço",
      local: newHig.local || "Pátio da Unidade",
      km: Number(newHig.km) || 0,
      observacoes: newHig.observacoes,
      custo: Number(newHig.custo) || 0,
    };

    onAddHigienizacao(item);
    setShowAddModal(false);
    setNewHig({
      prefixo: viaturas[0]?.prefixo || "9.1901",
      placa: viaturas[0]?.placa || "RPV 9G24",
      tipo: "Lavagem Geral",
      data: new Date().toISOString().split("T")[0],
      responsavel: "Sd PM Motorista de Plantão",
      local: "Pátio 19ª CIPM",
      km: viaturas[0]?.kmAtual || 30000,
      observacoes: "",
      custo: 50.0,
    });
  };

  const handleExportCSV = () => {
    if (higienizacoes.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }

    const headers = [
      "PREFIXO",
      "PLACA",
      "TIPO DE HIGIENIZAÇÃO",
      "DATA",
      "RESPONSÁVEL",
      "LOCAL",
      "KM",
      "CUSTO",
      "OBSERVAÇÕES"
    ];
    const rows = higienizacoes.map((h) => [
      formatPrefixo(h.prefixo),
      formatPlaca(h.placa),
      h.tipo,
      formatDateBR(h.data),
      h.responsavel,
      h.local,
      h.km,
      `R$ ${(h.custo || 0).toFixed(2)}`,
      h.observacoes || ""
    ]);

    exportToExcelStyled({
      filename: `higienizacoes_19cipm_${new Date().toISOString().split("T")[0]}.xls`,
      title: `REGISTRO DE HIGIENIZAÇÕES E LAVAGENS - ${config?.unidade || "19ª CIPM/PARIPE"}`,
      headers,
      rows,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHig) return;
    if (onUpdateHigienizacao) {
      onUpdateHigienizacao(editingHig);
    }
    setEditingHig(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 text-slate-800">
      {/* Header Card (Cabeçalho com fundo preto e letras brancas) */}
      <div className="bg-black text-white border border-neutral-800 rounded-2xl p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-neutral-900 text-cyan-400 border border-neutral-700">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Higienizações e Lavagens de Viaturas
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 font-medium">
              {config?.unidade || "19ª CIPM"} • Controle de assepsia, desinfecção sanitária e lavagens periódicas da frota
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-exportar-higienizacoes"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-xl transition cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            id="btn-imprimir-higienizacoes"
            onClick={() => triggerPrintGeneric()}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-xl transition cursor-pointer shadow-xs"
            title="Imprimir relatório de higienizações"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Imprimir</span>
          </button>

          <ImportExcelButton
            buttonId="btn-importar-excel-higienizacoes"
            onImport={async (rows) => {
              const parsed = parseExcelToHigienizacoes(rows);
              if (onImportHigienizacoes) {
                onImportHigienizacoes(parsed);
              } else {
                parsed.forEach((h) => onAddHigienizacao(h));
              }
            }}
            title="Importar higienizações a partir de planilha Excel (.xlsx, .xls ou .csv)"
          />

          <button
            type="button"
            id="btn-registrar-higienizacao"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Higienização</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Realizadas</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{higienizacoes.length}</div>
        </div>
        <div className="bg-white border border-cyan-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">Lavagens Gerais</div>
          <div className="text-2xl font-black text-cyan-700 mt-1">
            {higienizacoes.filter((h) => h.tipo === "Lavagem Geral").length}
          </div>
        </div>
        <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Higienização Interna</div>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {higienizacoes.filter((h) => h.tipo === "Higienização Interna").length}
          </div>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Custo Total</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            R$ {higienizacoes.reduce((acc, curr) => acc + (curr.custo || 0), 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-5 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por prefixo, placa, responsável ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="Lavagem Geral">Lavagem Geral</option>
            <option value="Higienização Interna">Higienização Interna</option>
            <option value="Desinfecção Sanitária">Desinfecção Sanitária</option>
            <option value="Lavagem de Motor">Lavagem de Motor</option>
            <option value="Polimento e Cristalização">Polimento e Cristalização</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black text-white font-bold border-b border-neutral-800 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Viatura</th>
                <th className="py-3 px-4">Tipo de Higienização</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Local</th>
                <th className="py-3 px-4">Responsável</th>
                <th className="py-3 px-4">KM Atual</th>
                <th className="py-3 px-4">Custo</th>
                <th className="py-3 px-4">Observações</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Nenhum registro de higienização cadastrado.
                  </td>
                </tr>
              ) : (
                filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-black text-slate-900">{formatPrefixo(h.prefixo)}</div>
                      <div className="font-mono text-[11px] text-slate-500">{formatPlaca(h.placa)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                        <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                        {h.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800">{formatDateBR(h.data)}</td>
                    <td className="py-3 px-4 text-slate-600">{h.local}</td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{h.responsavel}</td>
                    <td className="py-3 px-4 font-mono">{Number(h.km || 0).toLocaleString("pt-BR")} KM</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      R$ {(h.custo || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">
                      {h.observacoes || "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingHig(h)}
                          className="p-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer"
                          title="Editar higienização"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(h.id)}
                          className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
                          title="Excluir higienização"
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

      {/* Modal Nova Higienização */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-600" />
                Registrar Higienização / Lavagem
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
                  <label className="block text-slate-600 font-bold mb-1">Viatura</label>
                  <select
                    value={newHig.prefixo}
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
                  <label className="block text-slate-600 font-bold mb-1">Tipo de Serviço</label>
                  <select
                    value={newHig.tipo}
                    onChange={(e) => setNewHig({ ...newHig, tipo: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
                  >
                    <option value="Lavagem Geral">Lavagem Geral</option>
                    <option value="Higienização Interna">Higienização Interna</option>
                    <option value="Desinfecção Sanitária">Desinfecção Sanitária</option>
                    <option value="Lavagem de Motor">Lavagem de Motor</option>
                    <option value="Polimento e Cristalização">Polimento e Cristalização</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Data</label>
                  <input
                    type="date"
                    value={newHig.data}
                    onChange={(e) => setNewHig({ ...newHig, data: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newHig.custo}
                    onChange={(e) => setNewHig({ ...newHig, custo: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Responsável / Executante</label>
                  <input
                    type="text"
                    value={newHig.responsavel}
                    onChange={(e) => setNewHig({ ...newHig, responsavel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                    placeholder="Nome do responsável"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Local</label>
                  <input
                    type="text"
                    value={newHig.local}
                    onChange={(e) => setNewHig({ ...newHig, local: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                    placeholder="Pátio da Unidade, Lava Jato..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Observações / Produtos Utilizados</label>
                <textarea
                  rows={2}
                  value={newHig.observacoes}
                  onChange={(e) => setNewHig({ ...newHig, observacoes: e.target.value })}
                  placeholder="Produtos de assepsia, desinfecção de teto, ar-condicionado..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                ></textarea>
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
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Higienização */}
      {editingHig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-600" />
                Editar Higienização da Viatura ({editingHig.prefixo})
              </h2>
              <button
                type="button"
                onClick={() => setEditingHig(null)}
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
                    value={editingHig.prefixo}
                    onChange={(e) => setEditingHig({ ...editingHig, prefixo: formatPrefixo(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Placa</label>
                  <input
                    type="text"
                    required
                    value={editingHig.placa}
                    onChange={(e) => setEditingHig({ ...editingHig, placa: formatPlaca(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-800 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tipo de Higienização</label>
                  <select
                    value={editingHig.tipo}
                    onChange={(e) => setEditingHig({ ...editingHig, tipo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  >
                    <option value="Lavagem Geral">Lavagem Geral</option>
                    <option value="Higienização Interna">Higienização Interna</option>
                    <option value="Desinfecção Sanitária">Desinfecção Sanitária</option>
                    <option value="Lavagem de Motor">Lavagem de Motor</option>
                    <option value="Polimento e Cristalização">Polimento e Cristalização</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={editingHig.data}
                    onChange={(e) => setEditingHig({ ...editingHig, data: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">KM Atual</label>
                  <input
                    type="number"
                    value={editingHig.km || 0}
                    onChange={(e) => setEditingHig({ ...editingHig, km: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingHig.custo || 0}
                    onChange={(e) => setEditingHig({ ...editingHig, custo: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Responsável / Executante</label>
                  <input
                    type="text"
                    value={editingHig.responsavel}
                    onChange={(e) => setEditingHig({ ...editingHig, responsavel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Local</label>
                  <input
                    type="text"
                    value={editingHig.local}
                    onChange={(e) => setEditingHig({ ...editingHig, local: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Observações</label>
                <textarea
                  rows={2}
                  value={editingHig.observacoes || ""}
                  onChange={(e) => setEditingHig({ ...editingHig, observacoes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingHig(null)}
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
              <h3 className="text-base font-bold text-slate-900">Confirmar Exclusão de Higienização</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Deseja realmente excluir permanentemente este registro de higienização? Esta ação não pode ser desfeita.
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
                  if (onDeleteHigienizacao) {
                    onDeleteHigienizacao(deleteConfirmId);
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
