import React, {useState} from "react";
import TarefasSimples from "./tarefasSimples";
import TarefasComplexas from "./tarefasComplexas";


function CadastroDeTarefas({closeModal}){
    const[tipoTarefa, setTipoTarefa] = useState(''); // mantém o item (radio) que foi selecionado

    function handleTipoTarefa(e){
        setTipoTarefa(e.target.value);
    }

    return(
        <div className="cadastro-tarefas">
            <form>
                <label>
                    <input type="radio" name="tipoTarefa" value={"simples"} checked={tipoTarefa === 'simples'} onChange={handleTipoTarefa}/>
                    Tarefas Simples
                </label>
                <br></br>
                <label>
                    <input type="radio" name="tipoTarefa" value={"complexa"} checked={tipoTarefa === 'complexa'} onChange={handleTipoTarefa} />
                    Tarefas Complexas
                </label>
            </form>

            {/*Colocando o componente conforme "solicitado" pelo usuário*/}
            {tipoTarefa === 'simples' && <TarefasSimples/>}
            {tipoTarefa === 'complexa' && <TarefasComplexas/>}
            <div className="botoes">
            <button onClick={closeModal}>Fechar</button>
            <button>Cadastrar</button>
            </div>
        </div>
    );
}
export default CadastroDeTarefas;