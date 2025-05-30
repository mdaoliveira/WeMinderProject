import { useState } from 'react';

function TarefasComplexas(){

    const [subtarefas, setSubtarefas] = useState([]);

    const adicionarSubtarefa = () => {
        setSubtarefas([...subtarefas, "subtarefa"]);
    };

    return(
        <div className="cadastro-tarefa">
            <h2 className="titulo-div">Criar Tarefa Complexa</h2>
            <label className="content-cadastro">Título</label>
            <input type="text" id="titulo" name="texto"/>

            <br/>

            <label className="content-cadastro">Descrição</label>
            <input type="text" id="descricao" name="texto"/>

            <div className="subtarefas-header">
                <h3 className="cadastro-subtarefas">Subtarefas</h3>
                <label className="cadastro-subtarefas adicionar-subtarefa">
                    <u onClick={adicionarSubtarefa}>Adicionar Subtarefa</u>
                    <img src="/images/plus symbol.png" className="plus-symbol"></img>
                </label>
            </div>

            <label className="content-cadastro">Nome</label>
            <input type="text" id="nome" name="texto"/>
            <br/>
            <label className="content-cadastro">Descrição</label>
            <input type="text" id="descricao" name="texto"/>
           
            {subtarefas.map((item) => (
                <div>  
                    <hr />
                    <label className="content-cadastro">Nome</label>
                    <input type="text" id="nome" name="texto"/>
                    <br/>
                    <label className="content-cadastro">Descrição</label>
                    <input type="text" id="descricao" name="texto"/>
                </div>
            ))}

            <br/>
        </div>
    );
}

export default TarefasComplexas;