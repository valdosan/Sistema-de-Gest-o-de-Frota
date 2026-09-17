import React, { useRef, useState, useEffect } from "react";
import { Eraser, PenTool } from "lucide-react";

interface CanvasAssinaturaProps {
  value: string; // base64 data URL
  onChange: (base64: string) => void;
  nomeCondutor: string;
  matricula: string;
  dataHora?: string;
  disabled?: boolean;
}

export const CanvasAssinatura: React.FC<CanvasAssinaturaProps> = ({
  value,
  onChange,
  nomeCondutor,
  matricula,
  dataHora,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize canvas when mounted or value changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.strokeStyle = "#0F172A"; // Deep ink color
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = value;
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
      setHasDrawn(false);
    }
  }, [value]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Prevent scrolling when drawing on touchscreen
    if ("touches" in e) {
      e.preventDefault();
    }

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing || disabled) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save as base64 PNG
    const dataUrl = canvas.toDataURL("image/png");
    onChange(dataUrl);
  };

  const handleClear = () => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    onChange("");
  };

  return (
    <div id="canvas-assinatura-motorista-card" className="bg-white border border-slate-200 rounded-xl overflow-hidden text-slate-800 shadow-xs">
      <div className="bg-black text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-white" />
          <span className="text-xs uppercase tracking-wider font-bold text-white">
            6. Assinatura do Motorista * (Dedo ou Caneta)
          </span>
        </div>
        {!disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1 rounded-lg border border-neutral-600 transition cursor-pointer font-medium"
          >
            <Eraser className="w-3.5 h-3.5 text-red-400" />
            <span>Limpar Assinatura</span>
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="relative">
        <div className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl overflow-hidden bg-slate-50/50 shadow-inner">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className={`w-full h-36 touch-none block ${disabled ? "cursor-not-allowed" : "cursor-crosshair"}`}
          />
        </div>

        {!hasDrawn && !value && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-slate-400 text-xs italic bg-white/90 border border-slate-200 px-3 py-1 rounded-full shadow-xs">
              Assine com o dedo ou caneta no espaço acima
            </span>
          </div>
        )}
      </div>

      {/* Metadata displayed immediately below signature */}
      <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 font-medium">
        <div>
          <span className="text-slate-500">Condutor: </span>
          <span className="font-bold text-slate-900 uppercase">{nomeCondutor || "NÃO INFORMADO"}</span>
        </div>
        <div>
          <span className="text-slate-500">Matrícula: </span>
          <span className="font-mono font-bold text-blue-700">{matricula || "NÃO INFORMADA"}</span>
        </div>
        <div>
          <span className="text-slate-500">Data/Hora: </span>
          <span className="font-mono text-slate-800">{dataHora || new Date().toLocaleString("pt-BR")}</span>
        </div>
      </div>
      </div>
    </div>
  );
};
