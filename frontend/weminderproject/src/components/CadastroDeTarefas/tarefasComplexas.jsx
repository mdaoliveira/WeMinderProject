function TarefasComplexas(){
    return(
        <div className="cadastro-tarefa">
            <h2 className="titulo-div">Criar Tarefa Simples</h2>
            <label className="content-cadastro">Título</label>
            <input type="text" id="titulo" name="texto"/>

            <br/>

            <label className="content-cadastro">Descrição</label>
            <input type="text" id="descricao" name="texto"/>

            <h3 className="cadastro-subtarefas">Subtarefas</h3>
            <label className="content-cadastro">Nome</label>
            <input type="text" id="nome" name="texto"/>

            <br/>

            <label className="content-cadastro">Descrição</label>
            <input type="text" id="descricao" name="texto"/>
           
            <br/>
        </div>
    );
}

export default TarefasComplexas;