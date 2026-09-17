import React, { useRef, useState } from "react";
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { parseExcelFile } from "../utils/excelImport";

interface ImportExcelButtonProps {
  onImport: (rows: Array<Record<string, any>>) => void | Promise<void>;
  title?: string;
  label?: string;
  className?: string;
  buttonId?: string;
}

export const ImportExcelButton: React.FC<ImportExcelButtonProps> = ({
  onImport,
  title = "Importar dados a partir de planilha Excel (.xlsx, .xls ou .csv)",
  label = "Importar Excel",
  className = "flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer",
  buttonId,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleClick = () => {
    setStatusMessage(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const rows = await parseExcelFile(file);
      if (rows.length === 0) {
        setStatusMessage({
          type: "error",
          text: "Planilha vazia ou sem linhas de dados reconhecidas.",
        });
        setLoading(false);
        return;
      }

      await onImport(rows);
      setStatusMessage({
        type: "success",
        text: `${rows.length} registro(s) lido(s) com sucesso!`,
      });

      // Limpar mensagem após 4 segundos
      setTimeout(() => {
        setStatusMessage(null);
      }, 4000);
    } catch (error: any) {
      console.error("Erro ao importar planilha:", error);
      setStatusMessage({
        type: "error",
        text: error?.message || "Erro ao processar o arquivo Excel.",
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        id={buttonId}
        type="button"
        onClick={handleClick}
        disabled={loading}
        title={title}
        className={`${className} ${loading ? "opacity-75 cursor-wait" : ""}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <Upload className="w-4 h-4 text-white" />
        )}
        <span>{loading ? "Importando..." : label}</span>
      </button>

      {statusMessage && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-50 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg whitespace-nowrap flex items-center gap-1.5 border animate-in fade-in slide-in-from-top-1 ${
            statusMessage.type === "success"
              ? "bg-emerald-800 text-white border-emerald-600"
              : "bg-red-800 text-white border-red-600"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-red-300 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
};
