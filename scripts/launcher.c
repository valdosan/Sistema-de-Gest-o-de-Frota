#include <windows.h>
#include <stdio.h>
#include <string.h>

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    char exePath[MAX_PATH];
    GetModuleFileNameA(NULL, exePath, MAX_PATH);
    char *lastSlash = strrchr(exePath, '\\');
    if (lastSlash != NULL) {
        *(lastSlash + 1) = '\0';
    }

    char htmlPath[MAX_PATH];
    snprintf(htmlPath, sizeof(htmlPath), "%ssistema_frotas_19cipm.html", exePath);

    // Candidatos para Microsoft Edge no Windows 10 e 11
    const char *edgeCandidates[] = {
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
    };

    char foundEdge[MAX_PATH] = {0};
    for (int i = 0; i < 2; i++) {
        DWORD attrib = GetFileAttributesA(edgeCandidates[i]);
        if (attrib != INVALID_FILE_ATTRIBUTES && !(attrib & FILE_ATTRIBUTE_DIRECTORY)) {
            strncpy(foundEdge, edgeCandidates[i], sizeof(foundEdge) - 1);
            break;
        }
    }

    if (foundEdge[0] != '\0') {
        // Executa em modo Aplicativo nativo do Edge (sem barra de URL, sem abas)
        char args[MAX_PATH * 3];
        snprintf(args, sizeof(args), "--app=\"file:///%s\" --window-size=1366,850 --start-maximized", htmlPath);
        ShellExecuteA(NULL, "open", foundEdge, args, NULL, SW_SHOWNORMAL);
    } else {
        // Fallback: abre no navegador padrão do Windows
        ShellExecuteA(NULL, "open", htmlPath, NULL, NULL, SW_SHOWNORMAL);
    }

    return 0;
}
