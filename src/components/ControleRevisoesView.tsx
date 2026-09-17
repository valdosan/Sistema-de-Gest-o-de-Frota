import React, { useState } from "react";
import {
  Wrench,
  Search,
  Printer,
  Pencil,
  Trash2,
  Plus,
  X,
  Save,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { RevisaoViatura, ConfigSistema } from "../types";
import {
  formatPlaca,
  formatPrefixo,
  formatDateBR,
  exportToExcelStyled,
} from "../utils/formatters";
import { ImportExcelButton } from "./ImportExcelButton";
import { parseExcelToRevisoes } from "../utils/excelParsers";
import { triggerPrintGeneric } from "../utils/printHelper";

interface ControleRevisoesViewProps {
  revisoes: RevisaoViatura[];
  onAddRevisao: (rev: RevisaoViatura) => void;
  onUpdateRevisao: (rev: RevisaoViatura) => void;
  onDeleteRevisao: (id: string) => void;
  onImportRevisoes?: (revisoes: RevisaoViatura[]) => void;
  config?: ConfigSistema;
}

export const ControleRevisoesView: React.FC<ControleRevisoesViewProps> = ({
  revisoes,
  onAddRevisao,
  onUpdateRevisao,
  onDeleteRevisao,
  onImportRevisoes,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingRev, setEditingRev] = useState<RevisaoViatura | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [newRev, setNewRev] = useState<Partial<RevisaoViatura>>({
    prefixo: "9.1901",
    placa: "RPV 9G24",
    tipoServico: "Troca de Óleo e Filtros",
    kmUltimaRevisao: 40000,
    kmProximaRevisao: 50000,
    dataProximaRevisao: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
    status: "agendada",
    observacoes: "Revisão periódica preventiva programada",
  });

  const filtered = revisoes.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      r.prefixo.toLowerCase().includes(term) ||
      r.placa.toLowerCase().includes(term) ||
      r.tipoServico.toLowerCase().includes(term)
    );
  });

  const exportToExcel = () => {
    if (revisoes.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }

    const headers = [
      "PREFIXO",
      "PLACA",
      "SERVIÇO",
      "KM ÚLTIMA REVISÃO",
      "KM PRÓXIMA REVISÃO",
      "DATA PREVISTA",
      "STATUS",
      "OBSERVAÇÕES"
    ];

    const rows = filtered.map((r) => [
      formatPrefixo(r.prefixo),
      formatPlaca(r.placa),
      r.tipoServico,
      r.kmUltimaRevisao,
      r.kmProximaRevisao,
      formatDateBR(r.dataProximaRevisao),
      r.status,
      r.observacoes || ""
    ]);

    exportToExcelStyled({
      filename: `Controle_Revisoes_${config?.unidade ? config.unidade.replace(/\s+/g, "_") : "19CIPM"}_${new Date().toISOString().slice(0, 10)}.xls`,
      title: `CONTROLE DE REVISÕES PERIÓDICAS - ${config?.unidade || "19ª CIPM/PARIPE"}`,
      headers,
      rows,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRev) return;
    onUpdateRevisao(editingRev);
    setEditingRev(null);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const r: RevisaoViatura = {
      id: "rev-" + Date.now(),
      prefixo: newRev.prefixo || "",
      placa: newRev.placa || "",
      tipoServico: newRev.tipoServico || "",
      kmUltimaRevisao: Number(newRev.kmUltimaRevisao) || 0,
      kmProximaRevisao: Number(newRev.kmProximaRevisao) || 0,
      dataProximaRevisao: newRev.dataProximaRevisao || "",
      oficina: (newRev as any).oficina || "Oficina Central DAL / PMBA",
      status: (newRev.status as any) || "agendada",
      observacoes: newRev.observacoes || "",
    };
    onAddRevisao(r);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 text-slate-800">
      {/* Header Card (Cabeçalho com fundo preto e letras brancas) */}
      <div className="bg-black text-white border border-neutral-800 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-900 text-amber-400 rounded-xl border border-neutral-700">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-white">
                Controle de Revisões Preventivas e Corretivas
              </h2>
              <p className="text-xs text-neutral-300">
                {config?.unidade || "19ª CIPM"} • Acompanhamento de KM limite, trocas de óleo, filtros e manutenções programadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-imprimir-revisoes"
              onClick={() => triggerPrintGeneric()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition border border-neutral-600 shadow-xs cursor-pointer"
              title="Imprimir relatório de revisões"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              id="btn-exportar-revisoes"
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Exportar revisões para planilha Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>

            <ImportExcelButton
              buttonId="btn-importar-excel-revisoes"
              onImport={async (rows) => {
                const parsed = parseExcelToRevisoes(rows);
                if (onImportRevisoes) {
                  onImportRevisoes(parsed);
                } else {
                  parsed.forEach((r) => onAddRevisao(r));
                }
              }}
              title="Importar revisões a partir de planilha Excel (.xlsx, .xls ou .csv)"
            />

            <button
              type="button"
              id="btn-agendar-revisao"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar Revisão</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 max-w-md relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por prefixo, placa ou tipo de serviço..."
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
                <th className="p-3">Tipo de Serviço</th>
                <th className="p-3">KM Última Revisão</th>
                <th className="p-3">KM Próxima Revisão</th>
                <th className="p-3">Previsão</th>
                <th className="p-3">Status</th>
                <th className="p-3">Observações</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                    Nenhum registro de revisão cadastrado.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition whitespace-nowrap">
                    <td className="p-3 font-extrabold text-slate-900">{r.prefixo}</td>
                    <td className="p-3 font-mono font-bold text-slate-700">{r.placa}</td>
                    <td className="p-3 font-semibold text-slate-800">{r.tipoServico}</td>
                    <td className="p-3 font-mono">{Number(r.kmUltimaRevisao || 0).toLocaleString("pt-BR")} KM</td>
                    <td className="p-3 font-mono font-bold text-amber-700">
                      {Number(r.kmProximaRevisao || 0).toLocaleString("pt-BR")} KM
                    </td>
                    <td className="p-3 font-mono text-slate-600">{r.dataProximaRevisao}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === "concluida"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : r.status === "vencida"
                            ? "bg-red-50 text-red-700 border border-red-200 animate-pulse"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {r.status === "concluida" && <CheckCircle2 className="w-3 h-3" />}
                        {r.status === "vencida" && <AlertTriangle className="w-3 h-3" />}
                        {r.status === "agendada" && <Clock className="w-3 h-3" />}
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs truncate text-slate-500" title={r.observacoes}>
                      {r.observacoes || "--"}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingRev(r)}
                          className="p-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer"
                          title="Editar revisão"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(r.id)}
                          className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
                          title="Excluir revisão"
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
      {editingRev && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Editar Revisão</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRev(null)}
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
                    value={editingRev.prefixo}
                    onChange={(e) => setEditingRev({ ...editingRev, prefixo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Placa</label>
                  <input
                    type="text"
                    required
                    value={editingRev.placa}
                    onChange={(e) => setEditingRev({ ...editingRev, placa: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono uppercase focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Tipo de Serviço</label>
                <input
                  type="text"
                  required
                  value={editingRev.tipoServico}
                  onChange={(e) => setEditingRev({ ...editingRev, tipoServico: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">KM Última</label>
                  <input
                    type="number"
                    value={editingRev.kmUltimaRevisao}
                    onChange={(e) =>
                      setEditingRev({ ...editingRev, kmUltimaRevisao: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">KM Próxima *</label>
                  <input
                    type="number"
                    required
                    value={editingRev.kmProximaRevisao}
                    onChange={(e) =>
                      setEditingRev({ ...editingRev, kmProximaRevisao: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-amber-700 font-mono font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Data Prevista *</label>
                  <input
                    type="date"
                    required
                    value={editingRev.dataProximaRevisao}
                    onChange={(e) =>
                      setEditingRev({ ...editingRev, dataProximaRevisao: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Status</label>
                  <select
                    value={editingRev.status}
                    onChange={(e) =>
                      setEditingRev({ ...editingRev, status: e.target.value as any })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-amber-600 cursor-pointer"
                  >
                    <option value="agendada">Agendada</option>
                    <option value="concluida">Concluída</option>
                    <option value="vencida">Vencida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Oficina Indicada</label>
                  <input
                    type="text"
                    value={editingRev.oficina || ""}
                    onChange={(e) => setEditingRev({ ...editingRev, oficina: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Observações</label>
                <textarea
                  rows={2}
                  value={editingRev.observacoes || ""}
                  onChange={(e) => setEditingRev({ ...editingRev, observacoes: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingRev(null)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
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
                <Plus className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Agendar Nova Revisão</h3>
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
                    value={newRev.prefixo}
                    onChange={(e) => setNewRev({ ...newRev, prefixo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Placa *</label>
                  <input
                    type="text"
                    required
                    value={newRev.placa}
                    onChange={(e) => setNewRev({ ...newRev, placa: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono uppercase focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Tipo de Serviço *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Troca de pastilhas de freio e óleo"
                  value={newRev.tipoServico}
                  onChange={(e) => setNewRev({ ...newRev, tipoServico: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">KM Última</label>
                  <input
                    type="number"
                    value={newRev.kmUltimaRevisao}
                    onChange={(e) =>
                      setNewRev({ ...newRev, kmUltimaRevisao: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">KM Próxima *</label>
                  <input
                    type="number"
                    required
                    value={newRev.kmProximaRevisao}
                    onChange={(e) =>
                      setNewRev({ ...newRev, kmProximaRevisao: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-amber-700 font-mono font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Data Prevista *</label>
                  <input
                    type="date"
                    required
                    value={newRev.dataProximaRevisao}
                    onChange={(e) =>
                      setNewRev({ ...newRev, dataProximaRevisao: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes ou oficina indicada..."
                  value={newRev.observacoes}
                  onChange={(e) => setNewRev({ ...newRev, observacoes: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-amber-600"
                />
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Cadastrar Revisão</span>
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
              Deseja realmente deletar este registro de revisão?
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
                  onDeleteRevisao(deleteConfirmId);
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
