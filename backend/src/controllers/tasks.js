import { db } from "../database/db.js";

export const getTasks = (req, res) => {
    const qSimpleTasks = "SELECT * FROM simpleTasks";
    const qComplexTasks = "SELECT * FROM complexTasks";
    const qSubtasks = "SELECT * FROM subtasks";

    db.query(qSimpleTasks, (errSimple, simpleTasks) => {
        if (errSimple) {
            console.error("Erro ao buscar tarefas simples:", errSimple);
            return res.status(500).json({ error: "Erro de servidor!", details: errSimple.message });
        }

        db.query(qComplexTasks, (errComplex, complexTasks) => {
            if (errComplex) {
                console.error("Erro ao buscar tarefas complexas:", errComplex);
                return res
                    .status(500)
                    .json({ error: "Erro de servidor!", details: errComplex.message });
            }

            db.query(qSubtasks, (errSub, subtasks) => {
                if (errSub) {
                    console.error("Erro ao buscar subtarefas:", errSub);
                    return res
                        .status(500)
                        .json({ error: "Erro de servidor!", details: errSub.message });
                }

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
    const { title, description, priority, due_date, is_completed, is_complex, subtasks, position } =
        req.body;
    let qTask = `INSERT INTO simpleTasks (title, description, priority, due_date, is_completed, position)
        VALUES(?,?,?,?,?,?)`;
    if (is_complex) {
        qTask = `INSERT INTO complexTasks (title, description, priority, due_date, is_completed, position)
            VALUES(?,?,?,?,?,?)`;
    }
    const values = [title, description, priority, due_date, is_completed || false, position];

    db.query(qTask, values, (err, result) => {
        if (err) {
            console.error("Erro ao criar tarefa:", err);
            return res.status(500).json({ error: "Erro de servidor!", details: err.message });
        }
        const taskId = result.insertId;
        const createdTask = {
            id: taskId,
            title,
            description,
            priority,
            due_date,
            is_completed,
            subtasks,
            position,
        };
        if (!is_complex || !subtasks || subtasks.length === 0) {
            return res.status(201).json(createdTask);
        }

        // subtarefas
        const qSubtask = `INSERT INTO subtasks (parent_task_id, title, description, priority, due_date, is_completed)
            VALUES ?`;

        const subtaskValues = subtasks.map((sub) => [
            taskId,
            sub.title,
            sub.description || null,
            sub.priority,
            sub.due_date,
            sub.is_completed || false,
        ]);

        db.query(qSubtask, [subtaskValues], (err2) => {
            if (err2) {
                console.error("Erro ao criar subtarefas:", err2);
                return res.status(500).json({ error: "Erro de servidor!", details: err2.message });
            }
            return res.status(201).json(createdTask);
        });
    });
};

export const deleteTask = (req, res) => {
    const taskId = req.params.id;
    const taskSub = req.params.subtasks;
    if (taskSub) {
        const deleteSubtasksQ = "DELETE FROM subtasks WHERE parent_task_id = ?";
        db.query(deleteSubtasksQ, [taskId], (err) => {
            if (err) return res.sendStatus(500);
            const deleteTaskQ = "DELETE FROM complexTasks WHERE id = ?";

            db.query(deleteTaskQ, [taskId], (err2) => {
                if (err2) return res.sendStatus(500);
                return res.status(200).json({ message: "Tarefa excluída com sucesso" });
            });
        });
    }

    const deleteTaskQ = "DELETE FROM simpleTasks WHERE id = ?";

    db.query(deleteTaskQ, [taskId], (err2) => {
        if (err2) return res.sendStatus(500);
        return res.status(200).json({ message: "Tarefa excluída com sucesso" });
    });
};

export const editTask = (req, res) => {
    const taskId = req.params.id;
    const { title, description, priority, due_date, is_completed, subtarefas } = req.body;

    // Primeiro verificar em qual tabela a tarefa existe
    const checkSimpleQ = "SELECT id FROM simpleTasks WHERE id = ?";
    db.query(checkSimpleQ, [taskId], (errSimple, simpleResult) => {
        if (errSimple) {
            console.error("Erro ao verificar tarefa simples:", errSimple);
            return res.status(500).json({ message: "Erro de servidor!", error: errSimple.message });
        }

        if (simpleResult && simpleResult.length > 0) {
            // É uma tarefa simples
            const updateTaskQ = `
                UPDATE simpleTasks SET title=?, description=?, priority=?, due_date=?, is_completed=?
                WHERE id=?
            `;
            const taskValues = [title, description, priority, due_date, is_completed || false, taskId];
            db.query(updateTaskQ, taskValues, (err) => {
                if (err) {
                    console.error("Erro ao atualizar tarefa simples:", err);
                    return res
                        .status(500)
                        .json({ message: "Erro ao atualizar tarefa", error: err.message });
                }
                return res.status(200).json({ message: "Tarefa atualizada com sucesso" });
            });
        } else {
            // Verificar se é tarefa complexa
            const checkComplexQ = "SELECT id FROM complexTasks WHERE id = ?";
            db.query(checkComplexQ, [taskId], (errComplex, complexResult) => {
                if (errComplex) {
                    console.error("Erro ao verificar tarefa complexa:", errComplex);
                    return res
                        .status(500)
                        .json({ message: "Erro de servidor!", error: errComplex.message });
                }

                if (complexResult && complexResult.length > 0) {
                    // É uma tarefa complexa
                    const updateTaskQ = `
                        UPDATE complexTasks SET title=?, description=?, priority=?, due_date=?, is_completed=?
                        WHERE id=?
                    `;
                    const taskValues = [title, description, priority, due_date, is_completed || false, taskId];
                    db.query(updateTaskQ, taskValues, (err) => {
                        if (err) {
                            console.error("Erro ao atualizar tarefa complexa:", err);
                            return res
                                .status(500)
                                .json({ message: "Erro ao atualizar tarefa", error: err.message });
                        }
                        return res.status(200).json({ message: "Tarefa atualizada com sucesso" });
                    });
                } else {
                    return res.status(404).json({ message: "Tarefa não encontrada" });
                }
            });
        }
    });
};

export const editSubtask = (req, res) => {
    const subtaskId = req.params.id;
    const { due_date } = req.body;

    if (!due_date) {
        return res.status(400).json({ message: "Data é obrigatória" });
    }

    const updateSubtaskQ = `
        UPDATE subtasks SET due_date=?
        WHERE id=?
    `;
    const subtaskValues = [due_date, subtaskId];
    
    db.query(updateSubtaskQ, subtaskValues, (err) => {
        if (err) {
            console.error("Erro ao atualizar subtarefa:", err);
            return res
                .status(500)
                .json({ message: "Erro ao atualizar subtarefa", error: err.message });
        }
        return res.status(200).json({ message: "Subtarefa atualizada com sucesso" });
    });
};
