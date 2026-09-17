/**
 * Utilitário de Impressão Robusto para Ambientes Web e iFrames
 * 
 * Suporta impressão direta com window.print() e impressão isolada via iframe invisível,
 * garantindo que menus, barras de rolagem e cabeçalhos externos nunca interfiram na impressão
 * e que todas as imagens (assinaturas, fotos das viaturas, medidor de combustível) estejam
 * 100% carregadas antes do diálogo de impressão abrir.
 */

export const triggerPrintDocument = (elementId: string, documentTitle = "Documento PMBA"): void => {
  const element = document.getElementById(elementId);
  if (!element) {
    // Fallback se o ID específico não existir
    window.focus();
    window.print();
    return;
  }

  // Clona o elemento para não alterar o DOM atual
  const clone = element.cloneNode(true) as HTMLElement;

  // Remove botões e elementos de ação dentro do clone
  const actionButtons = clone.querySelectorAll(
    "button, .no-print, .print\\:hidden, [role='toolbar'], input[type='checkbox']"
  );
  actionButtons.forEach((btn) => {
    // Se não for um checkbox informativo visual, remove
    if (btn.tagName === "BUTTON") {
      btn.remove();
    }
  });

  // Cria um iframe temporário e oculto
  const iframe = document.createElement("iframe");
  iframe.id = "print-isolated-iframe";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    // Fallback se iframe falhar
    window.focus();
    window.print();
    return;
  }

  // Coleta os estilos da página atual
  const styleTags = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map((el) => el.outerHTML)
    .join("\n");

  const printStyles = `
    <style>
      @page {
        size: A4 portrait;
        margin: 6mm 8mm;
      }
      *, *::before, *::after {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body {
        width: 100%;
        margin: 0;
        padding: 0;
        background: #ffffff !important;
        color: #0f172a !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 11px;
      }
      .print\\:hidden, .no-print, button {
        display: none !important;
      }
      #checklist-a4-sheet, .printable-card {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 auto !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }
      img {
        max-width: 100% !important;
        display: block;
        page-break-inside: avoid !important;
      }
      table {
        width: 100% !important;
        border-collapse: collapse !important;
        page-break-inside: avoid !important;
      }
      th, td {
        border-color: #0f172a !important;
      }
      .page-break-avoid {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    </style>
  `;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>${documentTitle}</title>
      ${styleTags}
      ${printStyles}
    </head>
    <body>
      <div style="width: 100%; padding: 4px;">
        ${clone.outerHTML}
      </div>
    </body>
    </html>
  `);
  doc.close();

  // Aguarda o carregamento de todas as imagens (assinatura, fotos das viaturas, etc.)
  const images = Array.from(doc.images);
  const imagePromises = images.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  });

  Promise.all(imagePromises).then(() => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn("Falha no iframe print, acionando window.print:", err);
        window.focus();
        window.print();
      } finally {
        // Limpa o iframe após o uso
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 3000);
      }
    }, 250);
  });
};

/**
 * Disparador rápido para relatórios de tabela e visualizações gerais
 */
export const triggerPrintGeneric = (): void => {
  window.focus();
  setTimeout(() => {
    window.print();
  }, 100);
};
