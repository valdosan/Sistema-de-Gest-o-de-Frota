!include "MUI2.nsh"
!include "FileFunc.nsh"

Unicode True
Name "19ª CIPM - Gestão de Frotas"
OutFile "/app/applet/public/downloads/Instalador_Gestao_Frotas_19CIPM.exe"
InstallDir "$LOCALAPPDATA\GestaoFrotas19CIPM"
InstallDirRegKey HKCU "Software\GestaoFrotas19CIPM" "Install_Dir"
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
!define MUI_FINISHPAGE_RUN "$INSTDIR\GestaoFrotas19CIPM.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Abrir o Sistema de Gestão de Frota da 19ª CIPM agora"
!insertmacro MUI_PAGE_FINISH

; Páginas do Desinstalador
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "Portuguese"

Section "Instalar Arquivos" SecMain
  SetOutPath "$INSTDIR"

  File "/app/applet/public/downloads/sistema_frotas_19cipm.html"
  File "/app/applet/public/downloads/GestaoFrotas19CIPM.exe"
  File "/app/applet/public/downloads/LEIA-ME.txt"
  File "/app/applet/public/downloads/Iniciar_Sistema.bat"

  ; Gravar informações de desinstalação no registro
  WriteRegStr HKCU "Software\GestaoFrotas19CIPM" "Install_Dir" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GestaoFrotas19CIPM" "DisplayName" "19ª CIPM - Sistema de Gestão de Frotas"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GestaoFrotas19CIPM" "UninstallString" '"$INSTDIR\desinstalar.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GestaoFrotas19CIPM" "DisplayIcon" "$INSTDIR\GestaoFrotas19CIPM.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GestaoFrotas19CIPM" "Publisher" "Polícia Militar da Bahia - 19ª CIPM"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GestaoFrotas19CIPM" "DisplayVersion" "2.0"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GestaoFrotas19CIPM" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GestaoFrotas19CIPM" "NoRepair" 1

  WriteUninstaller "$INSTDIR\desinstalar.exe"

  ; Criar atalhos no Menu Iniciar e na Área de Trabalho
  CreateDirectory "$SMPROGRAMS\19ª CIPM - Gestão de Frotas"
  CreateShortcut "$SMPROGRAMS\19ª CIPM - Gestão de Frotas\19ª CIPM - Gestão de Frotas.lnk" "$INSTDIR\GestaoFrotas19CIPM.exe" "" "$INSTDIR\GestaoFrotas19CIPM.exe" 0
  CreateShortcut "$SMPROGRAMS\19ª CIPM - Gestão de Frotas\Desinstalar.lnk" "$INSTDIR\desinstalar.exe" "" "$INSTDIR\desinstalar.exe" 0
  
  CreateShortcut "$DESKTOP\19ª CIPM - Gestão de Frotas.lnk" "$INSTDIR\GestaoFrotas19CIPM.exe" "" "$INSTDIR\GestaoFrotas19CIPM.exe" 0
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\19ª CIPM - Gestão de Frotas.lnk"
  Delete "$SMPROGRAMS\19ª CIPM - Gestão de Frotas\*.*"
  RMDir "$SMPROGRAMS\19ª CIPM - Gestão de Frotas"

  Delete "$INSTDIR\sistema_frotas_19cipm.html"
  Delete "$INSTDIR\GestaoFrotas19CIPM.exe"
  Delete "$INSTDIR\LEIA-ME.txt"
  Delete "$INSTDIR\Iniciar_Sistema.bat"
  Delete "$INSTDIR\desinstalar.exe"
  RMDir "$INSTDIR"

  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GestaoFrotas19CIPM"
  DeleteRegKey HKCU "Software\GestaoFrotas19CIPM"
SectionEnd
