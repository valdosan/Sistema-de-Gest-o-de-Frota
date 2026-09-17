import React, { useState } from "react";
import {
  Package,
  Search,
  Printer,
  Pencil,
  Trash2,
  Plus,
  X,
  Save,
  FileSpreadsheet,
  AlertTriangle
} from "lucide-react";
import { ItemInventario, ConfigSistema } from "../types";
import { formatDateBR, exportToExcelStyled } from "../utils/formatters";
import { ImportExcelButton } from "./ImportExcelButton";
import { parseExcelToMateriais } from "../utils/excelParsers";
import { triggerPrintGeneric } from "../utils/printHelper";

interface InventarioMateriaisViewProps {
  inventario?: ItemInventario[];
  itens?: ItemInventario[];
  onAddItem: (item: ItemInventario) => void;
  onUpdateItem: (item: ItemInventario) => void;
  onDeleteItem: (id: string) => void;
  onImportInventario?: (items: ItemInventario[]) => void;
  config?: ConfigSistema;
}

export const InventarioMateriaisView: React.FC<InventarioMateriaisViewProps> = ({
  inventario,
  itens,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onImportInventario,
  config,
}) => {
  const listaInventario = inventario || itens || [];
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingItem, setEditingItem] = useState<ItemInventario | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [newItem, setNewItem] = useState<Partial<ItemInventario>>({
    codigoPatrimonio: "MAT-001",
    descricao: "Lanterna Tática Recarregável",
    categoria: "Equipamento Operacional",
    quantidade: 10,
    estadoConservacao: "Novo",
    localizacao: `Reserva de Armamento ${config?.unidade || "19ª CIPM"}`,
    dataAquisicao: new Date().toISOString().split("T")[0],
  });

  const filtered = listaInventario.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      item.descricao.toLowerCase().includes(term) ||
      item.codigoPatrimonio.toLowerCase().includes(term) ||
      item.categoria.toLowerCase().includes(term) ||
      item.localizacao.toLowerCase().includes(term)
    );
  });

  const exportToExcel = () => {
    if (listaInventario.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }

    const headers = [
      "PATRIMÔNIO",
      "DESCRIÇÃO",
      "CATEGORIA",
      "QUANTIDADE",
      "CONSERVAÇÃO",
      "LOCALIZAÇÃO",
      "DATA AQUISIÇÃO"
    ];

    const rows = filtered.map((item) => [
      item.codigoPatrimonio,
      item.descricao,
      item.categoria,
      item.quantidade,
      item.estadoConservacao,
      item.localizacao,
      formatDateBR(item.dataAquisicao)
    ]);

    exportToExcelStyled({
      filename: `Inventario_Materiais_${config?.unidade ? config.unidade.replace(/\s+/g, "_") : "19CIPM"}_${new Date().toISOString().slice(0, 10)}.xls`,
      title: `CONTROLE DE ESTOQUE E INVENTÁRIO - ${config?.unidade || "19ª CIPM/PARIPE"}`,
      headers,
      rows,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdateItem(editingItem);
    setEditingItem(null);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const item: ItemInventario = {
      id: "mat-" + Date.now(),
      codigoPatrimonio: newItem.codigoPatrimonio || "",
      descricao: newItem.descricao || "",
      categoria: newItem.categoria || "Geral",
      quantidade: Number(newItem.quantidade) || 1,
      estadoConservacao: newItem.estadoConservacao || "Bom",
      localizacao: newItem.localizacao || "Reserva de Armamento",
      dataAquisicao: newItem.dataAquisicao || new Date().toISOString().split("T")[0],
    };
    onAddItem(item);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 text-slate-800">
      {/* Header Card (Cabeçalho com fundo preto e letras brancas) */}
      <div className="bg-black text-white border border-neutral-800 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-900 text-purple-400 rounded-xl border border-neutral-700">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-white">
                Inventário de Materiais e Carga Bélica
              </h2>
              <p className="text-xs text-neutral-300">
                {config?.unidade || "19ª CIPM"} • Registro de itens patrimoniais, rádios HT, cones, lanternas e equipamentos de bordo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-imprimir-inventario"
              onClick={() => triggerPrintGeneric()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition border border-neutral-600 shadow-xs cursor-pointer"
              title="Imprimir relatório de inventário"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              id="btn-exportar-inventario"
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Exportar inventário para planilha Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>

            <ImportExcelButton
              buttonId="btn-importar-excel-inventario"
              onImport={async (rows) => {
                const parsed = parseExcelToMateriais(rows);
                if (onImportInventario) {
                  onImportInventario(parsed);
                } else {
                  parsed.forEach((item) => onAddItem(item));
                }
              }}
              title="Importar inventário a partir de planilha Excel (.xlsx, .xls ou .csv)"
            />

            <button
              type="button"
              id="btn-novo-item-inventario"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Item</span>
            </button>
          </div>
        </div>

        <div className="mt-4 max-w-md relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por descrição, patrimônio, categoria..."
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
                <th className="p-3">Patrimônio</th>
                <th className="p-3">Descrição do Material</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Qtd</th>
                <th className="p-3">Conservação</th>
                <th className="p-3">Localização</th>
                <th className="p-3">Data Registro</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                    Nenhum material encontrado no inventário.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition whitespace-nowrap">
                    <td className="p-3 font-mono font-bold text-slate-900">{item.codigoPatrimonio}</td>
                    <td className="p-3 font-semibold text-slate-800">{item.descricao}</td>
                    <td className="p-3 text-slate-600">{item.categoria}</td>
                    <td className="p-3 font-mono font-bold text-purple-700">{item.quantidade}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.estadoConservacao}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{item.localizacao}</td>
                    <td className="p-3 font-mono text-slate-500">{item.dataAquisicao}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer"
                          title="Editar item"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
                          title="Excluir item"
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
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Editar Material</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Cód. Patrimônio</label>
                  <input
                    type="text"
                    required
                    value={editingItem.codigoPatrimonio}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, codigoPatrimonio: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Categoria</label>
                  <input
                    type="text"
                    required
                    value={editingItem.categoria}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, categoria: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Descrição do Material</label>
                <input
                  type="text"
                  required
                  value={editingItem.descricao}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, descricao: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingItem.quantidade}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, quantidade: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Estado de Conservação</label>
                  <select
                    value={editingItem.estadoConservacao}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, estadoConservacao: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                  >
                    <option value="Novo">Novo</option>
                    <option value="Bom">Bom</option>
                    <option value="Regular">Regular</option>
                    <option value="Danificado / Inservível">Danificado / Inservível</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Localização Física</label>
                <input
                  type="text"
                  required
                  value={editingItem.localizacao}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, localizacao: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs cursor-pointer"
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
                <Plus className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Cadastrar Novo Item</h3>
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
                  <label className="block text-slate-600 mb-1 font-semibold">Cód. Patrimônio *</label>
                  <input
                    type="text"
                    required
                    value={newItem.codigoPatrimonio}
                    onChange={(e) => setNewItem({ ...newItem, codigoPatrimonio: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Categoria *</label>
                  <input
                    type="text"
                    required
                    value={newItem.categoria}
                    onChange={(e) => setNewItem({ ...newItem, categoria: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Descrição do Material *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Colete Balístico Nível III-A"
                  value={newItem.descricao}
                  onChange={(e) => setNewItem({ ...newItem, descricao: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Quantidade *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItem.quantidade}
                    onChange={(e) => setNewItem({ ...newItem, quantidade: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Estado de Conservação *</label>
                  <select
                    value={newItem.estadoConservacao}
                    onChange={(e) => setNewItem({ ...newItem, estadoConservacao: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-purple-600 cursor-pointer"
                  >
                    <option value="Novo">Novo</option>
                    <option value="Bom">Bom</option>
                    <option value="Regular">Regular</option>
                    <option value="Danificado / Inservível">Danificado / Inservível</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Localização Física *</label>
                <input
                  type="text"
                  required
                  value={newItem.localizacao}
                  onChange={(e) => setNewItem({ ...newItem, localizacao: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-purple-600"
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Cadastrar Item</span>
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
              Deseja realmente deletar este item do inventário?
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
                  onDeleteItem(deleteConfirmId);
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
