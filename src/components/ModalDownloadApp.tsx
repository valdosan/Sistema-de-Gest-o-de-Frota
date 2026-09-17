import React from "react";
import {
  Download,
  FileCode,
  Laptop,
  CheckCircle2,
  X,
  Shield,
  FolderArchive,
  ExternalLink,
  Info,
  ChevronRight,
  HardDrive
} from "lucide-react";
import { ConfigSistema } from "../types";

interface ModalDownloadAppProps {
  isOpen: boolean;
  onClose: () => void;
  config?: ConfigSistema;
}

export const ModalDownloadApp: React.FC<ModalDownloadAppProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  if (!isOpen) return null;

  const handleDownload = (filename: string, url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        {/* Header Preto Oficial com Letras Brancas */}
        <div className="bg-black text-white p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white">
              <Download className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
                Baixar Aplicativo & Versão Offline
              </h2>
              <p className="text-xs text-neutral-300 font-medium">
                {config?.unidade || "19ª CIPM / PARIPE"} • Versão completa em HTML e Instalador Windows 10/11
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
            title="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Banner de Apresentação */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-800 shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="text-xs leading-relaxed text-slate-700">
              <span className="font-bold text-slate-900 block text-sm mb-0.5">
                Utilize o sistema sem depender de conexão com a internet!
              </span>
              Você pode baixar a versão <strong>HTML Standalone</strong> (arquivo único que abre em qualquer navegador com duplo clique) ou o <strong>Instalador .exe para Windows 10 e 11</strong>, que adiciona atalhos no Menu Iniciar e na Área de Trabalho executando o sistema em modo janela nativa.
            </div>
          </div>

          {/* Cards de Download */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CARD 1: VERSÃO HTML COMPLETA */}
            <div className="bg-white border-2 border-slate-200 hover:border-blue-500 rounded-xl p-4 sm:p-5 transition shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                    <FileCode className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
                    Arquivo Único HTML
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                  Versão Completa em HTML
                </h3>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Ideal para testar imediatamente ou salvar em pendrive. Arquivo <strong>.html</strong> 100% autossuficiente com todas as fotos, estilos, formulários, impressão em A4 e banco de dados local.
                </p>
                <div className="space-y-1.5 mb-4 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Abre com duplo clique no Chrome, Edge ou Firefox</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Não precisa instalar nada no computador</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Armazena todos os dados de forma persistente</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <a
                  href="/downloads/sistema_frotas_19cipm.html"
                  download="sistema_frotas_19cipm.html"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Versão HTML (.html)</span>
                </a>
              </div>
            </div>

            {/* CARD 2: INSTALADOR WINDOWS 10/11 (.EXE) */}
            <div className="bg-white border-2 border-emerald-300 hover:border-emerald-600 rounded-xl p-4 sm:p-5 transition shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-0.5 rounded-bl-lg">
                Recomendado Windows
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <Laptop className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                    Windows 10 ou Superior
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                  Instalador Oficial Windows (.exe)
                </h3>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Instalador nativo (NSIS) para <strong>Windows 10 e Windows 11</strong>. Cria atalho oficial na Área de Trabalho e Menu Iniciar, abrindo o sistema em tela cheia como aplicativo desktop.
                </p>
                <div className="space-y-1.5 mb-4 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Cria atalho na Área de Trabalho</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Executa em modo Aplicativo nativo (sem barra do Edge)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Não exige permissão de Administrador</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <a
                  href="/downloads/Instalador_Gestao_Frotas_19CIPM.exe"
                  download="Instalador_Gestao_Frotas_19CIPM.exe"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md text-center"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Baixar Instalador Windows (.exe)</span>
                </a>
              </div>
            </div>
          </div>

          {/* Opções Alternativas (Portátil .exe e .zip) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-slate-500" />
              <span>Opções Portáteis / Pendrive (Sem Instalação)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="/downloads/GestaoFrotas19CIPM.exe"
                download="GestaoFrotas19CIPM.exe"
                className="flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-slate-400 rounded-lg text-xs font-semibold text-slate-800 transition hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <Laptop className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="block font-bold">Executável Portátil (.exe)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Iniciador nativo 64-bit (~240 KB)</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </a>

              <a
                href="/downloads/GestaoFrotas19CIPM_Windows.zip"
                download="GestaoFrotas19CIPM_Windows.zip"
                className="flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-slate-400 rounded-lg text-xs font-semibold text-slate-800 transition hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <FolderArchive className="w-4 h-4 text-amber-600" />
                  <div>
                    <span className="block font-bold">Pacote Completo (.zip)</span>
                    <span className="text-[10px] text-slate-500 font-normal">HTML + EXE + Manual de Instruções</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Guia Rápido de Instalação e Dicas do Windows 10/11 */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Instruções para Windows 10 e Windows 11</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">1. Download e Execução</span>
                Baixe o <strong>Instalador .exe</strong> ou a versão <strong>.html</strong>. Dê duplo clique no arquivo baixado na sua pasta de Downloads.
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">2. Alerta do Windows</span>
                Se o Windows SmartScreen exibir aviso de "aplicativo desconhecido", clique em <em>"Mais informações"</em> e depois em <em>"Executar assim mesmo"</em>.
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-800 block mb-1">3. Funcionamento Offline</span>
                O sistema funciona totalmente sem internet. Todas as vistorias, viaturas e dados ficam armazenados com segurança no banco local do seu PC.
              </div>
            </div>
          </div>
        </div>

        {/* Footer com Botão Fechar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
