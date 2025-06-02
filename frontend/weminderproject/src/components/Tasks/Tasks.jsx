import { useEffect, useState, useMemo } from "react";

const Tasks = (props) => {

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [itemClicked, setItemClicked] = useState(null);

    function clicked(item) {
        console.log("Clicou no item", item.id);
        setModalIsOpen(true);
        setItemClicked(item);
    }

    function closeModal() {
        setModalIsOpen(false);
        setItemClicked(null);
    }

    const[data, setData] = useState([]);
    
    useEffect(() => {
    fetch("http://localhost:8800/tarefas")
        .then((response) => response.json())
        .then((data) => {
            console.log("Dados ", data);
            setData(data);
        })
        .catch((error) => {
            console.error("ERROU ", error);
        });
    }, []);
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    }, [data]);
 
    return(
        <div className="content">
            {sortedData.map((item) => (
            <>
            <h1 className="data">
            {new Date(item.due_date).toLocaleDateString('pt-BR',{day: 'numeric', month: 'long', year: 'numeric'})}
            </h1>
            <div className="task_box">
                <div className="task_title"><h2>Título: {item.title}</h2></div>
                <div className="task_desc"><p>Descrição: {item.description} </p></div>
                <img src="/images/button.png" className="button_more" alt="Mais informações" onClick={() => clicked(item)}></img>
            </div>
            </>
            ))}

            <div>
                <data clicked={clicked}/>

                {modalIsOpen && itemClicked && (
                    <div className="modal">
                        <div className="modal-content">
                            <h1><b>Detalhes da Tarefa</b></h1>
                            <p><strong>Título: </strong> {itemClicked.title}</p>
                            <p><strong>Descrição: </strong> {itemClicked.description}</p>
                            <button onClick={closeModal}>Fechar</button>
                        </div>
                    </div>
            )}
            </div>

        </div>

        
        
    );
}

export default Tasks;