import React, { useState } from "react";
import {
  CircleDot,
  Search,
  Printer,
  Edit2,
  Trash2,
  Plus,
  X,
  Save,
  FileSpreadsheet,
  AlertTriangle
} from "lucide-react";
import { RegistroPneu, ConfigSistema } from "../types";
import { ImportExcelButton } from "./ImportExcelButton";
import { parseExcelToPneus } from "../utils/excelParsers";
import { triggerPrintGeneric } from "../utils/printHelper";

interface ControlePneusViewProps {
  pneus: RegistroPneu[];
  onAddPneu: (pneu: RegistroPneu) => void;
  onUpdatePneu: (pneu: RegistroPneu) => void;
  onDeletePneu: (id: string) => void;
  onImportPneus?: (pneus: RegistroPneu[]) => void;
  config?: ConfigSistema;
}

export const ControlePneusView: React.FC<ControlePneusViewProps> = ({
  pneus,
  onAddPneu,
  onUpdatePneu,
  onDeletePneu,
  onImportPneus,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingPneu, setEditingPneu] = useState<RegistroPneu | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [newPneu, setNewPneu] = useState<Partial<RegistroPneu>>({
    prefixo: "9.1901",
    placa: "RPV 9G24",
    posicao: "Dianteiro Direito",
    marcaModelo: "Pirelli Scorpion 215/65 R16",
    dot: "3223",
    sulcoMm: 7.5,
    kmInstalacao: 38000,
    dataInstalacao: new Date().toISOString().split("T")[0],
    estado: "bom",
  });

  const filtered = pneus.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      p.prefixo.toLowerCase().includes(term) ||
      p.placa.toLowerCase().includes(term) ||
      p.marcaModelo.toLowerCase().includes(term) ||
      p.posicao.toLowerCase().includes(term) ||
      p.dot.toLowerCase().includes(term)
    );
  });

  const exportToExcel = () => {
    if (pneus.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }

    const headers = [
      "PREFIXO",
      "PLACA",
      "POSIÇÃO",
      "MARCA / MODELO",
      "DOT",
      "SULCO (MM)",
      "KM INSTALAÇÃO",
      "DATA INSTALAÇÃO",
      "ESTADO"
    ];

    const rows = filtered.map((p) => [
      p.prefixo,
      `"${p.placa}"`,
      `"${p.posicao}"`,
      `"${p.marcaModelo}"`,
      `"${p.dot}"`,
      p.sulcoMm,
      p.kmInstalacao,
      `"${p.dataInstalacao}"`,
      `"${p.estado}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Controle_Pneus_${config?.unidade ? config.unidade.replace(/\s+/g, "_") : "19CIPM"}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPneu) return;
    onUpdatePneu(editingPneu);
    setEditingPneu(null);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const p: RegistroPneu = {
      id: "pneu-" + Date.now(),
      prefixo: newPneu.prefixo || "",
      placa: newPneu.placa || "",
      posicao: newPneu.posicao || "Dianteiro Direito",
      marcaModelo: newPneu.marcaModelo || "",
      dot: newPneu.dot || "",
      sulcoMm: Number(newPneu.sulcoMm) || 0,
      kmInstalacao: Number(newPneu.kmInstalacao) || 0,
      dataInstalacao: newPneu.dataInstalacao || new Date().toISOString().split("T")[0],
      estado: (newPneu.estado as any) || "bom",
    };
    onAddPneu(p);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 text-slate-800">
      {/* Header Card (Cabeçalho com fundo preto e letras brancas) */}
      <div className="bg-black text-white border border-neutral-800 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-900 text-cyan-400 rounded-xl border border-neutral-700">
              <CircleDot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-white">
                Controle e Vida Útil de Pneus
              </h2>
              <p className="text-xs text-neutral-300">
                {config?.unidade || "19ª CIPM"} • Registro de DOT, profundidade de sulcos (mm), rodízio e estado de segurança
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-imprimir-pneus"
              onClick={() => triggerPrintGeneric()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition border border-neutral-600 shadow-xs cursor-pointer"
              title="Imprimir relatório de controle de pneus"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              id="btn-exportar-pneus"
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Exportar controle de pneus para planilha Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>

            <ImportExcelButton
              buttonId="btn-importar-excel-pneus"
              onImport={async (rows) => {
                const parsed = parseExcelToPneus(rows);
                if (onImportPneus) {
                  onImportPneus(parsed);
                } else {
                  parsed.forEach((p) => onAddPneu(p));
                }
              }}
              title="Importar pneus a partir de planilha Excel (.xlsx, .xls ou .csv)"
            />

            <button
              type="button"
              id="btn-novo-pneu"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Pneu</span>
            </button>
          </div>
        </div>

        <div className="mt-4 max-w-md relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por prefixo, placa, marca ou DOT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
          />
        </div>
      </div>

      {/* Table (Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-[10px] sm:text-[11px] font-extrabold tracking-wider border-b border-neutral-800 whitespace-nowrap">
                <th className="p-3">Prefixo</th>
                <th className="p-3">Placa</th>
                <th className="p-3">Posição</th>
                <th className="p-3">Marca / Medida</th>
                <th className="p-3">DOT</th>
                <th className="p-3">Sulco (mm)</th>
                <th className="p-3">KM Instalação</th>
                <th className="p-3">Data</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 italic">
                    Nenhum registro de pneu encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition whitespace-nowrap">
                    <td className="p-3 font-extrabold text-slate-900">{p.prefixo}</td>
                    <td className="p-3 font-mono font-bold text-slate-700">{p.placa}</td>
                    <td className="p-3 text-slate-800 font-medium">{p.posicao}</td>
                    <td className="p-3 text-slate-600">{p.marcaModelo}</td>
                    <td className="p-3 font-mono text-cyan-800 font-bold">{p.dot}</td>
                    <td className="p-3 font-mono font-bold">
                      <span
                        className={
                          p.sulcoMm <= 2.5
                            ? "text-red-700 font-black bg-red-50 px-1.5 py-0.5 rounded border border-red-200"
                            : p.sulcoMm <= 4.0
                            ? "text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
                            : "text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                        }
                      >
                        {p.sulcoMm.toFixed(1)} mm
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {p.kmInstalacao && p.kmInstalacao > 0 ? `${Number(p.kmInstalacao).toLocaleString("pt-BR")} KM` : "--"}
                    </td>
                    <td className="p-3 font-mono text-slate-500">{p.dataInstalacao}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.estado === "novo"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : p.estado === "bom"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : p.estado === "regular"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200 animate-pulse font-extrabold"
                        }`}
                      >
                        {p.estado === "troca_urgente" ? "TROCA URGENTE" : p.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingPneu(p)}
                          className="p-1.5 rounded bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 transition cursor-pointer"
                          title="Editar pneu"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
                          title="Excluir pneu"
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

      {/* Edit Modal */}
      {editingPneu && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Editar Registro de Pneu</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPneu(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Prefixo</label>
                  <input
                    type="text"
                    required
                    value={editingPneu.prefixo}
                    onChange={(e) =>
                      setEditingPneu({ ...editingPneu, prefixo: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-bold focus:outline-none focus:border-cyan-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Placa</label>
                  <input
                    type="text"
                    required
                    value={editingPneu.placa}
                    onChange={(e) =>
                      setEditingPneu({ ...editingPneu, placa: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono uppercase focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Posição</label>
                  <input
                    type="text"
                    required
                    value={editingPneu.posicao}
                    onChange={(e) =>
                      setEditingPneu({ ...editingPneu, posicao: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-cyan-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">DOT</label>
                  <input
                    type="text"
                    required
                    value={editingPneu.dot}
                    onChange={(e) =>
                      setEditingPneu({ ...editingPneu, dot: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-cyan-800 font-mono focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Marca / Modelo / Medida</label>
                <input
                  type="text"
                  required
                  value={editingPneu.marcaModelo}
                  onChange={(e) =>
                    setEditingPneu({ ...editingPneu, marcaModelo: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Sulco Atual (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={editingPneu.sulcoMm}
                    onChange={(e) =>
                      setEditingPneu({ ...editingPneu, sulcoMm: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-cyan-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Estado</label>
                  <select
                    value={editingPneu.estado}
                    onChange={(e) =>
                      setEditingPneu({ ...editingPneu, estado: e.target.value as any })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-cyan-600 cursor-pointer"
                  >
                    <option value="novo">Novo</option>
                    <option value="bom">Bom</option>
                    <option value="regular">Regular</option>
                    <option value="troca_urgente">Troca Urgente</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPneu(null)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Novo Registro de Pneu</h3>
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
                  <label className="block text-slate-600 mb-1 font-semibold">Prefixo *</label>
                  <input
                    type="text"
                    required
                    value={newPneu.prefixo}
                    onChange={(e) => setNewPneu({ ...newPneu, prefixo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-bold focus:outline-none focus:border-cyan-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Placa *</label>
                  <input
                    type="text"
                    required
                    value={newPneu.placa}
                    onChange={(e) => setNewPneu({ ...newPneu, placa: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono uppercase focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Posição *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Traseiro Esquerdo"
                    value={newPneu.posicao}
                    onChange={(e) => setNewPneu({ ...newPneu, posicao: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-cyan-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">DOT (Semana/Ano) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 3223"
                    value={newPneu.dot}
                    onChange={(e) => setNewPneu({ ...newPneu, dot: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-cyan-800 font-mono focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Marca e Modelo / Medida *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pirelli Scorpion 215/65 R16"
                  value={newPneu.marcaModelo}
                  onChange={(e) => setNewPneu({ ...newPneu, marcaModelo: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Sulco (mm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={newPneu.sulcoMm}
                    onChange={(e) => setNewPneu({ ...newPneu, sulcoMm: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-cyan-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">KM Instalação</label>
                  <input
                    type="number"
                    min="0"
                    value={newPneu.kmInstalacao}
                    onChange={(e) =>
                      setNewPneu({ ...newPneu, kmInstalacao: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-cyan-600"
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Cadastrar Pneu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-2xl text-slate-800">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Confirmar Exclusão</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Deseja realmente deletar este registro de pneu?
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
                  onDeletePneu(deleteConfirmId);
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
