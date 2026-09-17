const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== INICIANDO GERAÇÃO DA DISTRIBUIÇÃO WINDOWS E HTML STANDALONE ===');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const publicDir = path.join(projectRoot, 'public');
const downloadsDir = path.join(publicDir, 'downloads');
const distDownloadsDir = path.join(distDir, 'downloads');

if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });
if (!fs.existsSync(distDownloadsDir)) fs.mkdirSync(distDownloadsDir, { recursive: true });

// 1. Verificar arquivos gerados pelo Vite
const htmlPath = path.join(distDir, 'index.html');
if (!fs.existsSync(htmlPath)) {
  console.log('Executando npm run build...');
  execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
}

let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 2. Encontrar e embutir CSS
const cssMatch = htmlContent.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/);
if (cssMatch) {
  const cssRelative = cssMatch[1].replace(/^\//, '');
  const cssFile = path.join(distDir, cssRelative);
  if (fs.existsSync(cssFile)) {
    const cssContent = fs.readFileSync(cssFile, 'utf8');
    htmlContent = htmlContent.replace(
      cssMatch[0],
      `<style id="app-inline-styles">\n${cssContent}\n</style>`
    );
    console.log(`CSS embutido com sucesso (${(cssContent.length / 1024).toFixed(1)} KB)`);
  }
}

// 3. Encontrar e embutir JS, e substituir imagens por Base64
const jsMatch = htmlContent.match(/<script[^>]+src="([^"]+\.js)"[^>]*><\/script>/);
if (jsMatch) {
  const jsRelative = jsMatch[1].replace(/^\//, '');
  const jsFile = path.join(distDir, jsRelative);
  if (fs.existsSync(jsFile)) {
    let jsContent = fs.readFileSync(jsFile, 'utf8');

    // Imagens para embutir como Base64
    const imagesToInline = [
      'icone_frota_19cipm.jpg',
      'viatura_carro_duster.jpg',
      'viatura_moto_pmba.jpg'
    ];

    for (const imgName of imagesToInline) {
      const imgPath = path.join(distDir, 'assets', imgName);
      if (fs.existsSync(imgPath)) {
        const imgBase64 = fs.readFileSync(imgPath).toString('base64');
        const mimeType = 'image/jpeg';
        const dataUri = `data:${mimeType};base64,${imgBase64}`;
        
        // Substituir referências no JS
        const targetPattern = new RegExp(`["']/assets/${imgName}["']`, 'g');
        jsContent = jsContent.replace(targetPattern, `"${dataUri}"`);
        console.log(`Imagem ${imgName} convertida em Base64 e embutida no bundle`);
      }
    }

    htmlContent = htmlContent.replace(
      jsMatch[0],
      `<script type="module" id="app-inline-script">\n${jsContent}\n</script>`
    );
    console.log(`JavaScript embutido com sucesso (${(jsContent.length / 1024).toFixed(1)} KB)`);
  }
}

// Injetar script auxiliar para ambiente offline local
const offlineHelper = `
<script>
  window.__FROTA_19CIPM_STANDALONE__ = true;
  console.log("Sistema de Gestão de Frotas 19ª CIPM - Versão Completa Standalone Offline Carregada.");
</script>
`;
htmlContent = htmlContent.replace('</head>', `${offlineHelper}\n</head>`);

// Salvar HTML standalone completo
const standaloneHtmlPath = path.join(downloadsDir, 'sistema_frotas_19cipm.html');
fs.writeFileSync(standaloneHtmlPath, htmlContent, 'utf8');
fs.writeFileSync(path.join(distDownloadsDir, 'sistema_frotas_19cipm.html'), htmlContent, 'utf8');
console.log(`✅ Arquivo standalone salvo: ${standaloneHtmlPath} (${(htmlContent.length / (1024 * 1024)).toFixed(2)} MB)`);

// 4. Criar o código-fonte C do Launcher nativo Windows
const launcherCPath = path.join(projectRoot, 'scripts', 'launcher.c');
const launcherCCode = `#include <windows.h>
#include <stdio.h>
#include <string.h>

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    char exePath[MAX_PATH];
    GetModuleFileNameA(NULL, exePath, MAX_PATH);
    char *lastSlash = strrchr(exePath, '\\\\');
    if (lastSlash != NULL) {
        *(lastSlash + 1) = '\\0';
    }

    char htmlPath[MAX_PATH];
    snprintf(htmlPath, sizeof(htmlPath), "%ssistema_frotas_19cipm.html", exePath);

    // Candidatos para Microsoft Edge no Windows 10 e 11
    const char *edgeCandidates[] = {
        "C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe",
        "C:\\\\Program Files\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe"
    };

    char foundEdge[MAX_PATH] = {0};
    for (int i = 0; i < 2; i++) {
        DWORD attrib = GetFileAttributesA(edgeCandidates[i]);
        if (attrib != INVALID_FILE_ATTRIBUTES && !(attrib & FILE_ATTRIBUTE_DIRECTORY)) {
            strncpy(foundEdge, edgeCandidates[i], sizeof(foundEdge) - 1);
            break;
        }
    }

    if (foundEdge[0] != '\\0') {
        // Executa em modo Aplicativo nativo do Edge (sem barra de URL, sem abas)
        char args[MAX_PATH * 3];
        snprintf(args, sizeof(args), "--app=\\"file:///%s\\" --window-size=1366,850 --start-maximized", htmlPath);
        ShellExecuteA(NULL, "open", foundEdge, args, NULL, SW_SHOWNORMAL);
    } else {
        // Fallback: abre no navegador padrão do Windows
        ShellExecuteA(NULL, "open", htmlPath, NULL, NULL, SW_SHOWNORMAL);
    }

    return 0;
}
`;
fs.writeFileSync(launcherCPath, launcherCCode, 'utf8');

// 5. Compilar Launcher com mingw GCC 64-bit se disponível
const launcherExe = path.join(downloadsDir, 'GestaoFrotas19CIPM.exe');
let hasMinGW = false;
try {
  execSync('which x86_64-w64-mingw32-gcc', { stdio: 'ignore' });
  hasMinGW = true;
} catch (_) {}

if (hasMinGW) {
  try {
    console.log('Compilando executável nativo Windows 64-bit com MinGW...');
    execSync(`x86_64-w64-mingw32-gcc -O2 -mwindows "${launcherCPath}" -o "${launcherExe}"`, { stdio: 'inherit' });
    console.log('✅ Executável nativo compilado com sucesso: GestaoFrotas19CIPM.exe');
  } catch (e) {
    console.warn('Aviso: Falha ao compilar com MinGW, mantendo binário existente:', e.message);
  }
} else {
  console.log('MinGW não detectado no ambiente atual. Mantendo executável nativo pré-compilado: GestaoFrotas19CIPM.exe');
}

if (fs.existsSync(launcherExe)) {
  fs.copyFileSync(launcherExe, path.join(distDownloadsDir, 'GestaoFrotas19CIPM.exe'));
}

// 6. Criar arquivo de instruções LEIA-ME.txt
const readmePath = path.join(downloadsDir, 'LEIA-ME.txt');
const readmeContent = `========================================================================
SISTEMA DE GESTÃO DE FROTAS - 19ª CIPM / PARIPE - POLÍCIA MILITAR DA BAHIA
Versão Completa para Desktop e Offline (Windows 10 / Windows 11)
========================================================================

Este pacote contém o sistema de Gestão de Frota completo para uso
offline ou local no Windows, sem necessidade de servidores externos.

ARQUIVOS INCLUÍDOS:
1. sistema_frotas_19cipm.html
   - A aplicação web completa compilada em arquivo único.
   - Contém todos os checklists (Carro e Moto), Carga de Viaturas,
     Impressão A4 oficial da PMBA, Gráficos, Estoque, Manutenção,
     Higienização, QR Code e Exportação para Excel.
   - Pode ser aberto diretamente com dois cliques em qualquer navegador
     (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Opera).

2. GestaoFrotas19CIPM.exe
   - Executável nativo Windows 64-bit para Windows 10 e Windows 11.
   - Inicia o sistema em MODO APLICATIVO NATIVO (sem barra de endereços
     ou abas de navegador), proporcionando a experiência de um software
     instalado.

3. Iniciar_Sistema.bat
   - Atalho rápido em lote para inicialização alternativa.

4. Instalador_Gestao_Frotas_19CIPM.exe
   - Instalador automático oficial do Windows.
   - Cria atalhos na Área de Trabalho e no Menu Iniciar.

COMO USAR:
- Opção 1 (Instalação):
  Execute "Instalador_Gestao_Frotas_19CIPM.exe" e siga as instruções na tela.
  O atalho "19ª CIPM - Gestão de Frotas" será criado na sua Área de Trabalho.

- Opção 2 (Modo Portátil / Sem Instalação):
  Basta manter "GestaoFrotas19CIPM.exe" e "sistema_frotas_19cipm.html" na
  mesma pasta (ou pendrive) e dar dois cliques em "GestaoFrotas19CIPM.exe"
  ou diretamente em "sistema_frotas_19cipm.html".

SEGURANÇA E DADOS:
- Todos os dados, checklists preenchidos e cadastros são salvos de forma
  segura no banco de dados local do seu computador (armazenamento persistente).
- Funciona 100% sem conexão com a internet.

19ª CIPM / PARIPE - POLÍCIA MILITAR DA BAHIA
"PMBA, uma Força a serviço do cidadão!"
========================================================================
`;
fs.writeFileSync(readmePath, readmeContent, 'utf8');

// 7. Criar script Iniciar_Sistema.bat
const batPath = path.join(downloadsDir, 'Iniciar_Sistema.bat');
const batContent = `@echo off
title Gestao de Frotas - 19a CIPM / PARIPE
cd /d "%~dp0"
if exist GestaoFrotas19CIPM.exe (
    start "" GestaoFrotas19CIPM.exe
) else (
    start "" sistema_frotas_19cipm.html
)
exit
`;
fs.writeFileSync(batPath, batContent, 'utf8');

// 8. Criar Instalador Windows NSIS
const nsiPath = path.join(projectRoot, 'scripts', 'installer.nsi');
const installerExe = path.join(downloadsDir, 'Instalador_Gestao_Frotas_19CIPM.exe');

const nsiContent = `!include "MUI2.nsh"
!include "FileFunc.nsh"

Unicode True
Name "19ª CIPM - Gestão de Frotas"
OutFile "${installerExe}"
InstallDir "$LOCALAPPDATA\\GestaoFrotas19CIPM"
InstallDirRegKey HKCU "Software\\GestaoFrotas19CIPM" "Install_Dir"
RequestExecutionLevel user

VIProductVersion "2.0.0.0"
VIAddVersionKey "ProductName" "Sistema de Gestão de Frotas - 19ª CIPM/PARIPE"
VIAddVersionKey "CompanyName" "Polícia Militar da Bahia - 19ª CIPM"
VIAddVersionKey "LegalCopyright" "PMBA - 19ª CIPM / PARIPE"
VIAddVersionKey "FileDescription" "Instalador do Sistema de Gestão de Frotas"
VIAddVersionKey "FileVersion" "2.0.0.0"

!define MUI_ABORTWARNING

; Páginas do Instalador
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\\GestaoFrotas19CIPM.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Abrir o Sistema de Gestão de Frota da 19ª CIPM agora"
!insertmacro MUI_PAGE_FINISH

; Páginas do Desinstalador
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "Portuguese"

Section "Instalar Arquivos" SecMain
  SetOutPath "$INSTDIR"

  File "${standaloneHtmlPath}"
  File "${launcherExe}"
  File "${readmePath}"
  File "${batPath}"

  ; Gravar informações de desinstalação no registro
  WriteRegStr HKCU "Software\\GestaoFrotas19CIPM" "Install_Dir" "$INSTDIR"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\GestaoFrotas19CIPM" "DisplayName" "19ª CIPM - Sistema de Gestão de Frotas"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\GestaoFrotas19CIPM" "UninstallString" '"$INSTDIR\\desinstalar.exe"'
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\GestaoFrotas19CIPM" "DisplayIcon" "$INSTDIR\\GestaoFrotas19CIPM.exe"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\GestaoFrotas19CIPM" "Publisher" "Polícia Militar da Bahia - 19ª CIPM"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\GestaoFrotas19CIPM" "DisplayVersion" "2.0"
  WriteRegDWORD HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\GestaoFrotas19CIPM" "NoModify" 1
  WriteRegDWORD HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\GestaoFrotas19CIPM" "NoRepair" 1

  WriteUninstaller "$INSTDIR\\desinstalar.exe"

  ; Criar atalhos no Menu Iniciar e na Área de Trabalho
  CreateDirectory "$SMPROGRAMS\\19ª CIPM - Gestão de Frotas"
  CreateShortcut "$SMPROGRAMS\\19ª CIPM - Gestão de Frotas\\19ª CIPM - Gestão de Frotas.lnk" "$INSTDIR\\GestaoFrotas19CIPM.exe" "" "$INSTDIR\\GestaoFrotas19CIPM.exe" 0
  CreateShortcut "$SMPROGRAMS\\19ª CIPM - Gestão de Frotas\\Desinstalar.lnk" "$INSTDIR\\desinstalar.exe" "" "$INSTDIR\\desinstalar.exe" 0
  
  CreateShortcut "$DESKTOP\\19ª CIPM - Gestão de Frotas.lnk" "$INSTDIR\\GestaoFrotas19CIPM.exe" "" "$INSTDIR\\GestaoFrotas19CIPM.exe" 0
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\\19ª CIPM - Gestão de Frotas.lnk"
  Delete "$SMPROGRAMS\\19ª CIPM - Gestão de Frotas\\*.*"
  RMDir "$SMPROGRAMS\\19ª CIPM - Gestão de Frotas"

  Delete "$INSTDIR\\sistema_frotas_19cipm.html"
  Delete "$INSTDIR\\GestaoFrotas19CIPM.exe"
  Delete "$INSTDIR\\LEIA-ME.txt"
  Delete "$INSTDIR\\Iniciar_Sistema.bat"
  Delete "$INSTDIR\\desinstalar.exe"
  RMDir "$INSTDIR"

  DeleteRegKey HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\GestaoFrotas19CIPM"
  DeleteRegKey HKCU "Software\\GestaoFrotas19CIPM"
SectionEnd
`;
fs.writeFileSync(nsiPath, nsiContent, 'utf8');

let hasNsis = false;
try {
  execSync('which makensis', { stdio: 'ignore' });
  hasNsis = true;
} catch (_) {}

if (hasNsis) {
  try {
    console.log('Compilando Instalador Windows com NSIS...');
    execSync(`makensis "${nsiPath}"`, { stdio: 'inherit' });
    console.log('✅ Instalador Windows gerado com sucesso: Instalador_Gestao_Frotas_19CIPM.exe');
  } catch (e) {
    console.warn('Aviso: Falha ao compilar com NSIS, mantendo binário existente:', e.message);
  }
} else {
  console.log('makensis não detectado no ambiente atual. Mantendo instalador Windows pré-compilado: Instalador_Gestao_Frotas_19CIPM.exe');
}

if (fs.existsSync(installerExe)) {
  fs.copyFileSync(installerExe, path.join(distDownloadsDir, 'Instalador_Gestao_Frotas_19CIPM.exe'));
}

// 9. Pacote ZIP portátil completo
const zipFile = path.join(downloadsDir, 'GestaoFrotas19CIPM_Windows.zip');
let hasZip = false;
try {
  execSync('which zip', { stdio: 'ignore' });
  hasZip = true;
} catch (_) {}

if (hasZip) {
  try {
    console.log('Criando pacote ZIP portátil...');
    execSync(`cd "${downloadsDir}" && zip -9 "${zipFile}" sistema_frotas_19cipm.html GestaoFrotas19CIPM.exe Instalador_Gestao_Frotas_19CIPM.exe Iniciar_Sistema.bat LEIA-ME.txt`, { stdio: 'inherit' });
    console.log('✅ Pacote ZIP criado com sucesso: GestaoFrotas19CIPM_Windows.zip');
  } catch (e) {
    console.error('Erro ao gerar ZIP:', e.message);
  }
} else {
  console.log('Comando zip não detectado no ambiente atual. Mantendo pacote zip existente: GestaoFrotas19CIPM_Windows.zip');
}

if (fs.existsSync(zipFile)) {
  fs.copyFileSync(zipFile, path.join(distDownloadsDir, 'GestaoFrotas19CIPM_Windows.zip'));
}
if (fs.existsSync(readmePath)) {
  fs.copyFileSync(readmePath, path.join(distDownloadsDir, 'LEIA-ME.txt'));
}
if (fs.existsSync(batPath)) {
  fs.copyFileSync(batPath, path.join(distDownloadsDir, 'Iniciar_Sistema.bat'));
}

console.log('=== DISTRIBUIÇÃO GERADA COM SUCESSO! ===');
const files = fs.readdirSync(downloadsDir);
for (const file of files) {
  const st = fs.statSync(path.join(downloadsDir, file));
  console.log(`- ${file} (${(st.size / 1024).toFixed(1)} KB)`);
}
