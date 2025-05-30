function CadastroDeTarefas(){
    return(
        <div className="cadastro-tarefas">
            <form>
                <label>
                    <input type="radio" name="tipoTarefa" />
                    Tarefas Simples
                </label>
                <label>
                    <input type="radio" name="tipoTarefa" />
                    Tarefas Composta
                </label>
            </form>
        </div>
    );
}
export default CadastroDeTarefas;