function TarefasSimples() {
    return (
        <div className="cadastro-tarefa">
            <h2 className="titulo-div">Criar Tarefa Simples</h2>
            <label className="content-cadastro">Título</label>
            <input type="text" id="titulo" name="texto"/>
            <label className="content-cadastro">Descrição</label>
            <input type="text" id="descricao" name="texto"/>
            <label>
                <input type="radio" name="tipoTarefa" />
                    Sem Prioridade
                </label>
            <br/>
            <label>
                <input type="radio" name="tipoTarefa" />
                    Prioridade Alta
                </label>
            <br/>
            <label>
                <input type="radio" name="tipoTarefa" />
                    Prioridade Média
                </label>
            <br/>
            <label>
                <input type="radio" name="tipoTarefa" />
                    Prioridade Baixa
                </label>
            <br/>
        </div>
    );
}

export default TarefasSimples;