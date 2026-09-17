import React, { useState } from "react";
import {
  Users,
  Search,
  Printer,
  Pencil,
  Trash2,
  Plus,
  X,
  Save,
  FileSpreadsheet,
  AlertTriangle,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { Usuario, ConfigSistema } from "../types";
import { exportToExcelStyled } from "../utils/formatters";
import { ImportExcelButton } from "./ImportExcelButton";
import { parseExcelToUsuarios } from "../utils/excelParsers";
import { triggerPrintGeneric } from "../utils/printHelper";

interface GerenciamentoUsuariosViewProps {
  usuarios: Usuario[];
  onAddUsuario: (u: Usuario) => void;
  onUpdateUsuario: (u: Usuario) => void;
  onDeleteUsuario: (id: string) => void;
  onImportUsuarios?: (usuarios: Usuario[]) => void;
  config?: ConfigSistema;
}

export const GerenciamentoUsuariosView: React.FC<GerenciamentoUsuariosViewProps> = ({
  usuarios,
  onAddUsuario,
  onUpdateUsuario,
  onDeleteUsuario,
  onImportUsuarios,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [newUser, setNewUser] = useState<Partial<Usuario>>({
    nome: "",
    matricula: "",
    cargoPosto: "Sd PM",
    perfil: "motorista",
    email: "",
    uop: config?.unidade || "19ªCIPM",
  });

  const filtered = usuarios.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      u.nome.toLowerCase().includes(term) ||
      u.matricula.toLowerCase().includes(term) ||
      u.cargoPosto.toLowerCase().includes(term) ||
      u.perfil.toLowerCase().includes(term)
    );
  });

  const exportToExcel = () => {
    if (usuarios.length === 0) {
      alert("Nenhum usuário cadastrado.");
      return;
    }

    const headers = ["POSTO/GRAD", "NOME COMPLETO", "MATRÍCULA", "PERFIL", "UOP", "E-MAIL"];
    const rows = filtered.map((u) => [
      u.cargoPosto,
      u.nome,
      u.matricula,
      u.perfil.toUpperCase(),
      u.uop,
      u.email || "",
    ]);

    exportToExcelStyled({
      filename: `Efetivo_Usuarios_${config?.unidade ? config.unidade.replace(/\s+/g, "_") : "19CIPM"}_${new Date().toISOString().slice(0, 10)}.xls`,
      title: `CADASTRO DE USUÁRIOS E EFETIVO - ${config?.unidade || "19ª CIPM/PARIPE"}`,
      headers,
      rows,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onUpdateUsuario(editingUser);
    setEditingUser(null);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    const u: Usuario = {
      id: "usr-" + Date.now(),
      nome: newUser.nome || "",
      matricula: newUser.matricula || "",
      cargoPosto: newUser.cargoPosto || "Sd PM",
      perfil: (newUser.perfil as any) || "motorista",
      email: newUser.email || "",
      uop: newUser.uop || config?.unidade || "19ªCIPM",
    };
    onAddUsuario(u);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 text-slate-800">
      {/* Header (Cabeçalho com fundo preto e letras brancas) */}
      <div className="bg-black text-white border border-neutral-800 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-900 text-white rounded-xl border border-neutral-700">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-white">
                Gerenciamento de Usuários e Efetivo
              </h2>
              <p className="text-xs text-neutral-300">
                {config?.unidade || "19ª CIPM"} • Controle de acesso para Administradores, Despachantes e Motoristas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-imprimir-usuarios"
              onClick={() => triggerPrintGeneric()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition border border-neutral-600 shadow-xs cursor-pointer"
              title="Imprimir relação de usuários e efetivo"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              id="btn-exportar-usuarios"
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Exportar usuários para planilha Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>

            <ImportExcelButton
              buttonId="btn-importar-excel-usuarios"
              onImport={async (rows) => {
                const parsed = parseExcelToUsuarios(rows);
                if (onImportUsuarios) {
                  onImportUsuarios(parsed);
                } else {
                  parsed.forEach((u) => onAddUsuario(u));
                }
              }}
              title="Importar usuários/efetivo a partir de planilha Excel (.xlsx, .xls ou .csv)"
            />

            <button
              type="button"
              id="btn-novo-usuario"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Policial / Usuário</span>
            </button>
          </div>
        </div>

        <div className="mt-4 max-w-md relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome, matrícula, posto ou perfil..."
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
                <th className="p-3">Posto / Graduação</th>
                <th className="p-3">Nome Completo</th>
                <th className="p-3">Matrícula</th>
                <th className="p-3">Perfil de Acesso</th>
                <th className="p-3">UOp</th>
                <th className="p-3">E-mail</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    Nenhum policial ou usuário encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition whitespace-nowrap">
                    <td className="p-3 font-semibold text-slate-700">{u.cargoPosto}</td>
                    <td className="p-3 font-bold text-slate-900 uppercase">{u.nome}</td>
                    <td className="p-3 font-mono text-slate-500">{u.matricula}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.perfil === "administrador"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : u.perfil === "despachante"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {u.perfil === "administrador" ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <UserCheck className="w-3 h-3" />
                        )}
                        {u.perfil.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-700">{u.uop}</td>
                    <td className="p-3 text-slate-500">{u.email || "--"}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingUser(u)}
                          className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
                          title="Editar usuário"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(u.id)}
                          className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
                          title="Excluir usuário"
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
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Editar Policial</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Posto / Graduação</label>
                  <input
                    type="text"
                    required
                    value={editingUser.cargoPosto}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, cargoPosto: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Matrícula</label>
                  <input
                    type="text"
                    required
                    value={editingUser.matricula}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, matricula: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editingUser.nome}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, nome: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 uppercase focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Perfil de Acesso</label>
                  <select
                    value={editingUser.perfil}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, perfil: e.target.value as any })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="motorista">Motorista</option>
                    <option value="despachante">Despachante</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">UOp</label>
                  <input
                    type="text"
                    value={editingUser.uop}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, uop: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">E-mail</label>
                <input
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Novo Policial</h3>
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
                  <label className="block text-slate-600 mb-1 font-semibold">Posto / Graduação *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sd PM / Cb PM / Sgt PM"
                    value={newUser.cargoPosto}
                    onChange={(e) => setNewUser({ ...newUser, cargoPosto: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Matrícula *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 30.123.456-7"
                    value={newUser.matricula}
                    onChange={(e) => setNewUser({ ...newUser, matricula: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo de Jesus Silva"
                  value={newUser.nome}
                  onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 uppercase focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Perfil de Acesso *</label>
                  <select
                    value={newUser.perfil}
                    onChange={(e) =>
                      setNewUser({ ...newUser, perfil: e.target.value as any })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="motorista">Motorista</option>
                    <option value="despachante">Despachante</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">UOp</label>
                  <input
                    type="text"
                    value={newUser.uop}
                    onChange={(e) => setNewUser({ ...newUser, uop: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">E-mail</label>
                <input
                  type="email"
                  placeholder="usuario@pm.ba.gov.br"
                  value={newUser.email || ""}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Cadastrar Usuário</span>
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
              Deseja realmente excluir este usuário?
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
                  onDeleteUsuario(deleteConfirmId);
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
