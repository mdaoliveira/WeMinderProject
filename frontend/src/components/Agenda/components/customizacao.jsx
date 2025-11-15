import React, { useState, useEffect } from "react";

const DEFAULT_CONFIG = {
  eventBackgroundColor: "#3b82f6",
  eventBorderColor: "#3b82f6",
  eventTextColor: "#ffffff",
  eventBorderRadius: 3,
  calendarBackgroundColor: "#ffffff",
  headerBackgroundColor: "#f9fafb",
  dayCellBackgroundColor: "#ffffff",
  todayBackgroundColor: "#fef3c7",
};

export const CustomizacaoCalendarioComponent = ({ onConfigChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem("calendario-customizacao");
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
  });

  useEffect(() => {
    onConfigChange(config);
    localStorage.setItem("calendario-customizacao", JSON.stringify(config));
  }, [config, onConfigChange]);

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <>
      <button
        className="fixed bottom-10 right-10 z-[100] bg-blue-500 text-white border-none rounded-full w-14 h-14 text-2xl cursor-pointer shadow-lg transition-all duration-300 flex items-center justify-center hover:bg-blue-600 hover:scale-110 hover:shadow-xl"
        onClick={() => setIsOpen(!isOpen)}
        title="Customizar calendário"
      >
        🎨
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] animate-[fadeIn_0.2s_ease]"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-xl w-[90%] max-w-[600px] max-h-[90vh] flex flex-col shadow-2xl animate-[slideUp_0.3s_ease] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-5 border-b-2 border-gray-200 bg-gray-900 text-white">
              <h2 className="m-0 text-2xl font-semibold">
                Customizar Calendário
              </h2>
              <button
                className="bg-white/20 border-none text-white text-3xl w-9 h-9 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 leading-none hover:bg-white/30 hover:rotate-90"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <section className="mb-8 last:mb-0">
                <h3 className="m-0 mb-4 text-xl font-semibold text-gray-700 pb-2 border-b-2 border-gray-200">
                  Eventos (Tarefas)
                </h3>

                <div className="mb-5">
                  <label className="block mb-2 font-medium text-gray-600 text-[0.95rem]">
                    Cor de Fundo
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={config.eventBackgroundColor}
                      onChange={(e) =>
                        updateConfig("eventBackgroundColor", e.target.value)
                      }
                      className="w-[60px] h-10 border-2 border-gray-300 rounded-md cursor-pointer p-0.5 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded"
                    />
                    <input
                      type="text"
                      value={config.eventBackgroundColor}
                      onChange={(e) =>
                        updateConfig("eventBackgroundColor", e.target.value)
                      }
                      placeholder="#3b82f6"
                      className="flex-1 px-3 py-2.5 border-2 border-gray-300 rounded-md text-[0.95rem] font-mono transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block mb-2 font-medium text-gray-600 text-[0.95rem]">
                    Cor do Texto
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={config.eventTextColor}
                      onChange={(e) =>
                        updateConfig("eventTextColor", e.target.value)
                      }
                      className="w-[60px] h-10 border-2 border-gray-300 rounded-md cursor-pointer p-0.5 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded"
                    />
                    <input
                      type="text"
                      value={config.eventTextColor}
                      onChange={(e) =>
                        updateConfig("eventTextColor", e.target.value)
                      }
                      placeholder="#ffffff"
                      className="flex-1 px-3 py-2.5 border-2 border-gray-300 rounded-md text-[0.95rem] font-mono transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block mb-2 font-medium text-gray-600 text-[0.95rem]">
                    Arredondamento (Border Radius): {config.eventBorderRadius}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={config.eventBorderRadius}
                    onChange={(e) =>
                      updateConfig(
                        "eventBorderRadius",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 rounded bg-gray-200 outline-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200 [&::-webkit-slider-thumb]:hover:bg-blue-600 [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-200 [&::-moz-range-thumb]:hover:bg-blue-600 [&::-moz-range-thumb]:hover:scale-110"
                  />
                </div>
              </section>

              <section className="mb-8 last:mb-0">
                <h3 className="m-0 mb-4 text-xl font-semibold text-gray-700 pb-2 border-b-2 border-gray-200">
                  Calendário
                </h3>

                <div className="mb-5">
                  <label className="block mb-2 font-medium text-gray-600 text-[0.95rem]">
                    Cor de Fundo do Calendário
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={config.calendarBackgroundColor}
                      onChange={(e) => {
                        updateConfig("calendarBackgroundColor", e.target.value);
                        updateConfig("dayCellBackgroundColor", e.target.value);
                      }}
                      className="w-[60px] h-10 border-2 border-gray-300 rounded-md cursor-pointer p-0.5 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded"
                    />
                    <input
                      type="text"
                      value={config.calendarBackgroundColor}
                      onChange={(e) => {
                        updateConfig("calendarBackgroundColor", e.target.value);
                        updateConfig("dayCellBackgroundColor", e.target.value);
                      }}
                      placeholder="#ffffff"
                      className="flex-1 px-3 py-2.5 border-2 border-gray-300 rounded-md text-[0.95rem] font-mono transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block mb-2 font-medium text-gray-600 text-[0.95rem]">
                    Cor de Fundo do Cabeçalho
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={config.headerBackgroundColor}
                      onChange={(e) =>
                        updateConfig("headerBackgroundColor", e.target.value)
                      }
                      className="w-[60px] h-10 border-2 border-gray-300 rounded-md cursor-pointer p-0.5 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded"
                    />
                    <input
                      type="text"
                      value={config.headerBackgroundColor}
                      onChange={(e) =>
                        updateConfig("headerBackgroundColor", e.target.value)
                      }
                      placeholder="#f9fafb"
                      className="flex-1 px-3 py-2.5 border-2 border-gray-300 rounded-md text-[0.95rem] font-mono transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block mb-2 font-medium text-gray-600 text-[0.95rem]">
                    Cor de Fundo do Dia Atual
                  </label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={config.todayBackgroundColor}
                      onChange={(e) =>
                        updateConfig("todayBackgroundColor", e.target.value)
                      }
                      className="w-[60px] h-10 border-2 border-gray-300 rounded-md cursor-pointer p-0.5 bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded"
                    />
                    <input
                      type="text"
                      value={config.todayBackgroundColor}
                      onChange={(e) =>
                        updateConfig("todayBackgroundColor", e.target.value)
                      }
                      placeholder="#fef3c7"
                      className="flex-1 px-3 py-2.5 border-2 border-gray-300 rounded-md text-[0.95rem] font-mono transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="flex gap-3 px-6 py-5 border-t-2 border-gray-200 bg-gray-50">
              <button
                className="flex-1 px-6 py-3 border-none rounded-md text-base font-medium cursor-pointer transition-all duration-200 bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30"
                onClick={resetConfig}
              >
                Restaurar Padrão
              </button>
              <button
                className="flex-1 px-6 py-3 border-none rounded-md text-base font-medium cursor-pointer transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30"
                onClick={() => setIsOpen(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};
