import React, { useEffect, useState } from "react";
import Card from "../card/card";
import { buildRelatorioHtml, openHtmlInNewTab, gerarPdfBlobUrl } from "./pdfUtils";
import ExportButtons from "./ExportButtons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TarefasConcluidas = ({ onTaskClicked, reloadPage }) => {
  const [data, setData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [allSelected, setAllSelected] = useState(true);
  const [customRange, setCustomRange] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [relatorioData, setRelatorioData] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  function abrirModalRelatorio() {
    setModalOpen(true);
    setModalType("relatorio");
    // limpa relatório anterior ao abrir modal
    setRelatorioData(null);
  }

  async function gerarRelatorio() {
    // monta a URL conforme seleção
    let url = "http://localhost:8800/tarefas/relatorio/concluidas";
    if (customRange && dataInicio && dataFim) {
      url += `?dataInicio=${dataInicio}&dataFim=${dataFim}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("HTTP " + response.status);
      const ct = response.headers.get("content-type") || "";
      if (!ct.includes("application/json")) throw new Error("Resposta não é JSON: " + ct);
      const resultado = await response.json();
      setRelatorioData(resultado);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório: " + error.message);
    }
  }

  useEffect(() => {
    fetchTarefas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadPage]);

  const fetchTarefas = () => {
    fetch("http://localhost:8800/tarefas")
      .then((response) => response.json())
      .then((data) => {
        const tarefasConcluidas = data.filter(
          (tarefa) => tarefa.is_completed === true || tarefa.is_completed === 1
        );

        const sortedData = tarefasConcluidas.sort((a, b) => {
          const dataA = new Date(a.due_date);
          const dataB = new Date(b.due_date);

          if (dataA.getTime() !== dataB.getTime()) {
            return dataA - dataB;
          }

          let aIsZero = a.priority === 0 ? 1 : 0;
          let bIsZero = b.priority === 0 ? 1 : 0;

          if (aIsZero !== bIsZero) {
            return aIsZero - bIsZero;
          }

          return a.priority - b.priority;
        });

        setData(sortedData);
      })
      .catch((error) => console.error("Erro:", error));
  };

  const agruparPorData = (tarefas) => {
    const agrupado = [];
    let ultimaData = null;

    tarefas.forEach((tarefa) => {
      const dataFormatada = tarefa.due_date
        ? new Date(tarefa.due_date).toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Sem data";
      if (!ultimaData || ultimaData !== dataFormatada) {
        agrupado.push({ data: dataFormatada, tarefas: [tarefa] });
        ultimaData = dataFormatada;
      } else {
        agrupado[agrupado.length - 1].tarefas.push(tarefa);
      }
    });

    return agrupado;
  };

  const tarefasAgrupadas = agruparPorData(data);

  const getCardPosition = () => {
    try {
      const pos = getComputedStyle(document.documentElement)
        .getPropertyValue("--card-position")
        .trim();
      return pos === "colunas" ? "colunas" : "lista";
    } catch (e) {
      return "lista";
    }
  };

  const cardPosition = getCardPosition();

  // Abre HTML em nova aba (abre janela primeiro para evitar bloqueador)
  const openHtmlInNewTab = (html, autoPrint = false) => {
    const win = window.open("", "_blank");
    if (!win) {
      console.warn("Nova aba bloqueada pelo navegador");
      alert("Não foi possível abrir nova aba — verifique o bloqueador de popups.");
      return;
    }

    try {
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      win.location.href = url;

      if (autoPrint) {
        win.onload = () => {
          try {
            win.print();
          } catch (e) {
            /* ignora */
          }
          URL.revokeObjectURL(url);
        };

        setTimeout(() => {
          try {
            win.print();
          } catch (e) {
            /* ignora */
          }
          URL.revokeObjectURL(url);
        }, 800);
      } else {
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } catch (e) {
      try {
        win.document.open();
        win.document.write(html);
        win.document.close();
        if (autoPrint) try { win.print(); } catch (err) { /* ignora */ }
      } catch (err) {
        console.error("Falha ao abrir relatório na nova aba:", err);
        win.close();
      }
    }
  };

  // gera PDF (html2canvas -> jsPDF). se win for fornecido, abre o PDF nessa aba em vez de forçar download
  const gerarPdf = async (relatorioData, win = null) => {
    if (!relatorioData) return alert("Gere o relatório primeiro.");

    setLoadingPdf(true);
    const html = buildRelatorioHtml(relatorioData);

    // cria container offscreen
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-10000px";
    container.style.top = "0";
    container.style.width = "800px"; // largura fixa ajuda no dimensionamento
    container.innerHTML = html;
    document.body.appendChild(container);

    // espera o browser renderizar fontes/imagens
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
        // paginar
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

      // tentar obter bloburl direto do jsPDF
      let pdfUrl = null;
      try {
        pdfUrl = pdf.output && pdf.output("bloburl");
      } catch (e) {
        pdfUrl = null;
      }

      if (!pdfUrl) {
        // tentar obter blob
        let blob = null;
        try {
          blob = pdf.output && pdf.output("blob");
        } catch (e) {
          blob = null;
        }
        if (blob) pdfUrl = URL.createObjectURL(blob);
      }

      if (!pdfUrl) {
        // último recurso: salvar arquivo (download)
        pdf.save(`relatorio-tarefas-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`);
        return;
      }

      if (win && !win.closed) {
        try {
          win.location.href = pdfUrl;
          setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
          return;
        } catch (err) {
          console.warn("Não foi possível navegar a janela fornecida:", err);
        }
      }

      const newWin = window.open(pdfUrl, "_blank");
      if (!newWin) {
        pdf.save(`relatorio-tarefas-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`);
      } else {
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
      }
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Erro ao gerar PDF: " + err.message);
    } finally {
      document.body.removeChild(container);
      setLoadingPdf(false);
    }
  };

  // helper: abre aba imediatamente e chama gerarPdf passando a referência da janela
  const gerarPdfEabrirEmAba = async (relatorioData) => {
    const win = window.open("", "_blank");
    if (!win) {
      alert("Não foi possível abrir nova aba — verifique o bloqueador de popups.");
      return;
    }
    try {
      win.document.write("<p>Gerando relatório... aguarde</p>");
      win.document.close();
    } catch (e) {
      // alguns navegadores bloqueiam document.write em abas vazias; não é fatal
    }

    await gerarPdf(relatorioData, win);
  };

  // handlers para os botões (mantêm estado loading aqui)
  const handleOpenHtml = () => {
    try {
      const html = buildRelatorioHtml(relatorioData);
      openHtmlInNewTab(html, true);
    } catch (e) {
      alert("Não foi possível abrir nova aba: " + e.message);
    }
  };

  const handleDownloadPdf = async () => {
    setLoadingPdf(true);
    try {
      const url = await gerarPdfBlobUrl(relatorioData);
      if (url) {
        // força download
        const a = document.createElement("a");
        a.href = url;
        a.download = `relatorio-tarefas-${new Date().toLocaleDateString("pt-BR").replace(/\//g,"-")}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar PDF: " + (err.message || err));
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleOpenPdfInTab = async () => {
    setLoadingPdf(true);
    try {
      const url = await gerarPdfBlobUrl(relatorioData);
      if (url) {
        const w = window.open(url, "_blank");
        if (!w) {
          // se bloqueado, baixar
          const a = document.createElement("a");
          a.href = url;
          a.download = `relatorio-tarefas-${new Date().toLocaleDateString("pt-BR").replace(/\//g,"-")}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar PDF: " + (err.message || err));
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <>
      {/* Modal para geração de relatório */}
      {modalOpen && modalType === "relatorio" && (
        <div className="modal-relatorio fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-[color:var(--card-color)] rounded-lg shadow-lg max-w-xl w-full p-6">
            <h2 className="text-[color:var(--text-color)] text-xl font-bold mb-2">Relatório de Tarefas Concluídas</h2>
            <p className="text-[color:var(--text-color)] mb-4">
              Deseja que o relatório seja de todas as tarefas concluídas até agora, ou um intervalo personalizado?
            </p>

            <div className="text-[color:var(--text-color)] flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  checked={allSelected}
                  onChange={() => { setAllSelected(true); setCustomRange(false); }}
                  className="form-radio"
                />
                <span className="ml-2">Todas as tarefas concluídas</span>
              </label>

              <label className="inline-flex items-center">
                <input
                  type="radio"
                  checked={customRange}
                  onChange={() => { setAllSelected(false); setCustomRange(true); }}
                  className="form-radio"
                />
                <span className="ml-2">Intervalo personalizado</span>
              </label>
            </div>

            {customRange && (
              <div className="mt-4 text-[color:var(--text-color)] flex flex-col gap-3">
                <div>
                  <label className="block text-sm mb-1">Entre</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full p-2 border rounded-md text-black dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">e</label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full p-2 border rounded-md text-black dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* linha com Fechar / Gerar */}
            <div className="flex justify-between items-center pt-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-3 py-2 rounded"
                onClick={() => { setModalOpen(false); setRelatorioData(null); }}
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={gerarRelatorio}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded"
              >
                Gerar Relatório
              </button>
            </div>

            {/* export buttons: abaixo de Fechar/Gerar */}
            {relatorioData && (
              <ExportButtons
                loading={loadingPdf}
                onOpenHtml={handleOpenHtml}
                onDownloadPdf={handleDownloadPdf}
                onOpenPdfInTab={handleOpenPdfInTab}
              />
            )}

            {/* resumo dentro do modal */}
            {relatorioData && (
              <div className="mt-4 text-[color:var(--text-color)] max-h-48 overflow-auto text-sm">
                <strong>Resumo:</strong>
                <div className="mt-2">
                  Total: {relatorioData.resumo?.total ?? relatorioData.tarefas?.length ?? "-"} <br />
                  Período: {relatorioData.resumo?.intervalo ?? "Todos"} <br />
                  Gerado em: {relatorioData.resumo?.dataGeracao ?? new Date().toLocaleString("pt-BR")}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botão sempre visível */}
      <div className="w-full flex justify-center mt-4">
        <button
          className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded"
          onClick={abrirModalRelatorio}
        >
          Gerar Relatório
        </button>
      </div>

      {/* Cards agrupados */}
      {cardPosition === "colunas" ? (
        <div className="w-full min-h-screen overflow-x-auto flex flex-row flex-wrap justify-start gap-8 px-1 py-1 bg-[color:var(--background-color)] dark:bg-gray-900">
          {tarefasAgrupadas.map((conjtarefa) => (
            <div key={conjtarefa.data} className="flex flex-col items-start bg-transparent">
              <h1 className="text-[color:var(--text-color)] dark:text-gray-300 text-lg font-bold mb-3">{conjtarefa.data}</h1>
              <div className="flex flex-col gap-4">{conjtarefa.tarefas.map((tarefa) => Card(tarefa, onTaskClicked))}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full min-h-screen overflow-y-auto flex flex-col items-center bg-[color:var(--background-color)] dark:bg-gray-900 px-4 py-8">
          {tarefasAgrupadas.map((conjtarefa) => (
            <React.Fragment key={conjtarefa.data}>
              <h1 className="text-[color:var(--text-color)] dark:text-gray-300 text-lg font-bold mt-6 mb-2 w-full max-w-xl text-left">{conjtarefa.data}</h1>
              {conjtarefa.tarefas.map((tarefa) => Card(tarefa, onTaskClicked))}
            </React.Fragment>
          ))}
        </div>
      )}

    </>
  );
};

export default TarefasConcluidas;
