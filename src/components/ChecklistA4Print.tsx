import React, { useState } from "react";
import { Checklist, ConfigSistema } from "../types";
import { Brasao19CIPM, BrasaoPMBA } from "./Brasoes";
import {
  Printer,
  Mail,
  X,
  Layers,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Fuel,
} from "lucide-react";
import { triggerPrintDocument } from "../utils/printHelper";

interface ChecklistA4PrintProps {
  checklist: Checklist;
  onClose?: () => void;
  onSendEmail?: () => void;
  config?: ConfigSistema;
}

export const ChecklistA4Print: React.FC<ChecklistA4PrintProps> = ({
  checklist,
  onClose,
  onSendEmail,
  config,
}) => {
  const handlePrint = () => {
    triggerPrintDocument(
      "checklist-a4-sheet",
      `Checklist_${checklist.prefixo}_${checklist.placa}_${checklist.dataCarga}`
    );
  };

  const isCarro = checklist.tipoViatura === "4 rodas";

  const activeDiagramaUrl =
    checklist.diagramaUrl ||
    (isCarro
      ? config?.diagramaCarroUrl || "/assets/viatura_carro_duster.jpg"
      : config?.diagramaMotoUrl || "/assets/viatura_moto_pmba.jpg");

  const orgaoSuperior = config?.orgaoSuperior || "POLÍCIA MILITAR DA BAHIA";
  const comandoRegional =
    config?.comandoRegional ||
    "COMANDO DE POLICIAMENTO REGIONAL DA CAPITAL - BTS";
  const unidade =
    config?.unidade || "19ª COMPANHIA INDEPENDENTE DE POLÍCIA MILITAR - PARIPE";
  const subTitle = config?.subTitle || "PARIPE • O GUARDIÃO DO SUBÚRBIO";

  // State to control print sections selection
  const [printSections, setPrintSections] = useState({
    cabecalho: true,
    dadosCarga: true,
    itensVerificacao: true,
    nivelCombustivel: true,
    diagramaAvarias: true,
    observacoes: true,
    assinaturas: true,
  });

  const toggleSection = (key: keyof typeof printSections) => {
    setPrintSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAll = () => {
    setPrintSections({
      cabecalho: true,
      dadosCarga: true,
      itensVerificacao: true,
      nivelCombustivel: true,
      diagramaAvarias: true,
      observacoes: true,
      assinaturas: true,
    });
  };

  const deselectAll = () => {
    setPrintSections({
      cabecalho: false,
      dadosCarga: false,
      itensVerificacao: false,
      nivelCombustivel: false,
      diagramaAvarias: false,
      observacoes: false,
      assinaturas: false,
    });
  };

  const isAllSelected = Object.values(printSections).every(Boolean);

  return (
    <div className="bg-slate-900/80 backdrop-blur-xs fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 flex flex-col items-center">
      {/* Action & Selection Toolbar on Screen (hidden during print) */}
      <div className="w-full max-w-[210mm] bg-white border border-slate-200 rounded-xl p-3 sm:p-4 mb-4 shadow-xl print:hidden">
        {/* Top bar with titles and primary buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Visualização & Impressão - Checklist A4
            </span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-mono font-bold">
              {checklist.prefixo} • {checklist.placa}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onSendEmail && (
              <button
                type="button"
                onClick={onSendEmail}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                title="Enviar por E-mail"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar E-mail</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Imprimir ou Salvar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Gerar PDF (A4)</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg border border-slate-300 transition cursor-pointer"
                title="Fechar visualização"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Section selection for PDF / Print */}
        <div className="pt-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase">
              <Layers className="w-4 h-4 text-blue-700" />
              <span>Escolha as seções do formulário para imprimir / salvar no PDF:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className={`text-xs font-bold px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer ${
                  isAllSelected
                    ? "bg-blue-700 text-white shadow-xs"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Selecionar Todo o Formulário (com Fotos/Imagens)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-xs">
            <label className={`flex items-center gap-1.5 p-2 rounded border cursor-pointer select-none transition ${
              printSections.cabecalho ? "bg-slate-100 border-slate-400 font-semibold text-slate-900" : "bg-white border-slate-200 text-slate-500 opacity-60"
            }`}>
              <input
                type="checkbox"
                checked={printSections.cabecalho}
                onChange={() => toggleSection("cabecalho")}
                className="rounded text-blue-700 focus:ring-blue-600"
              />
              <span>Cabeçalho</span>
            </label>

            <label className={`flex items-center gap-1.5 p-2 rounded border cursor-pointer select-none transition ${
              printSections.dadosCarga ? "bg-slate-100 border-slate-400 font-semibold text-slate-900" : "bg-white border-slate-200 text-slate-500 opacity-60"
            }`}>
              <input
                type="checkbox"
                checked={printSections.dadosCarga}
                onChange={() => toggleSection("dadosCarga")}
                className="rounded text-blue-700 focus:ring-blue-600"
              />
              <span>1. Carga</span>
            </label>

            <label className={`flex items-center gap-1.5 p-2 rounded border cursor-pointer select-none transition ${
              printSections.itensVerificacao ? "bg-slate-100 border-slate-400 font-semibold text-slate-900" : "bg-white border-slate-200 text-slate-500 opacity-60"
            }`}>
              <input
                type="checkbox"
                checked={printSections.itensVerificacao}
                onChange={() => toggleSection("itensVerificacao")}
                className="rounded text-blue-700 focus:ring-blue-600"
              />
              <span>2. Itens (46)</span>
            </label>

            <label className={`flex items-center gap-1.5 p-2 rounded border cursor-pointer select-none transition ${
              printSections.nivelCombustivel ? "bg-slate-100 border-slate-400 font-semibold text-slate-900" : "bg-white border-slate-200 text-slate-500 opacity-60"
            }`}>
              <input
                type="checkbox"
                checked={printSections.nivelCombustivel}
                onChange={() => toggleSection("nivelCombustivel")}
                className="rounded text-blue-700 focus:ring-blue-600"
              />
              <span>3. Combustível</span>
            </label>

            <label className={`flex items-center gap-1.5 p-2 rounded border cursor-pointer select-none transition col-span-2 sm:col-span-1 md:col-span-1 ${
              printSections.diagramaAvarias ? "bg-blue-50 border-blue-400 font-bold text-blue-900 ring-1 ring-blue-300" : "bg-white border-slate-200 text-slate-500 opacity-60"
            }`}>
              <input
                type="checkbox"
                checked={printSections.diagramaAvarias}
                onChange={() => toggleSection("diagramaAvarias")}
                className="rounded text-blue-700 focus:ring-blue-600"
              />
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span>4. Foto/Diagrama</span>
              </span>
            </label>

            <label className={`flex items-center gap-1.5 p-2 rounded border cursor-pointer select-none transition ${
              printSections.observacoes ? "bg-slate-100 border-slate-400 font-semibold text-slate-900" : "bg-white border-slate-200 text-slate-500 opacity-60"
            }`}>
              <input
                type="checkbox"
                checked={printSections.observacoes}
                onChange={() => toggleSection("observacoes")}
                className="rounded text-blue-700 focus:ring-blue-600"
              />
              <span>5. Observações</span>
            </label>

            <label className={`flex items-center gap-1.5 p-2 rounded border cursor-pointer select-none transition ${
              printSections.assinaturas ? "bg-slate-100 border-slate-400 font-semibold text-slate-900" : "bg-white border-slate-200 text-slate-500 opacity-60"
            }`}>
              <input
                type="checkbox"
                checked={printSections.assinaturas}
                onChange={() => toggleSection("assinaturas")}
                className="rounded text-blue-700 focus:ring-blue-600"
              />
              <span>6. Assinaturas</span>
            </label>
          </div>
        </div>
      </div>

      {/* Printable Sheet Container in True A4 dimensions (210mm x 297mm) */}
      <div
        id="checklist-a4-sheet"
        className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-[10mm] sm:p-[12mm] shadow-2xl border border-slate-300 font-sans print:shadow-none print:border-none print:m-0 print:p-[8mm]"
        style={{
          boxSizing: "border-box",
        }}
      >
        {/* HEADER MILITAR OFICIAL */}
        {printSections.cabecalho && (
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-2.5">
            {/* Left Crest */}
            <div className="w-18 shrink-0 flex items-center justify-center">
              {config?.brasaoEsquerdaUrl ? (
                <img
                  src={config.brasaoEsquerdaUrl}
                  alt="Brasão Unidade"
                  referrerPolicy="no-referrer"
                  className="h-16 w-auto object-contain"
                />
              ) : (
                <Brasao19CIPM className="h-16 w-auto" />
              )}
            </div>

            {/* Central Titles */}
            <div className="text-center flex-1 px-2">
              <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-900 leading-tight">
                ESTADO DA BAHIA • SECRETARIA DA SEGURANÇA PÚBLICA
              </h2>
              <h1 className="text-xs sm:text-sm font-black uppercase tracking-wide text-slate-950 leading-tight">
                {orgaoSuperior}
              </h1>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 leading-tight">
                {comandoRegional}
              </h3>
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-blue-950 leading-tight">
                {unidade}
              </h4>
              <div className="mt-0.5 inline-block bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded">
                CHECKLIST DE VISTORIA - VIATURA {checklist.tipoViatura === "4 rodas" ? "4 RODAS (CARRO)" : "2 RODAS (MOTOCICLETA)"}
              </div>
            </div>

            {/* Right Crest */}
            <div className="w-18 shrink-0 flex flex-col items-center justify-center">
              {config?.brasaoDireitaUrl ? (
                <img
                  src={config.brasaoDireitaUrl}
                  alt="Brasão PMBA"
                  referrerPolicy="no-referrer"
                  className="h-16 w-auto object-contain"
                />
              ) : (
                <BrasaoPMBA className="h-16 w-auto" />
              )}
              <span className="text-[7px] font-bold text-slate-700 uppercase mt-0.5 text-center">
                {config?.unidade || "19ª CIPM"}
              </span>
            </div>
          </div>
        )}

        {/* 1 - DADOS DA CARGA */}
        {printSections.dadosCarga && (
          <div className="mb-2.5">
            <div className="bg-slate-900 text-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>1. DADOS DA CARGA</span>
              <span className="text-[9px] text-amber-300 font-mono">
                REGISTRO: {checklist.id.slice(0, 14)}
              </span>
            </div>
            <table className="w-full text-[10px] border-collapse border border-slate-900">
              <tbody>
                <tr>
                  <td className="border border-slate-900 p-1 bg-slate-100 font-bold w-[25%]">
                    DATA DA CARGA:
                  </td>
                  <td className="border border-slate-900 p-1 font-mono w-[25%]">
                    {checklist.dataCarga}
                  </td>
                  <td className="border border-slate-900 p-1 bg-slate-100 font-bold w-[25%]">
                    HORA DA CARGA:
                  </td>
                  <td className="border border-slate-900 p-1 font-mono w-[25%]">
                    {checklist.horaCarga}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 p-1 bg-slate-100 font-bold">
                    PREFIXO:
                  </td>
                  <td className="border border-slate-900 p-1 font-bold font-mono">
                    {checklist.prefixo}
                  </td>
                  <td className="border border-slate-900 p-1 bg-slate-100 font-bold">
                    PLACA:
                  </td>
                  <td className="border border-slate-900 p-1 font-mono font-bold">
                    {checklist.placa}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 p-1 bg-slate-100 font-bold">
                    KM INICIAL:
                  </td>
                  <td className="border border-slate-900 p-1 font-mono">
                    {Number(checklist.kmInicial || 0).toLocaleString("pt-BR")} KM
                  </td>
                  <td className="border border-slate-900 p-1 bg-slate-100 font-bold">
                    TURNO DE SERVIÇO:
                  </td>
                  <td className="border border-slate-900 p-1">
                    {checklist.turnoServico}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 p-1 bg-slate-100 font-bold">
                    MOTORISTA / CONDUTOR:
                  </td>
                  <td className="border border-slate-900 p-1 font-bold uppercase">
                    {checklist.nomeCondutor}
                  </td>
                  <td className="border border-slate-900 p-1 bg-slate-100 font-bold">
                    MATRÍCULA:
                  </td>
                  <td className="border border-slate-900 p-1 font-mono">
                    {checklist.matricula}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 p-1 bg-slate-100 font-bold">
                    UNIDADE OPERACIONAL (UOp):
                  </td>
                  <td className="border border-slate-900 p-1" colSpan={3}>
                    {checklist.uop} - {config?.unidade || "19ª CIPM / PARIPE"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 2 - ITENS VERIFICADOS */}
        {printSections.itensVerificacao && (
          <div className="mb-2.5">
            <div className="bg-slate-900 text-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>2. ITENS DE VERIFICAÇÃO</span>
              <span className="text-[9px] text-slate-200">
                LEGENDA: S/A = SEM ALTERAÇÃO • I/F = INEXISTE/FALTANDO • C/A = COM ALTERAÇÃO
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-2 border border-slate-900 p-1 bg-slate-50 text-[9px]">
              {Object.entries(checklist.itensVerificados || {}).map(([item, status], idx) => {
                const isSA = status === "SA";
                const isIF = status === "IF";

                return (
                  <div
                    key={item}
                    className="flex items-center justify-between py-0.5 px-1 border-b border-slate-200"
                  >
                    <span className="truncate pr-1 text-slate-800">
                      <span className="font-mono text-slate-500 mr-1">{idx + 1}.</span>
                      {item}
                    </span>
                    <span
                      className={`font-black px-1.5 py-0.2 rounded text-[8px] shrink-0 ${
                        isSA
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : isIF
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-red-100 text-red-800 border border-red-300"
                      }`}
                    >
                      {isSA ? "S/A" : isIF ? "I/F" : "C/A"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3 - NÍVEL DE COMBUSTÍVEL COM INSTRUMENTO GRÁFICO */}
        {printSections.nivelCombustivel && (
          <div className="border border-slate-900 p-2 mb-2.5 bg-white page-break-avoid">
            <div className="text-[11px] font-bold uppercase text-slate-900 mb-1.5 flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-amber-500" />
                <span>3. NÍVEL DE COMBUSTÍVEL</span>
              </span>
              <span className="font-mono text-[11px] font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                MARCADO: {checklist.nivelCombustivel === "R" ? "RESERVA CRÍTICA (R)" : `${checklist.nivelCombustivel}/8 DO TANQUE`}
              </span>
            </div>

            {/* Marcador Gráfico Ilustrado */}
            <div className="bg-slate-50 border border-slate-300 rounded p-2 mb-1.5">
              <div className="flex items-center justify-between text-[9px] font-bold text-slate-600 mb-1 px-1">
                <span className="text-red-700 font-extrabold">E / R (RESERVA)</span>
                <span className="text-amber-700 font-extrabold">1/2 (METADE)</span>
                <span className="text-emerald-700 font-extrabold">F (CHEIO 8/8)</span>
              </div>

              {/* Barra segmentada estilo painel automotivo */}
              <div className="grid grid-cols-9 gap-1 h-5 w-full bg-slate-200 p-0.5 rounded border border-slate-400">
                {["R", "1", "2", "3", "4", "5", "6", "7", "8"].map((lvl) => {
                  const active =
                    lvl === checklist.nivelCombustivel ||
                    (checklist.nivelCombustivel !== "R" &&
                      Number(lvl) <= Number(checklist.nivelCombustivel));
                  const isSelected = lvl === checklist.nivelCombustivel;
                  const isR = lvl === "R";
                  const isLow = ["1", "2"].includes(lvl);

                  let bgClass = "bg-white/80";
                  if (active) {
                    if (isR) bgClass = "bg-red-600 text-white font-black";
                    else if (isLow) bgClass = "bg-amber-500 text-white font-black";
                    else bgClass = "bg-emerald-600 text-white font-black";
                  }

                  return (
                    <div
                      key={lvl}
                      className={`h-full rounded-xs flex items-center justify-center text-[8px] font-mono font-bold transition-all border ${
                        isSelected
                          ? "ring-2 ring-slate-900 border-slate-900 shadow-xs scale-105 z-10"
                          : "border-slate-300"
                      } ${bgClass}`}
                    >
                      {lvl}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Escala e Detalhamento dos Níveis */}
            <div className="flex items-center justify-between gap-1 pt-0.5">
              {["R", "1", "2", "3", "4", "5", "6", "7", "8"].map((lvl) => {
                const isSelected = lvl === checklist.nivelCombustivel;
                const isR = lvl === "R";

                return (
                  <div
                    key={lvl}
                    className={`flex flex-col items-center flex-1 py-0.5 rounded ${
                      isSelected ? "bg-slate-100 ring-1 ring-slate-400" : ""
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-xs flex items-center justify-center text-[8px] font-bold border ${
                        isSelected
                          ? isR
                            ? "bg-red-600 text-white border-red-700"
                            : "bg-emerald-600 text-white border-emerald-700"
                          : "bg-white text-slate-600 border-slate-300"
                      }`}
                    >
                      {lvl}
                    </div>
                    <span className="text-[7px] font-bold text-slate-600 mt-0.5">
                      {isR ? "RES" : `${lvl}/8`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4 - DIAGRAMA DA VIATURA COM FOTO/IMAGEM E MARCAÇÕES EXATAS */}
        {printSections.diagramaAvarias && (
          <div className="border border-slate-900 mb-2.5 bg-white page-break-avoid">
            <div className="bg-slate-900 text-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>
                4. DIAGRAMA DA VIATURA ({isCarro ? "VIATURA 4 RODAS" : "MOTOCICLETA PMBA"}) - AVARIAS
              </span>
              <span className="text-[9px] text-amber-300 font-semibold font-mono">
                {checklist.avarias.length === 0
                  ? "SEM AVARIAS ASSINALADAS"
                  : `${checklist.avarias.length} PONTO(S) MARCADO(S)`}
              </span>
            </div>

            <div className="p-2 flex flex-col items-center bg-slate-50 border-t border-slate-300">
              <div className="relative w-full max-w-[560px] bg-white border border-slate-300 rounded overflow-hidden flex items-center justify-center p-1 shadow-xs">
                <img
                  src={activeDiagramaUrl}
                  alt={`Diagrama Viatura ${checklist.tipoViatura}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[210px] object-contain select-none"
                />

                {/* Marcações no local exato onde foi marcado na imagem */}
                {checklist.avarias.map((av, index) => (
                  <div
                    key={av.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                    style={{ left: `${av.x}%`, top: `${av.y}%` }}
                  >
                    <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-white text-white font-black text-[10px] flex items-center justify-center shadow-md">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* Relação descritiva das avarias assinaladas na imagem */}
              {checklist.avarias.length > 0 && (
                <div className="w-full mt-2 bg-white border border-slate-300 rounded p-1.5">
                  <div className="text-[9px] font-bold text-slate-800 uppercase mb-1 border-b border-slate-200 pb-0.5">
                    Detalhamento dos Pontos Assinalados no Diagrama:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[9px]">
                    {checklist.avarias.map((av, idx) => (
                      <div
                        key={av.id}
                        className="flex items-start gap-1.5 p-1 bg-slate-50 rounded border border-slate-200"
                      >
                        <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[8px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">
                            {av.descricao || `Ponto ${idx + 1}`}
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono">
                            Coordenadas: ({Math.round(av.x)}%, {Math.round(av.y)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5 - OBSERVAÇÕES */}
        {printSections.observacoes && (
          <div className="border border-slate-900 p-2 bg-slate-50 mb-2.5">
            <div className="text-[11px] font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 mb-1">
              5. OBSERVAÇÕES
            </div>
            <div className="text-[10px] text-slate-800 whitespace-pre-wrap min-h-[28px]">
              {checklist.observacoes || "Nenhuma observação informada pelo condutor."}
            </div>
          </div>
        )}

        {/* 6 - ASSINATURAS */}
        {printSections.assinaturas && (
          <div className="border border-slate-900 mb-2">
            <div className="bg-slate-900 text-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
              6. ASSINATURAS E REGISTRO DE VISTO
            </div>

            <div className="grid grid-cols-2 gap-2 p-2 bg-white">
              {/* Assinatura do Motorista */}
              <div className="border border-slate-300 rounded p-1.5 flex flex-col items-center text-center">
                <span className="text-[9px] font-bold uppercase text-slate-600 mb-0.5">
                  ASSINATURA DO MOTORISTA
                </span>
                <div className="h-14 w-full flex items-center justify-center border-b border-slate-400 mb-1 bg-slate-50">
                  {checklist.assinaturaMotorista ? (
                    <img
                      src={checklist.assinaturaMotorista}
                      alt="Assinatura"
                      referrerPolicy="no-referrer"
                      className="max-h-12 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[9px] text-slate-400 italic">
                      Assinatura não coletada
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-extrabold uppercase text-slate-900">
                  {checklist.nomeCondutor}
                </span>
                <span className="text-[8px] font-mono text-slate-600">
                  MATRÍCULA: {checklist.matricula}
                </span>
                <span className="text-[7px] text-slate-500 font-mono mt-0.5">
                  {checklist.dataHoraAssinatura || `${checklist.dataCarga} ${checklist.horaCarga}`}
                </span>
              </div>

              {/* Visto do Despachante */}
              <div className="border border-slate-300 rounded p-1.5 flex flex-col items-center justify-between text-center">
                <span className="text-[9px] font-bold uppercase text-slate-600 mb-0.5">
                  VISTO DO DESPACHANTE DE DIA
                </span>
                <div className="h-14 w-full flex items-center justify-center border-b border-dashed border-slate-400 mb-1">
                  <span className="text-[11px] font-mono font-bold text-slate-700 uppercase">
                    [VISTADO ELETRONICAMENTE]
                  </span>
                </div>
                <span className="text-[9px] font-extrabold uppercase text-slate-900">
                  {checklist.vistoDespachante || "SGT PM DESPACHANTE"}
                </span>
                <span className="text-[8px] text-slate-600 uppercase">
                  {config?.unidade || "19ª CIPM"} / SJD - FROTA
                </span>
                <span className="text-[7px] text-slate-500 font-mono mt-0.5">
                  CONFIRMADO EM {checklist.dataCarga}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-[7px] text-slate-500 text-center uppercase tracking-widest pt-1 border-t border-slate-300 font-mono">
          DOCUMENTO GERADO PELO SISTEMA DE GESTÃO DE FROTAS • {config?.unidade || "19ª CIPM"} • {orgaoSuperior}
        </div>
      </div>
    </div>
  );
};
