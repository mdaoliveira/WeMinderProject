// import React, { useState, useEffect } from 'react';

// function EditarTarefas({ tarefa, closeModal, setReloadCount }) {
//     const [titulo, setTitulo] = useState('');
//     const [descricao, setDescricao] = useState('');
//     const [data, setData] = useState('');
//     const [prioridade, setPrioridade] = useState('');
//     const [subtarefas, setSubtarefas] = useState([]);

//     const updateTask = (e) => {
//         e.preventDefault();


//         fetch(`http://localhost:8800/tarefas/${tarefa.id}`, {
//             method: "PUT",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify()
//         })
//         .then(res => {
//         })
//         .then(() => {
//             setReloadCount(prev => prev + 1);
//             closeModal();
//         })
//         .catch(err => {
//             console.error("Erro:", err);
//         });
//     };

//     return (
//         <div className="modal-content">
//             <h2>Editar Tarefa</h2>
//             <form onSubmit={updateTask}>
//                 <label>
//                     Título:
//                     <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
//                 </label><br />

//                 <label>
//                     Descrição:
//                     <input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
//                 </label><br />

//                 <label>
//                     Data:
//                     <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
//                 </label><br />

//                 {tarefa.is_complex && (
//                     <div>
//                     </div>
//                 )}

//                 <br />
//                 <button type="submit">Salvar</button>
//                 <button type="button" onClick={closeModal}>Cancelar</button>
//             </form>
//         </div>
//     );
// }

// export default EditarTarefas;
