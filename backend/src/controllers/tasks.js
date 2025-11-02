import { db } from "../database/db.js";

export const getTasks = (req, res) => {
    const qSimpleTasks = "SELECT * FROM simpleTasks";
    const qComplexTasks = "SELECT * FROM complexTasks";
    const qSubtasks = "SELECT * FROM subTasks";

    db.query(qSimpleTasks, (errSimple, simpleTasks) => {
        if (errSimple) return res.status(500).json("Erro de servidor!");

        db.query(qComplexTasks, (errComplex, complexTasks) => {
            if (errComplex) return res.status(500).json("Erro de servidor!");

            db.query(qSubtasks, (errSub, subtasks) => {
                if (errSub) return res.status(500).json("Erro de servidor!");

                const complexWithSubtasks = complexTasks.map((task) => {
                    const relatedSubtasks = subtasks.filter(
                        (sub) => sub.parent_task_id === task.id
                    );
                    return { ...task, subtasks: relatedSubtasks };
                });

                const allTasks = [
                    ...simpleTasks.map((t) => ({ ...t, type: "simple" })),
                    ...complexWithSubtasks.map((t) => ({ ...t, type: "complex" })),
                ];

                return res.status(200).json(allTasks);
            });
        });
    });
};


export const postTask = (req, res) => {
    const {title, description, priority, due_date, is_completed, is_complex, is_daily, subtasks} = req.body;
    const qTask = `INSERT INTO tasks (title, description, priority, due_date, is_completed, is_complex, is_daily)
    VALUES(?,?,?,?,?,?,?)`;
    const values = [title, description, priority, due_date, is_completed || false, is_complex || false, is_daily || false];

    db.query(qTask, values, (err, result) => {
        if (err) return res.status(500).json(err);
        const taskId = result.insertId;
        const createdTask = {id: taskId, title, description, priority, due_date, is_completed, is_complex, is_daily, subtasks};
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

export const editTask = (req, res) => {
    const taskId = req.params.id;
    const {
        title,
        description,
        priority,
        due_date,
        is_completed,
        is_complex,
//         subtasks
    } = req.body;

    const updateTaskQ = `
        UPDATE tasks SET title=?, description=?, priority=?, due_date=?, is_completed=?, is_complex=?
        WHERE id=?
    `;
    const taskValues = [title, description, priority, due_date, is_completed || false, is_complex || false, taskId];

    db.query(updateTaskQ, taskValues, (err) => {
        if (err) return res.status(500).json({ message: "Erro ao atualizar tarefa", error: err });

        if (!is_complex || !Array.isArray(subtasks)) {
            return res.status(200).json({ message: "Tarefa atualizada com sucesso" });
        }
    });
}