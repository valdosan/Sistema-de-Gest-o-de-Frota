import React, { useState, useEffect } from "react";
import {
  QrCode,
  Car,
  Bike,
  Printer,
  Download,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Smartphone,
  Info
} from "lucide-react";
import QRCode from "qrcode";
import { Viatura, ConfigSistema } from "../types";
import { formatPrefixo, formatPlaca } from "../utils/formatters";

interface GerarQrCodeViewProps {
  viaturas: Viatura[];
  config?: ConfigSistema;
  onNavigateToChecklist?: (tipo: "carro" | "moto", viaturaId?: string) => void;
}

export const GerarQrCodeView: React.FC<GerarQrCodeViewProps> = ({
  viaturas,
  config,
  onNavigateToChecklist,
}) => {
  const [selectedType, setSelectedType] = useState<"carro" | "moto">("carro");
  const [selectedViaturaId, setSelectedViaturaId] = useState<string>("geral");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Filtra viaturas ativas do tipo selecionado
  const viaturasDisponiveis = viaturas.filter((v) => {
    if (v.status === "baixada") return false;
    if (selectedType === "carro") {
      return v.tipo === "4 rodas" || v.tipo === "carro";
    } else {
      return v.tipo === "2 rodas" || v.tipo === "moto";
    }
  });

  // Constrói o link direto que será embutido no QR Code
  const getTargetUrl = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const tabName = selectedType === "carro" ? "checklist-carro" : "checklist-moto";

    let url = `${origin}${pathname}?tab=${tabName}&qrcode=1`;
    if (selectedViaturaId && selectedViaturaId !== "geral") {
      url += `&vId=${selectedViaturaId}`;
    }
    return url;
  };

  const targetUrl = getTargetUrl();

  // Gera o QR Code quando mudar tipo ou viatura
  useEffect(() => {
    QRCode.toDataURL(
      targetUrl,
      {
        width: 380,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      },
      (err, url) => {
        if (!err && url) {
          setQrCodeDataUrl(url);
        } else {
          console.error("Erro ao gerar QR Code:", err);
        }
      }
    );
  }, [targetUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    const v = viaturas.find((item) => item.id === selectedViaturaId);
    const ref = v ? `_${v.prefixo.replace(/\./g, "")}` : "_GERAL";
    link.download = `QRCode_Checklist_${selectedType.toUpperCase()}${ref}_19CIPM.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedViatura = viaturas.find((v) => v.id === selectedViaturaId);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 text-slate-800">
      {/* Header da Tela */}
      <div className="bg-black text-white border border-neutral-800 rounded-2xl p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-neutral-900 text-amber-400 border border-neutral-700">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Gerador de QR Code para Checklists
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 font-medium">
              {config?.unidade || "19ª CIPM / PARIPE"} • Acesso direto e seguro para vistoria operacional
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-xl transition cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-neutral-300" />
            <span>Imprimir Cartaz / Etiqueta</span>
          </button>
        </div>
      </div>

      {/* Instruções de Operação */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 mb-6 text-xs text-blue-900 flex items-start gap-3">
        <Smartphone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold text-blue-950 mb-1">
            Como funciona a Vistoria por QR Code:
          </p>
          <p>
            1. Imprima ou disponibilize o QR Code gerado abaixo (na prancheta da guarda, corpo da guarda ou fixado no painel da viatura).
          </p>
          <p>
            2. Ao ler o QR Code com a câmera do celular, o motorista é direcionado diretamente ao formulário do checklist de carro ou moto.
          </p>
          <p>
            3. Após o preenchimento completo e envio da vistoria, o sistema exibe a mensagem de confirmação e fecha a tela automaticamente, sendo necessário ler o QR Code novamente para realizar uma nova vistoria.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel de Configurações do QR Code */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              1. Selecionar Modalidade do Checklist
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => {
                  setSelectedType("carro");
                  setSelectedViaturaId("geral");
                }}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                  selectedType === "carro"
                    ? "bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Car className={`w-6 h-6 ${selectedType === "carro" ? "text-amber-600" : "text-slate-400"}`} />
                <span className="text-xs">Viaturas 4 Rodas (Carro)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedType("moto");
                  setSelectedViaturaId("geral");
                }}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition cursor-pointer ${
                  selectedType === "moto"
                    ? "bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Bike className={`w-6 h-6 ${selectedType === "moto" ? "text-amber-600" : "text-slate-400"}`} />
                <span className="text-xs">Viaturas 2 Rodas (Moto)</span>
              </button>
            </div>

            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
              2. Viatura Específica (Opcional)
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Você pode gerar um QR Code geral (o condutor escolhe a viatura na hora) ou um QR Code específico para afixar dentro de uma viatura.
            </p>

            <select
              value={selectedViaturaId}
              onChange={(e) => setSelectedViaturaId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-600 mb-4"
            >
              <option value="geral">
                -- QR CODE GERAL ({selectedType === "carro" ? "Qualquer Viatura 4 Rodas" : "Qualquer Viatura 2 Rodas"}) --
              </option>
              {viaturasDisponiveis.map((v) => (
                <option key={v.id} value={v.id}>
                  {formatPrefixo(v.prefixo)} - {formatPlaca(v.placa)} ({v.modelo})
                </option>
              ))}
            </select>

            {/* Ações e Link */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-600 uppercase">
                Link de Destino Embutido no QR Code:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={targetUrl}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-600"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                  title="Copiar link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copiado" : "Copiar"}</span>
                </button>
              </div>

              <div className="pt-3 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar PNG</span>
                </button>

                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-300"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Testar Link</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Visualização de Impressão / Cartaz do QR Code */}
        <div className="lg:col-span-7">
          <div
            id="cartaz-qrcode-print"
            className="bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 text-center shadow-md flex flex-col items-center justify-center print:border-none print:shadow-none print:p-0"
          >
            {/* Cabeçalho do Cartaz */}
            <div className="mb-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                POLÍCIA MILITAR DA BAHIA • COPPM • CPRC-BTS
              </p>
              <h3 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">
                {config?.unidade || "19ª COMPANHIA INDEPENDENTE DE POLÍCIA MILITAR"}
              </h3>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                VISTORIA DIÁRIA E CHECKLIST DE SERVIÇO OPERACIONAL
              </p>
            </div>

            {/* Selo da Modalidade */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white text-xs font-extrabold uppercase mb-4">
              {selectedType === "carro" ? <Car className="w-4 h-4 text-amber-400" /> : <Bike className="w-4 h-4 text-amber-400" />}
              <span>
                {selectedType === "carro"
                  ? "CHECKLIST VIATURAS 4 RODAS (CARRO)"
                  : "CHECKLIST VIATURAS 2 RODAS (MOTO)"}
              </span>
            </div>

            {/* Informações da Viatura (se selecionada) */}
            {selectedViatura ? (
              <div className="mb-4 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs">
                <span className="font-bold text-slate-600">VIATURA: </span>
                <span className="font-black text-slate-900 text-sm">
                  {formatPrefixo(selectedViatura.prefixo)}
                </span>
                <span className="mx-2 text-slate-400">•</span>
                <span className="font-bold text-slate-600">PLACA: </span>
                <span className="font-mono font-bold text-slate-900">
                  {formatPlaca(selectedViatura.placa)}
                </span>
                <span className="mx-2 text-slate-400">•</span>
                <span className="text-slate-700">{selectedViatura.modelo}</span>
              </div>
            ) : (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-1.5 text-xs text-amber-900 font-bold">
                ACESSO GERAL DA FROTA • SELEÇÃO DE PREFIXO NO FORMULÁRIO
              </div>
            )}

            {/* QR Code Imagem */}
            <div className="p-4 bg-white border-4 border-slate-900 rounded-2xl shadow-inner mb-4 inline-block">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code Checklist"
                  className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-slate-400 text-xs">
                  Carregando QR Code...
                </div>
              )}
            </div>

            {/* Instrução ao Policial */}
            <div className="max-w-md">
              <p className="text-xs sm:text-sm font-black text-slate-900 uppercase">
                Aponte a câmera do celular para preencher a vistoria
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Ao enviar o formulário, a vistoria é registrada imediatamente no sistema e a tela é fechada com confirmação.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
