import React, { useState, useRef } from "react";
import { AlertCircle, Info } from "lucide-react";
import { AvariaPoint } from "../types";

interface DiagramaAvariasMotoProps {
  avarias: AvariaPoint[];
  onChange: (avarias: AvariaPoint[]) => void;
  disabled?: boolean;
  imageUrl?: string;
}

export const DiagramaAvariasMoto: React.FC<DiagramaAvariasMotoProps> = ({
  avarias,
  onChange,
  disabled = false,
  imageUrl = "/assets/viatura_moto_pmba.jpg",
}) => {
  const [activeTipo, setActiveTipo] = useState<AvariaPoint["tipo"]>("Arranhão");
  const [descricaoInput, setDescricaoInput] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDiagramClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const view = x < 50 ? "Vista Diagonal Esquerda" : "Vista Diagonal Direita";

    const newAvaria: AvariaPoint = {
      id: "av-moto-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
      x,
      y,
      view,
      tipo: activeTipo,
      descricao: descricaoInput.trim() || `${activeTipo} em ${view}`,
    };

    onChange([...avarias, newAvaria]);
    setDescricaoInput("");
  };

  const removeAvaria = (id: string) => {
    if (disabled) return;
    onChange(avarias.filter((a) => a.id !== id));
  };

  return (
    <div id="diagrama-avarias-moto" className="bg-white border border-slate-200 rounded-xl overflow-hidden text-slate-800 shadow-xs">
      {/* Header (Fundo preto e letras brancas) */}
      <div className="bg-black text-white px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-neutral-900 text-amber-400 rounded-lg border border-neutral-700">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <span>4. Diagrama de Avarias - Motocicleta (2 Rodas)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-amber-400 border border-neutral-700">
                Honda XRE 300 PMBA
              </span>
            </h4>
            <p className="text-[11px] text-neutral-300">
              Toque ou clique na motocicleta para marcar o local exato da avaria.
            </p>
          </div>
        </div>
        <div className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-200">
          {avarias.length} {avarias.length === 1 ? "avaria registrada" : "avarias registradas"}
        </div>
      </div>

      <div className="p-4">

      {/* Control Bar */}
      {!disabled && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-bold">Tipo de Avaria:</span>
            <select
              value={activeTipo}
              onChange={(e) => setActiveTipo(e.target.value as AvariaPoint["tipo"])}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-semibold"
            >
              <option value="Arranhão">Arranhão</option>
              <option value="Amassado">Amassado</option>
              <option value="Trinca">Trinca</option>
              <option value="Quebrado">Quebrado</option>
              <option value="Faltando">Faltando</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Detalhe adicional (ex: manete direito ralado, carenagem frontal)"
              value={descricaoInput}
              onChange={(e) => setDescricaoInput(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            <Info className="w-3.5 h-3.5 text-slate-700" />
            <span>Toque na moto para marcar</span>
          </div>
        </div>
      )}

      {/* Interactive Blueprint Canvas Container */}
      <div
        ref={containerRef}
        onClick={handleDiagramClick}
        id="canvas-diagrama-moto"
        className={`relative mt-4 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl overflow-hidden cursor-crosshair select-none p-2 transition flex items-center justify-center ${
          disabled ? "pointer-events-none" : ""
        }`}
        style={{ minHeight: "320px" }}
      >
        {/* Guides */}
        <div className="absolute top-2 left-2 pointer-events-none z-10 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs">
          VISTA ESQUERDA / DIAGONAL
        </div>
        <div className="absolute top-2 right-2 pointer-events-none z-10 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs">
          VISTA DIREITA / DIAGONAL
        </div>

        {/* Motorcycle Image (Imagem 2) */}
        <img
          src={imageUrl}
          alt="Diagrama Viatura Moto Honda XRE 300 PMBA"
          referrerPolicy="no-referrer"
          className="w-full h-auto max-h-[420px] object-contain pointer-events-none drop-shadow-sm select-none"
        />

        {/* Render interactive markers */}
        {avarias.map((av, index) => (
          <div
            key={av.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            style={{ left: `${av.x}%`, top: `${av.y}%` }}
            onClick={(e) => {
              e.stopPropagation();
              removeAvaria(av.id);
            }}
            title={`${index + 1}: ${av.tipo} - ${av.descricao} (Clique para remover)`}
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-amber-400 opacity-75"></span>
              <div className="relative w-6 h-6 rounded-full bg-amber-600 border-2 border-white text-white font-bold text-[11px] flex items-center justify-center shadow-md hover:scale-125 transition-transform">
                {index + 1}
              </div>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-30">
              <div className="bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-lg">
                Marcação #{index + 1} ({av.view}) - Clique para remover
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info (sem lista textual de avarias, apenas as marcações na imagem) */}
      <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>
          {avarias.length === 0
            ? "Nenhuma avaria assinalada na motocicleta."
            : `${avarias.length} marcação(ões) fixada(s) exatamente no local indicado.`}
        </span>
        {!disabled && avarias.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-amber-700 hover:text-amber-800 font-medium text-xs hover:underline cursor-pointer"
          >
            Limpar todas as marcações
          </button>
        )}
      </div>
      </div>
    </div>
  );
};
