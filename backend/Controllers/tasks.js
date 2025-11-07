import { db } from "../db.js";

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

export const getLixeira = (req, res) => {
    const q = "SELECT * FROM lixeira"; 
    db.query(q, (err, tarefas) => {
        if (err) {return res.status(500).json({error: "Erro get lixeira"});}
        
        if (tarefas.length===0){return res.status(200).json([])};

        const qsubtarefas = `SELECT * FROM subtasks_lixeira;`;
        db.query(qsubtarefas, (err2, subtarefas) => {
            if (err2) {return res.status(500).json({error: "Erro get subtarefas"});}

            const tarefaseSubtarefas = tarefas.map((tarefa)=>{
                const subs = subtarefas.filter(sub => sub.parent_task_id===tarefa.id);
                return {...tarefa,subtasks:subs};
            });
            res.status(200).json(tarefaseSubtarefas)
        });
});
};


export const enviaLixeira = (req, res) => {
    const taskId = req.params.id;
    const enviaTarefa = `INSERT INTO lixeira (title, description, priority, due_date, is_completed, is_complex
    )SELECT title, description, priority, due_date, is_completed, is_complex FROM tasks WHERE id=?;`;

    db.query(enviaTarefa, [taskId], (err, result) => {
        if (err) {return res.status(500).json({error:"Erro ao enviar tarefa para a lixeira"});
        }

        const lixeiraTarefa = result.insertId;
        const enviaSubtarefas = `
        INSERT INTO subtasks_lixeira (parent_task_id, title, description, priority, due_date, is_completed)
        SELECT ?, title, description, priority, due_date, is_completed
        FROM subtasks
        WHERE parent_task_id = ?;
        `;
        db.query(enviaSubtarefas, [lixeiraTarefa, taskId], (err2) => {
        if (err2) {return res.status(500).json({ error: "Erro ao enviar subtarefas para a lixeira" });
        }
        
            const deleteTaskQ = "DELETE FROM tasks WHERE id = ?";
            const deleteSubtasksQ = "DELETE FROM subtasks WHERE parent_task_id = ?";

            db.query(deleteSubtasksQ, [taskId], (err3) => {
            if (err3) {return res.status(500).json({error:"Erro ao excluir subtarefa"});}
            
                db.query(deleteTaskQ, [taskId], (err4) => {
                if (err4) {return res.status(500).json({error:"Erro ao excluir"});}
                return res.status(200).json({ message: "Tarefa enviada para a lixeira com sucesso" });
                });
            });
        });
    });
};

export const restaurarTarefa = (req, res) => {
  const id = req.params.id;

  const selecionarTarefa = "SELECT * FROM lixeira WHERE id = ?";
  db.query(selecionarTarefa, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar tarefa da lixeira" });
    if (!results.length) return res.status(404).json({ message: "Tarefa não encontrada na lixeira" });

    const tarefa = results[0];

    const inserirTarefa = `
      INSERT INTO tasks (title, description, priority, due_date, is_completed, is_complex)
      VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [tarefa.title,tarefa.description,tarefa.priority,tarefa.due_date,tarefa.is_completed,tarefa.is_complex];

    db.query(inserirTarefa, values, (err2, result) => {
      if (err2) return res.status(500).json({ error: "Erro ao restaurar tarefa"});

      const idnovo = result.insertId;
      const idantigo = tarefa.id;

      const restaurarSubtarefas = `
        INSERT INTO subtasks (parent_task_id, title, description, priority, due_date, is_completed)
        SELECT ?, title, description, priority, due_date, is_completed FROM subtasks_lixeira
        WHERE parent_task_id = ?`;

      db.query(restaurarSubtarefas, [idnovo, idantigo], (err3) => {
        if (err3) return res.status(500).json({ error: "Erro ao restaurar subtarefas"});

        // apagar lixeira
        const deletarSubtarefas = "DELETE FROM subtasks_lixeira WHERE parent_task_id = ?";
        const deletarTarefa = "DELETE FROM lixeira WHERE id = ?";

        db.query(deletarSubtarefas, [idantigo], (err4) => {
          if (err4) return res.status(500).json({ error: "Erro ao apagar subtarefas da lixeira" });

          db.query(deletarTarefa, [idantigo], (err5) => {
            if (err5) return res.status(500).json({ error: "Erro ao apagar tarefa da lixeira" });

            return res.status(200).json({ message: "Tarefa e subtarefas restauradas com sucesso" });
          });
        });
      });
    });
  });
};
export const restaurarTudo = (req, res) => {
  const selecionarId = "SELECT * FROM lixeira";
  
  db.query(selecionarId, (err, tarefasLixeira) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar tarefas da lixeira" });
    if (!tarefasLixeira.length) return res.status(200).json({ message: "Nenhuma tarefa na lixeira" });

    let cont = 0;
    tarefasLixeira.forEach(tarefa => {
      const tarefaId = `
        INSERT INTO tasks (title, description, priority, due_date, is_completed, is_complex)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [tarefa.title,tarefa.description,tarefa.priority,tarefa.due_date,tarefa.is_completed,tarefa.is_complex];

      db.query(tarefaId, values, (err2, result) => {
        if (err2) return res.status(500).json({ error: "Erro ao restaurar tarefa"});
        
        const idnovo = result.insertId;
        const idantigo = tarefa.id;

        const restaurarSubtarefas = `
          INSERT INTO subtasks (parent_task_id, title, description, priority, due_date, is_completed)
          SELECT ?, title, description, priority, due_date, is_completed
          FROM subtasks_lixeira WHERE parent_task_id = ?
        `;
        db.query(restaurarSubtarefas, [idnovo, idantigo], (err3) => {
          if (err3) return res.status(500).json({ error: "Erro ao restaurar subtarefas"});

          // apaga da lixeira
          const deletarSubtarefa = "DELETE FROM subtasks_lixeira WHERE parent_task_id = ?";
          const deletarTarefa = "DELETE FROM lixeira WHERE id = ?";
          db.query(deletarSubtarefa, [idantigo]);
          db.query(deletarTarefa, [idantigo], () => {
            cont++;
            if (cont === tarefasLixeira.length) {
              return res.status(200).json({ message: "Todas as tarefas e subtarefas foram restauradas com sucesso" });
            }
          });
        });
      });
    });
  });
};




