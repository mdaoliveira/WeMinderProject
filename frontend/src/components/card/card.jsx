
function Card(tarefa, onTaskClicked){
    return(
        <div
            key={tarefa.id}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6 w-full max-w-xl flex justify-between items-center cursor-pointer"
            onClick={() => onTaskClicked(tarefa)}
            >
            {/* const tarefasPrioridade = {tarefa.priority} */}

            <div className="flex flex-col max-w-[85%]">
                <h2 className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-2 truncate">
                Título: {tarefa.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 truncate">
                Descrição: {tarefa.description}
                </p>
            </div>
            <input type="checkbox">
            </input>
            <img
                src="/images/olho.png"
                alt="Mais informações"
                className="h-8 w-8 cursor-pointer ml-4"
                onClick={(e) => {
                e.stopPropagation(); // evitar disparar onClick do card
                onTaskClicked(tarefa);
                }}
            />
            </div>
    );
}
export default Card