import React, { useState } from "react";
import {
  DollarSign,
  Search,
  Printer,
  Pencil,
  Trash2,
  Plus,
  X,
  Save,
  FileSpreadsheet,
  AlertTriangle,
  TrendingDown
} from "lucide-react";
import { GastoManutencao, ConfigSistema } from "../types";
import { formatarMoedaBRL } from "../constants";
import {
  formatPlaca,
  formatPrefixo,
  formatDateBR,
  exportToExcelStyled,
} from "../utils/formatters";
import { ImportExcelButton } from "./ImportExcelButton";
import { parseExcelToGastos } from "../utils/excelParsers";
import { triggerPrintGeneric } from "../utils/printHelper";

interface GastosManutencaoViewProps {
  gastos: GastoManutencao[];
  onAddGasto: (gasto: GastoManutencao) => void;
  onUpdateGasto: (gasto: GastoManutencao) => void;
  onDeleteGasto: (id: string) => void;
  onImportGastos?: (gastos: GastoManutencao[]) => void;
  config?: ConfigSistema;
}

export const GastosManutencaoView: React.FC<GastosManutencaoViewProps> = ({
  gastos,
  onAddGasto,
  onUpdateGasto,
  onDeleteGasto,
  onImportGastos,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingGasto, setEditingGasto] = useState<GastoManutencao | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [newGasto, setNewGasto] = useState<Partial<GastoManutencao>>({
    marca: "Renault",
    modelo: "Duster",
    ano: "2023",
    numPatrimonio: "PMBA-19-0012",
    prefixo: "9.1901",
    placa: "RPV 9G24",
    valorMercado: 85000,
    totalGastos: 0,
  });

  // Filter
  const filtered = gastos.filter((g) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      g.prefixo.toLowerCase().includes(term) ||
      g.placa.toLowerCase().includes(term) ||
      g.marca.toLowerCase().includes(term) ||
      g.modelo.toLowerCase().includes(term) ||
      g.numPatrimonio.toLowerCase().includes(term)
    );
  });

  // Export to Excel / CSV
  const exportToExcel = () => {
    if (gastos.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }

    const headers = [
      "1-Nº",
      "2-MARCA",
      "3-MODELO",
      "4-ANO",
      "5-Nº PATRIMÔNIO",
      "6-PREFIXO",
      "7-PLACA",
      "8-VALOR DE MERCADO",
      "9-TOTAL DE GASTOS",
      "10-COMPARATIVO (%)"
    ];

    const rows = filtered.map((g, idx) => {
      const comparativoNum = g.valorMercado > 0 ? (g.totalGastos / g.valorMercado) * 100 : 0;
      return [
        idx + 1,
        g.marca,
        g.modelo,
        g.ano,
        g.numPatrimonio,
        formatPrefixo(g.prefixo),
        formatPlaca(g.placa),
        formatarMoedaBRL(g.valorMercado),
        formatarMoedaBRL(g.totalGastos),
        `${comparativoNum.toFixed(2)}%`
      ];
    });

    exportToExcelStyled({
      filename: `Gastos_Manutencao_${config?.unidade ? config.unidade.replace(/\s+/g, "_") : "19CIPM"}_${new Date().toISOString().slice(0, 10)}.xls`,
      title: `RELATÓRIO DE GASTOS COM MANUTENÇÃO - ${config?.unidade || "19ª CIPM/PARIPE"}`,
      headers,
      rows,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGasto) return;
    onUpdateGasto(editingGasto);
    setEditingGasto(null);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const gastoFinal: GastoManutencao = {
      id: "gst-" + Date.now(),
      marca: newGasto.marca || "Renault",
      modelo: newGasto.modelo || "Duster",
      ano: newGasto.ano || "2023",
      numPatrimonio: newGasto.numPatrimonio || "PMBA-19-0012",
      prefixo: newGasto.prefixo || "9.1901",
      placa: newGasto.placa || "RPV 9G24",
      valorMercado: Number(newGasto.valorMercado) || 0,
      totalGastos: Number(newGasto.totalGastos) || 0,
    };

    onAddGasto(gastoFinal);
    setShowAddModal(false);
  };

  const somaTotalGastos = filtered.reduce((acc, curr) => acc + curr.totalGastos, 0);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 text-slate-800">
      {/* Header Card (Cabeçalho com fundo preto e letras brancas) */}
      <div className="bg-black text-white border border-neutral-800 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-900 text-emerald-400 rounded-xl border border-neutral-700">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-white">
                Controle de Gastos com Manutenção de Viaturas Próprias
              </h2>
              <p className="text-xs text-neutral-300">
                {config?.unidade || "19ª CIPM"} • Demonstrativo de valores em Real Brasileiro (R$), comparativo e histórico de gastos por placa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-imprimir-gastos"
              onClick={() => triggerPrintGeneric()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition border border-neutral-600 shadow-xs cursor-pointer"
              title="Imprimir relatório de gastos com manutenção"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              id="btn-exportar-gastos"
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Exportar gastos para planilha Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>

            <ImportExcelButton
              buttonId="btn-importar-excel-gastos"
              onImport={async (rows) => {
                const parsed = parseExcelToGastos(rows);
                if (onImportGastos) {
                  onImportGastos(parsed);
                } else {
                  parsed.forEach((g) => onAddGasto(g));
                }
              }}
              title="Importar gastos a partir de planilha Excel (.xlsx, .xls ou .csv)"
            />

            <button
              type="button"
              id="btn-novo-gasto"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Registro</span>
            </button>
          </div>
        </div>

        {/* Search Input & Total summary */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar por placa da viatura ou prefixo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
            />
          </div>

          <div className="text-xs bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-700 text-white">
            <span className="text-neutral-300">Soma Total Gasta: </span>
            <span className="font-mono font-bold text-emerald-400 ml-1">
              {formatarMoedaBRL(somaTotalGastos)}
            </span>
          </div>
        </div>
      </div>

      {/* Spreadsheet Table (Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-[10px] sm:text-[11px] font-extrabold tracking-wider border-b border-neutral-800 whitespace-nowrap">
                <th className="p-2.5 border-r border-neutral-800">1. Nº</th>
                <th className="p-2.5 border-r border-neutral-800">2. MARCA</th>
                <th className="p-2.5 border-r border-neutral-800">3. MODELO</th>
                <th className="p-2.5 border-r border-neutral-800">4. ANO</th>
                <th className="p-2.5 border-r border-neutral-800">5. Nº PATRIMÔNIO</th>
                <th className="p-2.5 border-r border-neutral-800">6. PREFIXO</th>
                <th className="p-2.5 border-r border-neutral-800">7. PLACA</th>
                <th className="p-2.5 border-r border-neutral-800">8. VALOR DE MERCADO</th>
                <th className="p-2.5 border-r border-neutral-800 text-rose-300 font-bold">
                  9. TOTAL DE GASTOS
                </th>
                <th className="p-2.5 border-r border-neutral-800 text-blue-300 font-bold">
                  10. COMPARATIVO
                </th>
                <th className="p-2.5 text-center">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400 italic">
                    Nenhum registro de gastos com viatura encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((g, idx) => {
                  const comparativo =
                    g.valorMercado > 0
                      ? ((g.totalGastos / g.valorMercado) * 100).toFixed(1) + "%"
                      : "0%";

                  const isHighCost = g.valorMercado > 0 && g.totalGastos / g.valorMercado >= 0.3;

                  return (
                    <tr key={g.id} className="hover:bg-slate-50 transition whitespace-nowrap">
                      {/* 1. Nº */}
                      <td className="p-2.5 font-mono text-slate-500 font-bold border-r border-slate-100">
                        {idx + 1}
                      </td>

                      {/* 2. MARCA */}
                      <td className="p-2.5 font-medium border-r border-slate-100">{g.marca}</td>

                      {/* 3. MODELO */}
                      <td className="p-2.5 font-semibold text-slate-900 border-r border-slate-100">
                        {g.modelo}
                      </td>

                      {/* 4. ANO */}
                      <td className="p-2.5 font-mono text-slate-600 border-r border-slate-100">{g.ano}</td>

                      {/* 5. Nº PATRIMÔNIO */}
                      <td className="p-2.5 font-mono text-slate-600 border-r border-slate-100">
                        {g.numPatrimonio}
                      </td>

                      {/* 6. PREFIXO */}
                      <td className="p-2.5 font-bold text-blue-700 border-r border-slate-100">
                        {g.prefixo}
                      </td>

                      {/* 7. PLACA */}
                      <td className="p-2.5 font-mono font-bold text-slate-800 border-r border-slate-100">
                        {g.placa}
                      </td>

                      {/* 8. VALOR DE MERCADO */}
                      <td className="p-2.5 font-mono text-emerald-700 font-semibold border-r border-slate-100">
                        {formatarMoedaBRL(g.valorMercado)}
                      </td>

                      {/* 9. TOTAL DE GASTOS */}
                      <td className="p-2.5 font-mono font-bold text-red-700 border-r border-slate-100 bg-red-50/40">
                        {formatarMoedaBRL(g.totalGastos)}
                      </td>

                      {/* 10. COMPARATIVO */}
                      <td className="p-2.5 font-mono font-bold border-r border-slate-100 bg-blue-50/40">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1 ${
                            isHighCost
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "bg-blue-100 text-blue-800 border border-blue-300"
                          }`}
                        >
                          <TrendingDown className="w-3 h-3" />
                          {comparativo}
                        </span>
                      </td>

                      {/* AÇÕES */}
                      <td className="p-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingGasto(g)}
                            className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
                            title="Editar gasto da viatura"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(g.id)}
                            className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
                            title="Excluir este registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>{filtered.length} viatura(s) com controle de manutenção</span>
          <span className="font-mono text-slate-600 text-[11px]">
            * Comparativo indica o percentual do valor de mercado já gasto em manutenção preventiva/corretiva.
          </span>
        </div>
      </div>

      {/* Edit Modal */}
      {editingGasto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Editar Registro de Gastos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingGasto(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Marca</label>
                  <input
                    type="text"
                    required
                    value={editingGasto.marca}
                    onChange={(e) =>
                      setEditingGasto({ ...editingGasto, marca: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Modelo</label>
                  <input
                    type="text"
                    required
                    value={editingGasto.modelo}
                    onChange={(e) =>
                      setEditingGasto({ ...editingGasto, modelo: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Ano</label>
                  <input
                    type="text"
                    required
                    value={editingGasto.ano}
                    onChange={(e) =>
                      setEditingGasto({ ...editingGasto, ano: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Prefixo</label>
                  <input
                    type="text"
                    required
                    value={editingGasto.prefixo}
                    onChange={(e) =>
                      setEditingGasto({ ...editingGasto, prefixo: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Placa</label>
                  <input
                    type="text"
                    required
                    value={editingGasto.placa}
                    onChange={(e) =>
                      setEditingGasto({ ...editingGasto, placa: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono uppercase focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Nº Patrimônio</label>
                <input
                  type="text"
                  required
                  value={editingGasto.numPatrimonio}
                  onChange={(e) =>
                    setEditingGasto({ ...editingGasto, numPatrimonio: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Valor de Mercado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingGasto.valorMercado}
                    onChange={(e) =>
                      setEditingGasto({
                        ...editingGasto,
                        valorMercado: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-emerald-700 font-mono font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Gasto com Manutenção (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingGasto.totalGastos}
                    onChange={(e) =>
                      setEditingGasto({
                        ...editingGasto,
                        totalGastos: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-red-700 font-mono font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingGasto(null)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Cadastrar Gastos da Viatura
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Marca *</label>
                  <input
                    type="text"
                    required
                    value={newGasto.marca}
                    onChange={(e) => setNewGasto({ ...newGasto, marca: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={newGasto.modelo}
                    onChange={(e) => setNewGasto({ ...newGasto, modelo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Ano *</label>
                  <input
                    type="text"
                    required
                    value={newGasto.ano}
                    onChange={(e) => setNewGasto({ ...newGasto, ano: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Prefixo *</label>
                  <input
                    type="text"
                    required
                    value={newGasto.prefixo}
                    onChange={(e) => setNewGasto({ ...newGasto, prefixo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Placa *</label>
                  <input
                    type="text"
                    required
                    value={newGasto.placa}
                    onChange={(e) => setNewGasto({ ...newGasto, placa: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono uppercase focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Nº Patrimônio *</label>
                <input
                  type="text"
                  required
                  value={newGasto.numPatrimonio}
                  onChange={(e) => setNewGasto({ ...newGasto, numPatrimonio: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Valor de Mercado (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newGasto.valorMercado}
                    onChange={(e) =>
                      setNewGasto({ ...newGasto, valorMercado: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-emerald-700 font-mono font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Total de Gastos Inicial (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newGasto.totalGastos}
                    onChange={(e) =>
                      setNewGasto({ ...newGasto, totalGastos: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-red-700 font-mono font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Cadastrar Registro</span>
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
              <h3 className="text-base font-bold text-slate-900">Confirmar Exclusão</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Deseja realmente deletar este registro de gastos com manutenção da viatura?
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
                  onDeleteGasto(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Sim, Excluir Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