export const excluirPermanente = (req, res) => {
    const id = Number(req.params.id); 
    if (!id) return res.status(400).json({ error: "ID inválido" });

    const excluirSubtarefas = "DELETE FROM subtasks_lixeira WHERE parent_task_id = ?";
    const excluirTarefa = "DELETE FROM lixeira WHERE id = ?";

    db.query(excluirSubtarefas, [id], (err) => {
        if (err) return res.status(500).json({ error: "Erro ao excluir subtarefas", details: err });

        db.query(excluirTarefa, [id], (err2) => {
            if (err2) return res.status(500).json({ error: "Erro ao excluir tarefa", details: err2 });
            return res.status(200).json({ message: "Tarefa e subtarefas excluídas permanentemente" });
        });
    });
};

export const excluirTudoPermanente = (req, res) => {
    const selecionarid = "SELECT id FROM lixeira";

    db.query(selecionarid, (err, results) => {
        if (err) return res.status(500).json({ error: "Erro ao buscar IDs da lixeira", details: err });

        if (!results || results.length === 0) {
            return res.status(200).json({ message: "Nenhuma tarefa na lixeira" });
        }

        const ids = results.map(r => r.id);

        const excluirSubtarefas = "DELETE FROM subtasks_lixeira WHERE parent_task_id IN (?)";
        db.query(excluirSubtarefas, [ids], (err2) => {
            if (err2) return res.status(500).json({ error: "Erro ao excluir subtarefas", details: err2 });

            const excluirTarefas = "DELETE FROM lixeira WHERE id IN (?)";
            db.query(excluirTarefas, [ids], (err3) => {
                if (err3) return res.status(500).json({ error: "Erro ao excluir tarefas", details: err3 });

                return res.status(200).json({ message: "Todas as tarefas e subtarefas excluídas permanentemente" });
            });
        });
    });
};

export const getColor = (req, res) => {
    const q = "SELECT text_color, sidebar_color, background_color, card_color, card_position FROM personalizacao WHERE id = 1";
    db.query(q, (err, results) => {
        if (err) return res.status(500);
        res.json({color: results[0].text_color, sidebar: results[0].sidebar_color, 
            background: results[0].background_color, card: results[0].card_color, card_position: results[0].card_position});
    });
};

export const updateColor = (req, res) => {
    const { color, sidebar, background, card, card_position} = req.body;
    const q = "UPDATE personalizacao SET text_color = ?, sidebar_color = ?, background_color = ?, card_color = ?, card_position = ? WHERE id = 1";
    db.query(q, [color, sidebar, background, card, card_position], (err) => {
        if (err) return res.status(500);
        res.json({color, card_position});
    });
};