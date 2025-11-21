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
    return res
      .status(200)
      .json({ message: "Subtarefa atualizada com sucesso" });
  });
}

export const postTask = (req, res) => {
  const {
    title,
    description,
    priority,
    due_date,
    is_completed,
    is_complex,
    subtasks,
    position,
    is_daily
  } = req.body;

  // Define tipo e query da tabela filha
  let type = "simple";
  let qTypeTask = "INSERT INTO simpleTasks (id) VALUES (?)";
  if (is_complex) {
    type = "complex";
    qTypeTask = "INSERT INTO complexTasks (id) VALUES (?)";
  }

  // Inserir na tabela base
  const qTask = `
    INSERT INTO tasks (title, description, priority, due_date, is_completed, position, is_daily, type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    title,
    description,
    priority,
    due_date,
    is_completed || false,
    position,
    is_daily,
    type
  ];

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
      position,
      is_daily,
      type,
      subtasks: subtasks || []
    };

    // Inserir na tabela filha (simpleTasks ou complexTasks)
    db.query(qTypeTask, [taskId], (errType) => {
      if (errType) return res.status(500).json(errType);

      // Se for complexa e tiver subtarefas, insere as subtarefas
      if (is_complex && subtasks && subtasks.length > 0) {
        const qSubtask = `
          INSERT INTO subtasks (parent_task_id, title, description, priority, due_date, is_completed)
          VALUES ?
        `;
        const subtaskValues = subtasks.map((sub) => [
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
      } else {
        // Se for simples ou complexa sem subtarefas
        return res.status(201).json(createdTask);
      }
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
    } = req.body;

    const updateTaskQ = `
        UPDATE tasks SET title=?, description=?, priority=?, due_date=?, is_completed=?
        WHERE id=?
    `;
    const taskValues = [title, description, priority, due_date, is_completed || false, taskId];

    db.query(updateTaskQ, taskValues, (err) => {
        if (err) return res.status(500).json({ message: "Erro ao atualizar tarefa", error: err });

        if (!is_complex || !Array.isArray(subtasks)) {
            return res.status(200).json({ message: "Tarefa atualizada com sucesso" });
        }
    });
}


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
            return res.status(200).json(tarefaseSubtarefas)
        });
});
};

export const enviaLixeira = (req, res) => {
    const taskId = req.params.id;
    const enviaTarefa = `INSERT INTO lixeira (title, description, priority, due_date, is_completed, position, type, 
    is_daily)SELECT title, description, priority, due_date, is_completed, position, type, is_daily FROM tasks WHERE id=?;`;

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
    if (err) {
      console.error('Erro selecionar lixeira', { sql: selecionarTarefa, params: [id], err });
      return res.status(500).json({ error: "Erro ao buscar tarefa da lixeira", details: err.message });
    }
    if (!results.length) return res.status(404).json({ message: "Tarefa não encontrada na lixeira" });

    const tarefa = results[0];

    const inserirTarefa = `
      INSERT INTO tasks (title, description, priority, due_date, is_completed, position, type, is_daily)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [tarefa.title, tarefa.description, tarefa.priority, tarefa.due_date, tarefa.is_completed, tarefa.position, tarefa.type, tarefa.is_daily];

    db.query(inserirTarefa, values, (err2, result) => {
      if (err2) {
        console.error('Erro inserir tasks', { sql: inserirTarefa, params: values, err: err2 });
        return res.status(500).json({ error: "Erro ao restaurar tarefa", details: err2.message });
      }

      const idnovo = result.insertId;
      const idantigo = tarefa.id;

      // recriar entrada no subtipo com callback e checagem de erro
      const subtipoQ = tarefa.type === "simple" ? "INSERT INTO simpleTasks (id) VALUES (?)" : "INSERT INTO complexTasks (id) VALUES (?)";
      db.query(subtipoQ, [idnovo], (errSubtipo) => {
        if (errSubtipo) {
          console.error('Erro recriar subtipo', { sql: subtipoQ, params: [idnovo], err: errSubtipo });
          return res.status(500).json({ error: "Erro ao recriar subtipo", details: errSubtipo.message });
        }

        // Restaurar subtarefas (só depois de subtipo existir)
        const restaurarSubtarefas = `
          INSERT INTO subtasks (parent_task_id, title, description, priority, due_date, is_completed)
          SELECT ?, title, description, priority, due_date, is_completed FROM subtasks_lixeira
          WHERE parent_task_id = ?
        `;

        db.query(restaurarSubtarefas, [idnovo, idantigo], (err3) => {
          if (err3) {
            console.error('Erro restaurar subtarefas', { sql: restaurarSubtarefas, params: [idnovo, idantigo], err: err3 });
            return res.status(500).json({ error: "Erro ao restaurar subtarefas", details: err3.message });
          }

          // apagar lixeira (com callbacks)
          db.query("DELETE FROM subtasks_lixeira WHERE parent_task_id = ?", [idantigo], (err4) => {
            if (err4) {
              console.error('Erro deletar subtasks_lixeira', { params: [idantigo], err: err4 });
              return res.status(500).json({ error: "Erro ao apagar subtarefas da lixeira", details: err4.message });
            }

            db.query("DELETE FROM lixeira WHERE id = ?", [idantigo], (err5) => {
              if (err5) {
                console.error('Erro deletar lixeira', { params: [idantigo], err: err5 });
                return res.status(500).json({ error: "Erro ao apagar tarefa da lixeira", details: err5.message });
              }

              return res.status(200).json({ message: "Tarefa e subtarefas restauradas com sucesso" });
            });
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
        INSERT INTO tasks (title, description, priority, due_date, is_completed, position, type, is_daily)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [tarefa.title,tarefa.description,tarefa.priority,tarefa.due_date,tarefa.is_completed,tarefa.position,tarefa.type,tarefa.is_daily];

      db.query(tarefaId, values, (err2, result) => {
        if (err2) return res.status(500).json({ error: "Erro ao restaurar tarefa"});
        
        const idnovo = result.insertId;
        const idantigo = tarefa.id;

        if (tarefa.type === "simple") {
          db.query("INSERT INTO simpleTasks (id) VALUES (?)", [idnovo]);
          } else {
          db.query("INSERT INTO complexTasks (id) VALUES (?)", [idnovo]);
        }

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
