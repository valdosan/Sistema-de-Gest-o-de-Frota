@echo off
title Gestao de Frotas - 19a CIPM / PARIPE
cd /d "%~dp0"
if exist GestaoFrotas19CIPM.exe (
    start "" GestaoFrotas19CIPM.exe
) else (
    start "" sistema_frotas_19cipm.html
)
exit
