import React, { useState } from "react";
import {
  Truck,
  Search,
  Printer,
  Pencil,
  Trash2,
  FileSpreadsheet,
  Upload,
  AlertTriangle,
  Plus,
  X,
  Save
} from "lucide-react";
import { CargaViatura, ConfigSistema } from "../types";
import {
  formatPlaca,
  formatPrefixo,
  formatDateBR,
  exportToExcelStyled,
  sortCargasDesc,
} from "../utils/formatters";
import { ImportExcelButton } from "./ImportExcelButton";
import { parseExcelToCargas } from "../utils/excelParsers";
import { triggerPrintGeneric } from "../utils/printHelper";

interface CargaViaturasViewProps {
  cargas: CargaViatura[];
  onUpdateCarga: (carga: CargaViatura) => void;
  onDeleteCarga: (id: string) => void;
  onAddManualCarga: (carga: CargaViatura) => void;
  onImportCargas?: (cargas: CargaViatura[]) => void;
  config?: ConfigSistema;
}

export const CargaViaturasView: React.FC<CargaViaturasViewProps> = ({
  cargas,
  onUpdateCarga,
  onDeleteCarga,
  onAddManualCarga,
  onImportCargas,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterData, setFilterData] = useState<string>("");

  // Edit / Descarga Modal State
  const [editingCarga, setEditingCarga] = useState<CargaViatura | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Carga Modal State
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newCarga, setNewCarga] = useState<Partial<CargaViatura>>({
    dataCarga: new Date().toISOString().split("T")[0],
    horaCarga: new Date().toTimeString().slice(0, 5),
    nomeMotorista: "",
    matricula: "",
    prefixo: "9.1901",
    placa: "RPV 9G24",
    kmInicial: 0,
    uop: config?.unidade ? config.unidade.replace(/\s+/g, "") : "19ªCIPM",
    turno: "12h"
  });

  // Sort: Mais recente para o mais antigo inserido (respeitando data e hora da carga)
  const sortedCargas = sortCargasDesc(cargas);

  // Filter
  const filtered = sortedCargas.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchTerm =
      !term ||
      c.nomeMotorista.toLowerCase().includes(term) ||
      c.matricula.toLowerCase().includes(term) ||
      c.prefixo.toLowerCase().includes(term) ||
      c.placa.toLowerCase().includes(term);

    const matchData = !filterData || c.dataCarga === filterData;

    return matchTerm && matchData;
  });

  // Export to Excel formatada com cabeçalho PRETO e letras BRANCAS
  const exportToExcel = () => {
    if (cargas.length === 0) {
      alert("Nenhum registro de carga para exportar.");
      return;
    }

    const headers = [
      "1. DATA CARGA",
      "2. NOME MOTORISTA",
      "3. MATRÍCULA",
      "4. PREFIXO",
      "5. PLACA",
      "6. HORA CARGA",
      "7. KM INICIAL",
      "8. DATA DESCARGA",
      "9. HORA DESCARGA",
      "10. KM FINAL",
      "11. KM RODADO",
      "UOP",
      "TURNO"
    ];

    const rows = sortedCargas.map((c) => [
      formatDateBR(c.dataCarga),
      c.nomeMotorista,
      c.matricula,
      formatPrefixo(c.prefixo),
      formatPlaca(c.placa),
      c.horaCarga,
      c.kmInicial,
      c.dataDescarga ? formatDateBR(c.dataDescarga) : "",
      c.horaDescarga || "",
      c.kmFinal ?? "",
      c.kmRodado ?? 0,
      c.uop,
      c.turno
    ]);

    exportToExcelStyled({
      filename: `Carga_Viaturas_${config?.unidade ? config.unidade.replace(/\s+/g, "_") : "19CIPM"}_${new Date().toISOString().slice(0, 10)}.xls`,
      title: `REGISTRO GERAL DE CARGA E DESCARGA DE VIATURAS - ${config?.unidade || "19ª CIPM/PARIPE"}`,
      headers,
      rows,
    });
  };

  // Import from CSV or Spreadsheet text
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r\n|\n/);
        let importedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split by semicolon or comma or tab
          let delimiter = ";";
          if (line.includes("\t")) delimiter = "\t";
          else if (line.includes(";") && !line.includes(",")) delimiter = ";";
          else if (!line.includes(";") && line.includes(",")) delimiter = ",";

          const parts = line.split(delimiter).map((p) => p.replace(/^"|"$/g, "").trim());

          if (parts.length >= 6) {
            const dataCarga = parts[0] || new Date().toISOString().split("T")[0];
            const nomeMotorista = parts[1] || "CONDUTOR IMPORTADO";
            const matricula = parts[2] || "";
            const prefixo = parts[3] || "9.1901";
            const placa = parts[4] || "PADRÃO";
            const horaCarga = parts[5] || "08:00";
            const kmInicial = Number(parts[6]) || 0;
            const dataDescarga = parts[7] || "";
            const horaDescarga = parts[8] || "";
            const kmFinal = parts[9] ? Number(parts[9]) : null;
            const kmRodado = kmFinal && kmFinal >= kmInicial ? kmFinal - kmInicial : 0;

            const novaCarga: CargaViatura = {
              id: "crg-imp-" + Date.now() + "-" + i,
              dataCarga,
              horaCarga,
              nomeMotorista,
              matricula,
              prefixo,
              placa,
              kmInicial,
              dataDescarga,
              horaDescarga,
              kmFinal,
              kmRodado,
              uop: parts[11] || config?.unidade?.replace(/\s+/g, "") || "19ªCIPM",
              turno: parts[12] || "12h"
            };

            onAddManualCarga(novaCarga);
            importedCount++;
          }
        }

        alert(`Importação concluída! ${importedCount} registros foram acrescentados com sucesso.`);
      } catch (err) {
        alert("Erro ao importar o arquivo. Verifique o formato do arquivo CSV/planilha.");
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = "";
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCarga) return;

    let rodado = 0;
    if (editingCarga.kmFinal !== null && editingCarga.kmFinal !== undefined) {
      if (editingCarga.kmFinal < editingCarga.kmInicial) {
        alert("O KM Final da descarga não pode ser inferior ao KM Inicial.");
        return;
      }
      rodado = editingCarga.kmFinal - editingCarga.kmInicial;
    }

    const updated: CargaViatura = {
      ...editingCarga,
      kmRodado: rodado,
    };

    onUpdateCarga(updated);
    setEditingCarga(null);
  };

  const handlePrintSheet = () => {
    triggerPrintGeneric();
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 text-slate-800">
      {/* Header Card (Cabeçalho com fundo preto e letras brancas) */}
      <div className="bg-black text-white border border-neutral-800 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-neutral-900 text-white rounded-xl border border-neutral-700">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-white">
                Carga de Viaturas
              </h2>
              <p className="text-xs text-neutral-300">
                {config?.unidade || "19ª CIPM"} • Controle de Carga, Descarga e Cálculo Automático de KM Rodado
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              id="btn-imprimir-carga-viaturas"
              onClick={handlePrintSheet}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition border border-neutral-600 shadow-xs cursor-pointer"
              title="Imprimir relatório da planilha"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              type="button"
              id="btn-exportar-carga-viaturas"
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Exportar registros para planilha Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar</span>
            </button>

            <ImportExcelButton
              buttonId="btn-importar-excel-carga"
              onImport={async (rows) => {
                const parsed = parseExcelToCargas(rows);
                if (onImportCargas) {
                  onImportCargas(parsed);
                } else {
                  parsed.forEach((c) => onAddManualCarga(c));
                }
              }}
              title="Importar cargas de viatura a partir de planilha Excel (.xlsx, .xls ou .csv)"
            />

            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Lançar carga avulsa manualmente"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Carga</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar por motorista, matrícula, prefixo ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
            />
          </div>

          <div>
            <input
              type="date"
              value={filterData}
              onChange={(e) => setFilterData(e.target.value)}
              className="w-full bg-neutral-900 text-white border border-neutral-700 rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-neutral-500 cursor-pointer font-medium"
              title="Filtrar por data da carga"
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet Style Table (Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {/* Sequence 1 to 11 exactly from left to right */}
              <tr className="bg-black text-white uppercase text-[10px] sm:text-[11px] font-extrabold tracking-wider border-b border-neutral-800 whitespace-nowrap">
                <th className="p-2.5 border-r border-neutral-800">1. DATA CARGA</th>
                <th className="p-2.5 border-r border-neutral-800">2. NOME MOTORISTA</th>
                <th className="p-2.5 border-r border-neutral-800">3. MATRÍCULA</th>
                <th className="p-2.5 border-r border-neutral-800">4. PREFIXO</th>
                <th className="p-2.5 border-r border-neutral-800">5. PLACA</th>
                <th className="p-2.5 border-r border-neutral-800">6. HORA CARGA</th>
                <th className="p-2.5 border-r border-neutral-800">7. KM INICIAL</th>
                <th className="p-2.5 border-r border-neutral-800">8. DATA DESCARGA</th>
                <th className="p-2.5 border-r border-neutral-800">9. HORA DESCARGA</th>
                <th className="p-2.5 border-r border-neutral-800">10. KM FINAL</th>
                <th className="p-2.5 border-r border-neutral-800 bg-neutral-900 text-amber-400 font-black">
                  11. KM RODADO
                </th>
                <th className="p-2.5 text-center">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-400 italic">
                    Nenhum registro de carga de viatura encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const hasDescarga = c.kmFinal !== null && c.kmFinal !== undefined;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition whitespace-nowrap">
                      {/* 1. DATA DA CARGA */}
                      <td className="p-2.5 font-mono font-medium text-slate-900 border-r border-slate-100">
                        {c.dataCarga}
                      </td>

                      {/* 2. NOME DO MOTORISTA */}
                      <td className="p-2.5 font-bold uppercase text-slate-900 border-r border-slate-100">
                        {c.nomeMotorista}
                      </td>

                      {/* 3. MATRÍCULA */}
                      <td className="p-2.5 font-mono text-slate-500 border-r border-slate-100">
                        {c.matricula}
                      </td>

                      {/* 4. PREFIXO DA VIATURA */}
                      <td className="p-2.5 font-extrabold text-blue-700 border-r border-slate-100">
                        {c.prefixo}
                      </td>

                      {/* 5. PLACA */}
                      <td className="p-2.5 font-mono font-bold text-slate-700 border-r border-slate-100">
                        {c.placa}
                      </td>

                      {/* 6. HORA DA CARGA */}
                      <td className="p-2.5 font-mono text-slate-600 border-r border-slate-100">
                        {c.horaCarga}
                      </td>

                      {/* 7. KM INICIAL */}
                      <td className="p-2.5 font-mono font-bold text-slate-800 border-r border-slate-100">
                        {Number(c.kmInicial || 0).toLocaleString("pt-BR")}
                      </td>

                      {/* 8. DATA DA DESCARGA */}
                      <td className="p-2.5 font-mono text-slate-600 border-r border-slate-100">
                        {c.dataDescarga || "-"}
                      </td>

                      {/* 9. HORA DA DESCARGA */}
                      <td className="p-2.5 font-mono text-slate-600 border-r border-slate-100">
                        {c.horaDescarga || "-"}
                      </td>

                      {/* 10. KM FINAL */}
                      <td className="p-2.5 font-mono font-bold border-r border-slate-100">
                        {hasDescarga ? (
                          <span className="text-slate-900">
                            {Number(c.kmFinal || 0).toLocaleString("pt-BR")}
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Pendente
                          </span>
                        )}
                      </td>

                      {/* 11. KM RODADO (Calculado Automaticamente) */}
                      <td className="p-2.5 font-mono font-black border-r border-slate-100 bg-amber-50/50">
                        {hasDescarga ? (
                          <span className="text-emerald-700 font-extrabold text-xs">
                            +{Number(c.kmRodado || 0).toLocaleString("pt-BR")} KM
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* AÇÕES */}
                      <td className="p-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingCarga(c)}
                            className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
                            title="Editar registro de carga / Realizar Descarga de KM"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => triggerPrintGeneric()}
                            className="p-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                            title="Imprimir registro de carga"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(c.id)}
                            className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition cursor-pointer"
                            title="Excluir registro de carga"
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
          <span>{filtered.length} registro(s) de carga</span>
          <span className="font-mono text-emerald-700 text-[11px] font-medium">
            * KM Rodado = KM Final - KM Inicial computado automaticamente.
          </span>
        </div>
      </div>

      {/* Edit / Register Descarga Modal */}
      {editingCarga && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Editar Carga / Registrar Descarga
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCarga(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Prefixo *</label>
                  <input
                    type="text"
                    required
                    value={editingCarga.prefixo}
                    onChange={(e) =>
                      setEditingCarga({ ...editingCarga, prefixo: formatPrefixo(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-800 font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Placa *</label>
                  <input
                    type="text"
                    required
                    value={editingCarga.placa}
                    onChange={(e) =>
                      setEditingCarga({ ...editingCarga, placa: formatPlaca(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-800 font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Condutor *</label>
                  <input
                    type="text"
                    required
                    value={editingCarga.nomeMotorista}
                    onChange={(e) =>
                      setEditingCarga({ ...editingCarga, nomeMotorista: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 uppercase focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Matrícula *</label>
                  <input
                    type="text"
                    required
                    value={editingCarga.matricula}
                    onChange={(e) =>
                      setEditingCarga({ ...editingCarga, matricula: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Data da Carga *</label>
                  <input
                    type="date"
                    required
                    value={editingCarga.dataCarga}
                    onChange={(e) =>
                      setEditingCarga({ ...editingCarga, dataCarga: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Hora da Carga *</label>
                  <input
                    type="time"
                    required
                    value={editingCarga.horaCarga}
                    onChange={(e) =>
                      setEditingCarga({ ...editingCarga, horaCarga: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">KM Inicial *</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCarga.kmInicial}
                    onChange={(e) =>
                      setEditingCarga({ ...editingCarga, kmInicial: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-amber-700 font-bold mb-1">KM Final (Descarga) *</label>
                  <input
                    type="number"
                    min={editingCarga.kmInicial}
                    placeholder="Ex: 45350"
                    value={editingCarga.kmFinal ?? ""}
                    onChange={(e) =>
                      setEditingCarga({
                        ...editingCarga,
                        kmFinal: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full bg-white border border-amber-500 rounded p-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Data da Descarga</label>
                  <input
                    type="date"
                    value={editingCarga.dataDescarga || new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setEditingCarga({ ...editingCarga, dataDescarga: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Hora da Descarga</label>
                  <input
                    type="time"
                    value={editingCarga.horaDescarga || new Date().toTimeString().slice(0, 5)}
                    onChange={(e) =>
                      setEditingCarga({ ...editingCarga, horaDescarga: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Real-time KM Rodado preview */}
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-medium">KM Rodado Calculado:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">
                  {editingCarga.kmFinal && editingCarga.kmFinal >= editingCarga.kmInicial
                    ? `${editingCarga.kmFinal - editingCarga.kmInicial} KM`
                    : "0 KM"}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCarga(null)}
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

      {/* Manual New Carga Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Lançar Nova Carga de Viatura
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const nova: CargaViatura = {
                  id: "crg-man-" + Date.now(),
                  dataCarga: newCarga.dataCarga || new Date().toISOString().split("T")[0],
                  horaCarga: newCarga.horaCarga || "08:00",
                  nomeMotorista: newCarga.nomeMotorista || "",
                  matricula: newCarga.matricula || "",
                  prefixo: newCarga.prefixo || "9.1901",
                  placa: newCarga.placa || "RPV 9G24",
                  kmInicial: Number(newCarga.kmInicial) || 0,
                  dataDescarga: "",
                  horaDescarga: "",
                  kmFinal: null,
                  kmRodado: 0,
                  uop: newCarga.uop || config?.unidade?.replace(/\s+/g, "") || "19ªCIPM",
                  turno: newCarga.turno || "12h",
                };
                onAddManualCarga(nova);
                setShowNewModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Prefixo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 9.1901 ou R.0058"
                    value={newCarga.prefixo}
                    onChange={(e) =>
                      setNewCarga({ ...newCarga, prefixo: formatPrefixo(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 uppercase font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Placa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: RPV 9G24"
                    value={newCarga.placa}
                    onChange={(e) =>
                      setNewCarga({ ...newCarga, placa: formatPlaca(e.target.value) })
                    }
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono font-bold uppercase focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Nome do Motorista *</label>
                  <input
                    type="text"
                    required
                    value={newCarga.nomeMotorista}
                    onChange={(e) => setNewCarga({ ...newCarga, nomeMotorista: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 uppercase focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Matrícula *</label>
                  <input
                    type="text"
                    required
                    value={newCarga.matricula}
                    onChange={(e) => setNewCarga({ ...newCarga, matricula: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Data Carga</label>
                  <input
                    type="date"
                    required
                    value={newCarga.dataCarga}
                    onChange={(e) => setNewCarga({ ...newCarga, dataCarga: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Hora Carga</label>
                  <input
                    type="time"
                    required
                    value={newCarga.horaCarga}
                    onChange={(e) => setNewCarga({ ...newCarga, horaCarga: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">KM Inicial *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newCarga.kmInicial}
                    onChange={(e) => setNewCarga({ ...newCarga, kmInicial: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Cadastrar Carga</span>
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
              <h3 className="text-base font-bold text-slate-900">Confirmar Exclusão de Carga</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Deseja realmente deletar este registro de carga de viatura?
              Esta ação não pode ser desfeita.
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
                  onDeleteCarga(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Sim, Excluir Carga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
