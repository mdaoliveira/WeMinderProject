import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// monta HTML do relatório (mantém simples e self-contained)
export const buildRelatorioHtml = (relatorioData) => {
  const { resumo = {}, tarefas = [] } = relatorioData || {};
  const intervalo = resumo.intervalo || "Todos";
  const total = resumo.total ?? tarefas.length;
  const dataGeracao = resumo.dataGeracao || new Date().toLocaleString("pt-BR");

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <title>Relatório de Tarefas Concluídas</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;color:#222;margin:12px}
        .resumo{background:#f3f3f3;padding:10px;border-radius:6px;margin-bottom:12px}
        table{width:100%;border-collapse:collapse}
        th,td{padding:6px;border:1px solid #ddd;text-align:left}
        th{background:#4CAF50;color:#fff}
      </style>
    </head>
    <body>
      <h1>Relatório de Tarefas Concluídas</h1>
      <div class="resumo">
        <div><strong>Total:</strong> ${total}</div>
        <div><strong>Período:</strong> ${intervalo}</div>
        <div><strong>Gerado em:</strong> ${dataGeracao}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Título</th><th>Descrição</th><th>Prioridade</th><th>Vencimento</th>
          </tr>
        </thead>
        <tbody>
          ${tarefas.map(t => `
            <tr>
              <td>${t.title || ""}</td>
              <td>${t.description || "-"}</td>
              <td>${t.priority === 1 ? "Baixa" : t.priority === 2 ? "Média" : "Alta"}</td>
              <td>${t.due_date ? new Date(t.due_date).toLocaleDateString("pt-BR") : "-"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </body>
  </html>
  `;
};

// abre HTML em nova aba (usado para preview/print)
export const openHtmlInNewTab = (html, autoPrint = false) => {
  const win = window.open("", "_blank");
  if (!win) throw new Error("Popup bloqueado");
  try {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    win.location.href = url;
    if (autoPrint) {
      win.onload = () => { try { win.print(); } catch (e) {} URL.revokeObjectURL(url); };
      setTimeout(() => { try { win.print(); } catch (e) {} URL.revokeObjectURL(url); }, 800);
    } else {
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
    return true;
  } catch (err) {
    // fallback para document.write
    try {
      win.document.open();
      win.document.write(html);
      win.document.close();
      if (autoPrint) try { win.print(); } catch (e) {}
      return true;
    } catch (e) {
      win.close();
      throw err;
    }
  }
};

// gera PDF usando html2canvas + jsPDF, retorna Blob URL ou salva como fallback
export const gerarPdfBlobUrl = async (relatorioData) => {
  if (!relatorioData) throw new Error("Relatório não fornecido");
  const html = buildRelatorioHtml(relatorioData);

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = "800px";
  container.innerHTML = html;
  document.body.appendChild(container);

  await new Promise((r) => setTimeout(r, 300));

  try {
    const canvas = await html2canvas(container, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    if (pdfHeight <= pdf.internal.pageSize.getHeight()) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    } else {
      // paginação simples por fatias verticais
      let remainingHeight = canvas.height;
      let position = 0;
      const pageHeightPx = (canvas.width * pdf.internal.pageSize.getHeight()) / pdfWidth;
      while (remainingHeight > 0) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = Math.min(pageHeightPx, remainingHeight);
        const ctx = tempCanvas.getContext("2d");
        ctx.drawImage(canvas, 0, position, canvas.width, tempCanvas.height, 0, 0, canvas.width, tempCanvas.height);
        const imgPart = tempCanvas.toDataURL("image/png");
        const partPdfHeight = (tempCanvas.height * pdfWidth) / canvas.width;
        if (position > 0) pdf.addPage();
        pdf.addImage(imgPart, "PNG", 0, 0, pdfWidth, partPdfHeight);
        position += tempCanvas.height;
        remainingHeight -= tempCanvas.height;
      }
    }

    // tentar blob
    let blob = null;
    try { blob = pdf.output && pdf.output("blob"); } catch (e) { blob = null; }
    if (!blob) {
      // fallback: criar blob a partir de data URL
      const dataUrl = pdf.output && pdf.output("dataurlnewwindow");
      // se não for possível, salvar diretamente e retornar null
      if (!blob) {
        try { pdf.save(`relatorio-tarefas-${new Date().toLocaleDateString("pt-BR").replace(/\//g,"-")}.pdf`); } catch (e) {}
        return null;
      }
    }
    const url = URL.createObjectURL(blob);
    return url;
  } finally {
    document.body.removeChild(container);
  }
};