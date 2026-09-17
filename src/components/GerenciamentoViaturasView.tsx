import React, { useState } from "react";
import {
  CarFront,
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
  XCircle,
  Car,
  Bike
} from "lucide-react";
import { Viatura, StatusViatura, ConfigSistema } from "../types";
import { formatarPlaca, formatarPrefixo } from "../constants";
import {
  formatPlaca,
  formatPrefixo,
  formatDateBR,
  exportToExcelStyled,
} from "../utils/formatters";
import { ImportExcelButton } from "./ImportExcelButton";
import { parseExcelToViaturas } from "../utils/excelParsers";
import { triggerPrintGeneric } from "../utils/printHelper";

interface GerenciamentoViaturasViewProps {
  viaturas: Viatura[];
  onAddViatura: (v: Viatura) => void;
  onUpdateViatura: (v: Viatura) => void;
  onDeleteViatura: (id: string) => void;
  onImportViaturas?: (viaturas: Viatura[]) => void;
  config?: ConfigSistema;
}

export const GerenciamentoViaturasView: React.FC<GerenciamentoViaturasViewProps> = ({
  viaturas,
  onAddViatura,
  onUpdateViatura,
  onDeleteViatura,
  onImportViaturas,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

  const [editingViatura, setEditingViatura] = useState<Viatura | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [newViatura, setNewViatura] = useState<Partial<Viatura>>({
    prefixo: "9.1925",
    placa: "RPV 9G25",
    modelo: "Renault Duster",
    tipo: "carro",
    ano: "2023",
    status: "disponivel",
    kmAtual: 30000,
    uop: config?.unidade || "19ªCIPM",
  });

  const filtered = viaturas.filter((v) => {
    const term = searchTerm.toLowerCase();
    const matchTerm =
      !term ||
      v.prefixo.toLowerCase().includes(term) ||
      v.placa.toLowerCase().includes(term) ||
      v.modelo.toLowerCase().includes(term);

    const matchTipo =
      filterTipo === "todos" ||
      (filterTipo === "carro" && v.tipo !== "moto") ||
      (filterTipo === "moto" && v.tipo === "moto");

    const matchStatus = filterStatus === "todos" || v.status === filterStatus;

    return matchTerm && matchTipo && matchStatus;
  });

  const exportToExcel = () => {
    if (viaturas.length === 0) {
      alert("Nenhuma viatura para exportar.");
      return;
    }

    const headers = [
      "PREFIXO",
      "PLACA",
      "MARCA",
      "MODELO",
      "TIPO",
      "ANO",
      "STATUS",
      "KM ATUAL",
      "UOP"
    ];

    const rows = filtered.map((v) => [
      formatPrefixo(v.prefixo),
      formatPlaca(v.placa),
      v.marca || "PMBA",
      v.modelo,
      v.tipo,
      v.ano,
      v.status,
      v.kmAtual,
      v.uop || config?.unidade || "19ª CIPM",
    ]);

    exportToExcelStyled({
      filename: `Viaturas_${config?.unidade ? config.unidade.replace(/\s+/g, "_") : "19CIPM"}_${new Date().toISOString().slice(0, 10)}.xls`,
      title: `CADASTRO GERAL DE VIATURAS - ${config?.unidade || "19ª CIPM/PARIPE"}`,
      headers,
      rows,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingViatura) return;
    onUpdateViatura(editingViatura);
    setEditingViatura(null);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const v: Viatura = {
      id: "v-" + Date.now(),
      prefixo: formatarPrefixo(newViatura.prefixo || ""),
      placa: formatarPlaca(newViatura.placa || ""),
      marca: newViatura.marca || "PMBA",
      modelo: newViatura.modelo || "",
      tipo: (newViatura.tipo as any) || "carro",
      ano: newViatura.ano || "2023",
      status: (newViatura.status as any) || "disponivel",
      kmAtual: Number(newViatura.kmAtual) || 0,
      uop: newViatura.uop || config?.unidade || "19ªCIPM",
      dataAquisicao: newViatura.dataAquisicao || new Date().toISOString().split("T")[0],
    };
    onAddViatura(v);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 text-slate-800">
      {/* Header (Cabeçalho com fundo preto e letras brancas) */}
      <div className="bg-black text-white border border-neutral-800 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-900 text-white rounded-xl border border-neutral-700">
              <CarFront className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-white">
                Gerenciamento de Viaturas da {config?.unidade || "19ª CIPM"}
              </h2>
              <p className="text-xs text-neutral-300">
                Cadastro da frota operacional (prefixos, placas, quilometragem e disponibilidade)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-imprimir-viaturas"
              onClick={() => triggerPrintGeneric()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition border border-neutral-600 shadow-xs cursor-pointer"
              title="Imprimir relação de viaturas"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              id="btn-exportar-viaturas"
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Exportar frota para planilha Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>

            <ImportExcelButton
              buttonId="btn-importar-excel-viaturas"
              onImport={async (rows) => {
                const parsed = parseExcelToViaturas(rows);
                if (onImportViaturas) {
                  onImportViaturas(parsed);
                } else {
                  parsed.forEach((v) => onAddViatura(v));
                }
              }}
              title="Importar viaturas a partir de planilha Excel (.xlsx, .xls ou .csv)"
            />

            <button
              type="button"
              id="btn-nova-viatura"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Viatura</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por prefixo, placa ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
            />
          </div>

          <div>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full bg-neutral-900 text-white border border-neutral-700 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-neutral-500 cursor-pointer font-medium"
            >
              <option value="todos">Todos os Tipos (Carros e Motos)</option>
              <option value="carro">Apenas Viaturas 4 Rodas</option>
              <option value="moto">Apenas Motocicletas (2 Rodas)</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-neutral-900 text-white border border-neutral-700 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-neutral-500 cursor-pointer font-medium"
            >
              <option value="todos">Todos os Status</option>
              <option value="disponivel">Disponíveis (Verde)</option>
              <option value="indisponivel">Indisponíveis / Em Operação (Vermelho)</option>
              <option value="manutencao">Em Manutenção (Amarelo)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table (Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-[10px] sm:text-[11px] font-extrabold tracking-wider border-b border-neutral-800 whitespace-nowrap">
                <th className="p-3">Tipo</th>
                <th className="p-3">Prefixo</th>
                <th className="p-3">Placa</th>
                <th className="p-3">Modelo</th>
                <th className="p-3">Ano</th>
                <th className="p-3">KM Atual</th>
                <th className="p-3">UOp</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 italic">
                    Nenhuma viatura encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition whitespace-nowrap">
                    <td className="p-3">
                      {v.tipo === "moto" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Bike className="w-3.5 h-3.5" /> Moto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Car className="w-3.5 h-3.5" /> Carro
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-extrabold text-slate-900">{v.prefixo}</td>
                    <td className="p-3 font-mono font-bold text-slate-700">{v.placa}</td>
                    <td className="p-3 font-semibold text-slate-800">{v.modelo}</td>
                    <td className="p-3 font-mono text-slate-500">{v.ano}</td>
                    <td className="p-3 font-mono font-bold text-blue-700">
                      {Number(v.kmAtual || 0).toLocaleString("pt-BR")} KM
                    </td>
                    <td className="p-3 text-slate-600">{v.uop}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === "disponivel"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : v.status === "indisponivel"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {v.status === "disponivel" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Disponível
                          </>
                        ) : v.status === "indisponivel" ? (
                          <>
                            <XCircle className="w-3 h-3" /> Indisponível
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" /> Manutenção
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingViatura(v)}
                          className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
                          title="Editar viatura"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(v.id)}
                          className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
                          title="Excluir viatura"
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
      {editingViatura && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Editar Viatura</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingViatura(null)}
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
                    value={editingViatura.prefixo}
                    onChange={(e) =>
                      setEditingViatura({ ...editingViatura, prefixo: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Placa</label>
                  <input
                    type="text"
                    required
                    value={editingViatura.placa}
                    onChange={(e) =>
                      setEditingViatura({ ...editingViatura, placa: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono uppercase focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Modelo</label>
                  <input
                    type="text"
                    required
                    value={editingViatura.modelo}
                    onChange={(e) =>
                      setEditingViatura({ ...editingViatura, modelo: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Ano</label>
                  <input
                    type="text"
                    value={editingViatura.ano}
                    onChange={(e) =>
                      setEditingViatura({ ...editingViatura, ano: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Tipo</label>
                  <select
                    value={editingViatura.tipo}
                    onChange={(e) =>
                      setEditingViatura({ ...editingViatura, tipo: e.target.value as any })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="carro">Carro (4 Rodas)</option>
                    <option value="moto">Moto (2 Rodas)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Status</label>
                  <select
                    value={editingViatura.status}
                    onChange={(e) =>
                      setEditingViatura({ ...editingViatura, status: e.target.value as any })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="indisponivel">Indisponível</option>
                    <option value="manutencao">Manutenção</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">KM Atual</label>
                  <input
                    type="number"
                    min="0"
                    value={editingViatura.kmAtual}
                    onChange={(e) =>
                      setEditingViatura({ ...editingViatura, kmAtual: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingViatura(null)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer"
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
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Nova Viatura</h3>
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
                    placeholder="Ex: 9.1901"
                    value={newViatura.prefixo}
                    onChange={(e) =>
                      setNewViatura({ ...newViatura, prefixo: formatarPrefixo(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Placa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: RPV 9G24"
                    value={newViatura.placa}
                    onChange={(e) =>
                      setNewViatura({ ...newViatura, placa: formatarPlaca(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono uppercase focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Renault Duster / Yamaha Lander"
                    value={newViatura.modelo}
                    onChange={(e) => setNewViatura({ ...newViatura, modelo: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Ano</label>
                  <input
                    type="text"
                    value={newViatura.ano}
                    onChange={(e) => setNewViatura({ ...newViatura, ano: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Tipo</label>
                  <select
                    value={newViatura.tipo}
                    onChange={(e) =>
                      setNewViatura({ ...newViatura, tipo: e.target.value as any })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="carro">Carro (4 Rodas)</option>
                    <option value="moto">Moto (2 Rodas)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Status</label>
                  <select
                    value={newViatura.status}
                    onChange={(e) =>
                      setNewViatura({ ...newViatura, status: e.target.value as any })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="indisponivel">Indisponível</option>
                    <option value="manutencao">Manutenção</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">KM Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={newViatura.kmAtual}
                    onChange={(e) =>
                      setNewViatura({ ...newViatura, kmAtual: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Cadastrar Viatura</span>
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
              Deseja realmente deletar esta viatura da frota?
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
                  onDeleteViatura(deleteConfirmId);
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
