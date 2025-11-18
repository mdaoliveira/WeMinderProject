import { db } from "../database/db.js";

// Função para calcular pontuação baseada na prioridade da tarefa
const calcularPontuacao = (priority) => {
    // Prioridade 0 (Sem Prioridade): 1 ponto
    // Prioridade 1 (Alta): 5 pontos
    // Prioridade 2 (Média): 3 pontos
    // Prioridade 3 (Baixa): 2 pontos
    const pontosPorPrioridade = {
        0: 1,
        1: 5,
        2: 3,
        3: 2
    };
    return pontosPorPrioridade[priority] || 1;
};

// Função para atualizar pontuação do usuário
const atualizarPontuacaoUsuario = (userId, pontos, callback) => {
    if (!userId) {
        return callback(null); // Se não houver userId, não atualiza
    }
    const updateScoreQ = `UPDATE usuarios SET pontuacao = pontuacao + ? WHERE id = ?`;
    db.query(updateScoreQ, [pontos, userId], (err) => {
        if (err) {
            console.error("Erro ao atualizar pontuação:", err);
            return callback(err);
        }
        callback(null);
    });
};

export const getTasks = (req, res) => {
    const qSimpleTasks = "SELECT * FROM simpleTasks";
    const qComplexTasks = "SELECT * FROM complexTasks";
    const qSubtasks = "SELECT * FROM subtasks";

    db.query(qSimpleTasks, (errSimple, simpleTasks) => {
        if (errSimple) {
            console.error("Erro ao buscar tarefas simples:", errSimple);
            return res.status(500).json({ message: "Erro de servidor!", error: errSimple.message });
        }

        db.query(qComplexTasks, (errComplex, complexTasks) => {
            if (errComplex) {
                console.error("Erro ao buscar tarefas complexas:", errComplex);
                return res.status(500).json({ message: "Erro de servidor!", error: errComplex.message });
            }

            db.query(qSubtasks, (errSub, subtasks) => {
                if (errSub) {
                    console.error("Erro ao buscar subtarefas:", errSub);
                    return res.status(500).json({ message: "Erro de servidor!", error: errSub.message });
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
    const qTask = `INSERT INTO simpleTasks (title, description, priority, due_date, is_completed, position)
        VALUES(?,?,?,?,?,?)`;
    if (is_complex) {
        qTask = `INSERT INTO complexTasks (title, description, priority, due_date, is_completed, position)
            VALUES(?,?,?,?,?,?)`;
    }
    const values = [title, description, priority, due_date, is_completed || false, position];

    db.query(qTask, values, (err, result) => {
        if (err) return res.status(500).json(err);
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
            if (err2) return res.status(500).json(err2);
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
    const { title, description, priority, due_date, is_completed, subtarefas, user_id } = req.body;

    // Verificar estado anterior da tarefa para calcular pontuação
    const checkTaskQ = subtarefas && subtarefas.length > 0 
        ? "SELECT is_completed, priority FROM complexTasks WHERE id = ?"
        : "SELECT is_completed, priority FROM simpleTasks WHERE id = ?";

    db.query(checkTaskQ, [taskId], (errCheck, results) => {
        if (errCheck) {
            return res.status(500).json({ message: "Erro ao verificar tarefa", error: errCheck });
        }

        // Calcular pontuação se tarefa foi marcada como concluída
        if (results && results.length > 0 && user_id) {
            const previousTask = results[0];
            const wasCompleted = previousTask.is_completed === true || previousTask.is_completed === 1;
            const isNowCompleted = is_completed === true || is_completed === 1;
            
            if (!wasCompleted && isNowCompleted) {
                const taskPriority = priority !== undefined ? priority : previousTask.priority;
                const pontos = calcularPontuacao(taskPriority);
                atualizarPontuacaoUsuario(user_id, pontos, () => {});
            }
        }

        // Atualizar a tarefa (mantendo padrão original)
        if (subtarefas && subtarefas.length > 0) {
            const updateTaskQ = `
                UPDATE complexTasks SET title=?, description=?, priority=?, due_date=?, is_completed=?
                WHERE id=?
            `;
            const taskValues = [title, description, priority, due_date, is_completed || false, taskId];
            db.query(updateTaskQ, taskValues, (err) => {
                if (err)
                    return res.status(500).json({ message: "Erro ao atualizar tarefa", error: err });
            });
        } else {
            const updateTaskQ = `
                UPDATE simpleTasks SET title=?, description=?, priority=?, due_date=?, is_completed=?
                WHERE id=?
            `;
            const taskValues = [title, description, priority, due_date, is_completed || false, taskId];
            db.query(updateTaskQ, taskValues, (err) => {
                if (err) return res.status(500).json({ message: "Erro ao atualizar tarefa", error: err });
            });
        }
    });
};
