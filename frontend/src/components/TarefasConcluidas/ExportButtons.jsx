import React from "react";

const ExportButtons = ({ loading, onOpenHtml, onDownloadPdf, onOpenPdfInTab }) => {
  return (
    <div className="mt-4 border-t pt-4">
      <div className="text-[color:var(--text-color)] mb-2 text-sm">Exportar relatório:</div>
      <ul>
        <div className="flex flex-col sm:flex-row gap-2">
            <li>
                <button
                onClick={onOpenHtml}
                className="flex-1 sm:flex-none w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded"
                >
                Abrir relatório em nova guia
                </button>
            </li>

            <li>
                <button
                onClick={onDownloadPdf}
                disabled={loading}
                className="flex-1 sm:flex-none w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-2 rounded"
                >
                {loading ? "Gerando PDF..." : "Baixar PDF (jsPDF)"}
                </button>
            </li>

            <li>
            <button
                onClick={onOpenPdfInTab}
                disabled={loading}
                className="flex-1 sm:flex-none w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-2 rounded"
                >
                {loading ? "Gerando PDF..." : "Abrir PDF em nova guia"}
                </button>
            </li>
          </div>
        </ul>   
    </div>
  );
};

export default ExportButtons;