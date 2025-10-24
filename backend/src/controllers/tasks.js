import { db } from "../database/db.js";

export const getTasks = (req, res) => {
    const qTasks = "SELECT * FROM tasks";
    const qSubtasks = "SELECT * FROM subtasks";

    db.query(qTasks, (err, tasks) => {
        if (err) return res.status(500).json("Erro de servidor!");
        db.query(qSubtasks, (err2, subtasks) => {
            if (err2) return res.status(500).json("Erro de servidor!");
            const data = tasks.map((task) => {
                const existSubtasks = subtasks.filter(
                    (sub) => sub.parent_task_id === task.id
                );
                return { ...task, subtasks: existSubtasks };
            });
            return res.status(200).json(data);
        });  
    });
}

export const postTask = (req, res) => {
    const {title, description, priority, due_date, is_completed, is_complex, subtasks} = req.body;
    const qTask = `INSERT INTO tasks (title, description, priority, due_date, is_completed, is_complex)
    VALUES(?,?,?,?,?,?)`;
    const values = [title, description, priority, due_date, is_completed || false, is_complex || false];
    
    db.query(qTask, values, (err, result) => {
        if (err) return res.status(500).json(err);
        const taskId = result.insertId;
        const createdTask = {id: taskId, title, description, priority, due_date, is_completed, is_complex, subtasks};
        if (!is_complex || !subtasks || subtasks.length === 0){
            return res.status(201).json(createdTask);
        }

        // subtarefas
        const qSubtask =  `INSERT INTO subtasks (parent_task_id, title, description, priority, due_date, is_completed)
            VALUES ?`;

        const subtaskValues = subtasks.map(sub => [
            taskId,
            sub.title,
            sub.description || null,
            sub.priority,
            sub.due_date,
            sub.is_completed || false
        ]);

        db.query(qSubtask, [subtaskValues], (err2) => {
            if (err2) return res.status(500).json(err2);
            return res.status(201).json(createdTask);
        });
    });
};


export const deleteTask = (req, res) => {
  const taskId = req.params.id;
  const deleteSubtasksQ = "DELETE FROM subtasks WHERE parent_task_id = ?";

  db.query(deleteSubtasksQ, [taskId], (err) => {
    if (err) return res.sendStatus(500);
    const deleteTaskQ = "DELETE FROM tasks WHERE id = ?";

    db.query(deleteTaskQ, [taskId], (err2) => {
      if (err2) return res.sendStatus(500);
      return res.status(200).json({ message: "Tarefa excluída com sucesso" });
    });
  });
};


// export const putTask = (req, res) => {
//     const taskId = req.params.id;
//     const {
//         title,
//         description,
//         priority,
//         due_date,
//         is_completed,
//         is_complex,
//         subtasks
//     } = req.body;

//     // Atualiza a tarefa principal
//     const updateTaskQ = `
//         UPDATE tasks SET title=?, description=?, priority=?, due_date=?, is_completed=?, is_complex=?
//         WHERE id=?
//     `;
//     const taskValues = [title, description, priority, due_date, is_completed || false, is_complex || false, taskId];

//     db.query(updateTaskQ, taskValues, (err) => {
//         if (err) return res.status(500).json({ message: "Erro ao atualizar tarefa", error: err });

//         // Se for tarefa simples, retorna
//         if (!is_complex) {
//             return res.status(200).json({ message: "Tarefa simples atualizada com sucesso" });
//         }

//         // Se não tiver subtarefas, retorna também
//         if (!Array.isArray(subtasks)) {
//             return res.status(200).json({ message: "Tarefa complexa atualizada sem subtarefas" });
//         }

//         // Processa subtarefas em série (sem promises)
//         const processSubtasks = (index = 0) => {
//             if (index >= subtasks.length) {
//                 return res.status(200).json({ message: "Tarefa complexa e subtarefas atualizadas com sucesso" });
//             }

//             const sub = subtasks[index];

//             if (sub.id) {
//                 // UPDATE subtarefa existente
//                 const updateSubtaskQ = `
//                     UPDATE subtasks SET title=?, description=?, priority=?, due_date=?, is_completed=?
//                     WHERE id=? AND parent_task_id=?
//                 `;
//                 const values = [
//                     sub.title,
//                     sub.description || null,
//                     sub.priority,
//                     sub.due_date,
//                     sub.is_completed || false,
//                     sub.id,
//                     taskId
//                 ];
//                 db.query(updateSubtaskQ, values, (err2) => {
//                     if (err2) return res.status(500).json({ message: "Erro ao atualizar subtarefa", error: err2 });
//                     processSubtasks(index + 1);
//                 });
//             } else {
//                 // INSERT nova subtarefa
//                 const insertSubtaskQ = `
//                     INSERT INTO subtasks (parent_task_id, title, description, priority, due_date, is_completed)
//                     VALUES (?, ?, ?, ?, ?, ?)
//                 `;
//                 const values = [
//                     taskId,
//                     sub.title,
//                     sub.description || null,
//                     sub.priority,
//                     sub.due_date,
//                     sub.is_completed || false
//                 ];
//                 db.query(insertSubtaskQ, values, (err3) => {
//                     if (err3) return res.status(500).json({ message: "Erro ao inserir nova subtarefa", error: err3 });
//                     processSubtasks(index + 1);
//                 });
//             }
//         };

//         processSubtasks();
//     });
// };