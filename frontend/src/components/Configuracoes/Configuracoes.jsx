import React, { useState, useEffect } from "react";

function Configuracoes({ closeModal, setColor }) {
  const [changeColor, setChangeColor] = useState(null);
  const [elementChange, setElementChange] = useState("text");
  const [cardPosition, setCardPosition] = useState("lista");

  const coresPadrao = { text: "#000000", sidebar: "#f3f4f6", background: "#f3f4f6", card: "#ffffff", card_position: "lista",
  };

  const selecaoCores = ["#ffffff","#9b8e8eff","#c5363bff","#ff7f27","#f0ea80ff","#22b14c","#00A2E8","#6a73ebff",
    "#c352c5ff","#d18760ff","#ffaec9"];

  useEffect(() => {
    const textColor =getComputedStyle(document.documentElement).getPropertyValue("--text-color").trim() || coresPadrao.text;
    const cardPos =getComputedStyle(document.documentElement).getPropertyValue("--card-position").trim() || coresPadrao.card_position;
    setCardPosition(cardPos);
    setColor(textColor);
  }, [setColor]);

  const updateCardPosition = (posicao) => {
    document.documentElement.style.setProperty("--card-position", posicao);

    fetch("http://localhost:8800/color", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        card_position: posicao,
      }),
    }).catch(console.error);

    alert("Ordenação alterada");
  };

  const updateColor = (e) => {
    e.preventDefault();
    if (!changeColor) {
      alert("Selecione uma cor primeiro!");
      return;
    }

    const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text-color").trim() || coresPadrao.text;
    const sidebarColor = getComputedStyle(document.documentElement).getPropertyValue("--sidebar-color").trim() || coresPadrao.sidebar;
    const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--background-color").trim() || coresPadrao.background;
    const cardColor = getComputedStyle(document.documentElement).getPropertyValue("--card-color").trim() || coresPadrao.card;

    const colorVars = {
      text: textColor,
      sidebar: sidebarColor,
      background: backgroundColor,
      card: cardColor
    };

    if (elementChange === "text") {
      const coresElementos = ["sidebar", "background", "card"].map((key) => colorVars[key]
      );
      // se cor estiver nos elementos não ir para o texto
      if (coresElementos.includes(changeColor)) {
        alert("A cor do texto deve ser diferente!");
        return;
      }
    }
    // se for ao contrário
    if (elementChange !== "text" && changeColor === textColor) {
      alert("Nenhum elemento pode usar a mesma cor do texto!");
      return;
    }
    // elemento mudado
    document.documentElement.style.setProperty( `--${elementChange}-color`,changeColor);
    // texto mudado
    if (elementChange === "text") setColor(changeColor);

    const saveColor = {
      color: elementChange === "text" ? changeColor : textColor,
      sidebar: elementChange === "sidebar" ? changeColor : sidebarColor,
      background: elementChange === "background" ? changeColor : backgroundColor,
      card: elementChange === "card" ? changeColor : cardColor,
      card_position: cardPosition
    };

    fetch("http://localhost:8800/color", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saveColor)
    }).catch(console.error);

    setChangeColor(null);
  };

  const restaurarPadrao = () => {
    Object.entries(coresPadrao).forEach(([key, value]) => {
      if (key === "card_position") return;
      document.documentElement.style.setProperty(`--${key}-color`, value);
    });
    document.documentElement.style.setProperty("--card-position",coresPadrao.card_position);

    setColor(coresPadrao.text);
    setChangeColor(null);
    setCardPosition(coresPadrao.card_position);

    fetch("http://localhost:8800/color", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coresPadrao),
    }).catch(console.error);
  };
  // indica o elemento para atualizar
  const handleElementChange = (value) => setElementChange(value);

  return (
    <div className="modal-show flex items-center justify-center">
      <div className="modal-content text-[color:var(--text-color)] bg-[color:var(--card-color)] p-6 rounded-lg shadow-lg">
        <h1 className="text-xl font-bold mb-4">Personalização</h1>

        {/* Selecionar cor */}
        <form id="colorForm" onSubmit={updateColor} className="flex flex-col gap-4">
          <label className="font-semibold">Selecionar elemento:</label>
          <select
            className="cursor-pointer bg-[color:var(--card-color)] border rounded-md px-2 py-1"
            value={elementChange} onChange={(e) => handleElementChange(e.target.value)}
          >
            <option value="text">Texto</option>
            <option value="sidebar">Sidebar</option>
            <option value="background">Background</option>
            <option value="card">Card</option>
          </select>

          <label className="font-semibold mt-2">Selecionar cor:</label>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {selecaoCores.map((color) => (
              <button
                key={color} type="button" className="w-6 h-6 rounded border" style={{backgroundColor: color,
                  border: changeColor === color ? "3px solid blue" : "1px solid #ccc"}}
                onClick={() => setChangeColor(color)}/>))}
          </div>
        </form>

        {/* restaurar */}
        <div className="flex items-center justify-between mt-5">
          <button
            type="button" onClick={restaurarPadrao} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-3 py-1 rounded"
          >
            Restaurar cores padrão
          </button>
        </div>

        {/* Ordenação */}
        <div className="flex justify-between items-center pt-6">
          <label className="font-semibold">Posição dos Cards:</label>
          <select
            className="cursor-pointer bg-[color:var(--card-color)] border rounded-md px-2 py-1" value={cardPosition}
            onChange={(e) => { setCardPosition(e.target.value); updateCardPosition(e.target.value);
            }} >
            <option value="lista">Lista Vertical</option>
            <option value="colunas">Colunas</option>
          </select>
        </div>

        <div className="flex justify-between items-center pt-6">
          <button type="button" onClick={closeModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded"
          >Fechar</button>
          <button type="submit" form="colorForm" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded"
          >Confirmar</button>
        </div>
      </div>
    </div>
  );
}

export default Configuracoes;

