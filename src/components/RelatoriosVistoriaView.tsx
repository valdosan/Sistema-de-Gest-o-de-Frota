import React, { useState } from "react";
import {
  FileCheck2,
  Search,
  Printer,
  Mail,
  Edit2,
  Trash2,
  Car,
  Bike,
  AlertTriangle,
  FileSpreadsheet,
  Upload
} from "lucide-react";
import { Checklist, ConfigSistema } from "../types";
import { ChecklistA4Print } from "./ChecklistA4Print";
import { ImportExcelButton } from "./ImportExcelButton";
import { parseExcelToChecklists } from "../utils/excelParsers";
import { triggerPrintGeneric } from "../utils/printHelper";

interface RelatoriosVistoriaViewProps {
  checklists: Checklist[];
  onEditChecklist: (chk: Checklist) => void;
  onDeleteChecklist: (id: string) => void;
  onEmailChecklist: (chk: Checklist) => void;
  onImportChecklists?: (imported: Checklist[]) => void;
  config?: ConfigSistema;
}

export const RelatoriosVistoriaView: React.FC<RelatoriosVistoriaViewProps> = ({
  checklists,
  onEditChecklist,
  onDeleteChecklist,
  onEmailChecklist,
  onImportChecklists,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [filterData, setFilterData] = useState<string>("");

  // Modal for previewing A4 PDF before printing
  const [previewChecklist, setPreviewChecklist] = useState<Checklist | null>(null);

  // Delete confirmation modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter checklists
  const filtered = checklists.filter((chk) => {
    const term = searchTerm.toLowerCase();
    const matchTerm =
      !term ||
      chk.nomeCondutor.toLowerCase().includes(term) ||
      chk.prefixo.toLowerCase().includes(term) ||
      chk.placa.toLowerCase().includes(term) ||
      chk.matricula.toLowerCase().includes(term);

    const matchTipo =
      filterTipo === "todos" ||
      (filterTipo === "carro" && chk.tipoViatura === "4 rodas") ||
      (filterTipo === "moto" && chk.tipoViatura === "2 rodas");

    const matchData = !filterData || chk.dataCarga === filterData;

    return matchTerm && matchTipo && matchData;
  });

  // Export to Excel / CSV with UTF-8 BOM
  const exportToExcel = () => {
    if (checklists.length === 0) {
      alert("Nenhum registro para exportar.");
      return;
    }

    const headers = [
      "ID",
      "Tipo",
      "Data Carga",
      "Hora Carga",
      "Prefixo",
      "Placa",
      "KM Inicial",
      "Condutor",
      "Matricula",
      "UOp",
      "Turno",
      "Nivel Combustivel",
      "Total Avarias",
      "Observacoes",
      "Visto Despachante"
    ];

    const rows = checklists.map((c) => [
      c.id,
      c.tipoViatura,
      c.dataCarga,
      c.horaCarga,
      c.prefixo,
      c.placa,
      c.kmInicial,
      `"${c.nomeCondutor.replace(/"/g, '""')}"`,
      `"${c.matricula}"`,
      c.uop,
      c.turnoServico,
      c.nivelCombustivel,
      c.avarias.length,
      `"${(c.observacoes || "").replace(/"/g, '""')}"`,
      `"${(c.vistoDespachante || "").replace(/"/g, '""')}"`
    ]);

    const csvContent =
      "\uFEFF" +
      headers.join(";") +
      "\n" +
      rows.map((e) => e.join(";")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Relatorio_Vistorias_${config?.unidade ? config.unidade.replace(/\s+/g, "_") : "19CIPM"}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteChecklist(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 text-slate-800">
      {/* Header Card (Cabeçalho com fundo preto e letras brancas) */}
      <div className="bg-black text-white border border-neutral-800 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-900 text-white rounded-xl border border-neutral-700">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-white">
                Relatório de Vistorias
              </h2>
              <p className="text-xs text-neutral-300">
                {config?.unidade || "19ª CIPM"} • Registro Histórico de Checklists de Viaturas (Carro e Moto)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-imprimir-tabela-relatorios"
              onClick={() => triggerPrintGeneric()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition border border-neutral-600 shadow-xs cursor-pointer"
              title="Imprimir listagem de vistorias"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              id="btn-exportar-excel-relatorios"
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Exportar para planilha Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>

            <ImportExcelButton
              buttonId="btn-importar-excel-relatorios"
              onImport={async (rows) => {
                const parsed = parseExcelToChecklists(rows);
                if (onImportChecklists) {
                  onImportChecklists(parsed);
                }
              }}
              title="Importar vistorias/checklists a partir de planilha Excel (.xlsx, .xls ou .csv)"
            />
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              id="input-busca-relatorios"
              placeholder="Buscar por condutor, prefixo, placa ou matrícula..."
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
              <option value="todos">Todos os Veículos</option>
              <option value="carro">Apenas Viaturas 4 Rodas</option>
              <option value="moto">Apenas Motocicletas (2 Rodas)</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={filterData}
              onChange={(e) => setFilterData(e.target.value)}
              className="w-full bg-neutral-900 text-white border border-neutral-700 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-neutral-500 font-medium"
              title="Filtrar por data específica da carga"
            />
          </div>
        </div>
      </div>

      {/* Table of Checklists */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-[11px] font-extrabold tracking-wider border-b border-neutral-800">
                <th className="p-3">Tipo</th>
                <th className="p-3">Data / Hora</th>
                <th className="p-3">Prefixo</th>
                <th className="p-3">Placa</th>
                <th className="p-3">Condutor</th>
                <th className="p-3">Matrícula</th>
                <th className="p-3">KM Inicial</th>
                <th className="p-3">Combustível</th>
                <th className="p-3">Avarias</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 italic">
                    Nenhum relatório de vistoria encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((chk) => {
                  const isCarro = chk.tipoViatura === "4 rodas";

                  return (
                    <tr key={chk.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCarro
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isCarro ? <Car className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
                          {isCarro ? "4 Rodas" : "Moto"}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        <div className="font-semibold">{chk.dataCarga}</div>
                        <div className="text-[10px] text-slate-500">{chk.horaCarga}</div>
                      </td>
                      <td className="p-3 font-extrabold text-slate-900 tracking-wide">
                        {chk.prefixo}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">
                        {chk.placa}
                      </td>
                      <td className="p-3 font-semibold uppercase text-slate-800">
                        {chk.nomeCondutor}
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {chk.matricula}
                      </td>
                      <td className="p-3 font-mono font-medium">
                        {Number(chk.kmInicial || 0).toLocaleString("pt-BR")} KM
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            chk.nivelCombustivel === "R"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {chk.nivelCombustivel === "R" ? "Reserva" : `${chk.nivelCombustivel}/8`}
                        </span>
                      </td>
                      <td className="p-3">
                        {chk.avarias.length > 0 ? (
                          <span className="text-red-700 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            {chk.avarias.length}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-[11px]">Zero</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Botão Imprimir / Ver PDF A4 */}
                          <button
                            type="button"
                            onClick={() => setPreviewChecklist(chk)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                            title="Imprimir ou Salvar em PDF (A4)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Botão Enviar por E-mail */}
                          <button
                            type="button"
                            onClick={() => onEmailChecklist(chk)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
                            title="Enviar Checklist por E-mail"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {/* Botão Editar */}
                          <button
                            type="button"
                            onClick={() => onEditChecklist(chk)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer"
                            title="Editar Checklist"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Botão Excluir com confirmação */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(chk.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
                            title="Excluir este Checklist"
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
          <span>Mostrando {filtered.length} de {checklists.length} vistorias</span>
          <span className="text-[11px] text-slate-400">
            * Ao excluir um checklist, o registro criado na Carga de Viaturas é preservado.
          </span>
        </div>
      </div>

      {/* A4 Preview Modal before printing */}
      {previewChecklist && (
        <ChecklistA4Print
          checklist={previewChecklist}
          onClose={() => setPreviewChecklist(null)}
          onSendEmail={() => onEmailChecklist(previewChecklist)}
          config={config}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-md w-full shadow-2xl text-slate-800">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Confirmar Exclusão de Vistoria</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Deseja realmente deletar este registro de checklist? Esta ação não pode ser desfeita.
              O registro correspondente na Carga de Viaturas será mantido.
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
                onClick={confirmDelete}
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
