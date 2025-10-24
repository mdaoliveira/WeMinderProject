-- BD SCRIPT

CREATE DATABASE IF NOT EXISTS tarefas;
USE tarefas;

-- Apagar tabelas se já existirem
DROP TABLE IF EXISTS subtasks;
DROP TABLE IF EXISTS tasks;

-- Criar tabela de tarefas
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER CHECK(priority BETWEEN 0 AND 3),
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    is_complex BOOLEAN DEFAULT FALSE
);

-- Criar tabela de subtarefas
CREATE TABLE subtasks (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    parent_task_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER CHECK(priority BETWEEN 0 AND 3),
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id)
);

-- Inserir 15 tarefas (simples e complexas)
INSERT INTO tasks (title, description, priority, due_date, is_completed, is_complex) VALUES
('Ler capítulo 1', 'Ler o primeiro capítulo do livro X', 1, '2025-06-01', FALSE, FALSE),
('Fazer caminhada', 'Caminhada de 30 minutos no parque', 2, '2025-06-02', TRUE, FALSE),
('Estudar SQL', 'Revisar comandos básicos e avançados de SQL', 1, '2025-06-05', FALSE, FALSE),
('Limpar o quarto', 'Organizar livros, roupas e aspirar o chão', 2, '2025-06-03', TRUE, FALSE),
('Assistir documentário', 'Assistir ao episódio sobre IA', 0, '2025-06-07', FALSE, FALSE),
('Desenvolver app React', 'Criar um aplicativo em React com autenticação', 1, '2025-06-10', FALSE, TRUE),
('Projeto de estatística', 'Montar gráficos e análises descritivas', 2, '2025-06-12', FALSE, TRUE),
('Preparar apresentação', 'Montar slides para apresentação de TCC', 1, '2025-06-15', FALSE, TRUE),
('Revisar redação', 'Corrigir erros e melhorar argumentos', 1, '2025-06-08', TRUE, FALSE),
('Fazer compras', 'Lista: arroz, leite, frutas e pão', 2, '2025-06-05', TRUE, FALSE),
('Treinar lógica', 'Resolver 10 exercícios de lógica', 2, '2025-06-06', FALSE, FALSE),
('Escrever artigo', 'Artigo sobre segurança da informação', 1, '2025-06-20', FALSE, TRUE),
('Organizar arquivos', 'Classificar documentos no Google Drive', 0, '2025-06-04', FALSE, FALSE),
('Praticar inglês', 'Estudar gramática e assistir vídeo', 1, '2025-06-09', FALSE, FALSE),
('Configurar servidor', 'Instalar e configurar Apache ou Nginx', 1, '2025-06-18', FALSE, TRUE);

-- Inserir 15 subtarefas associadas a tarefas complexas
INSERT INTO subtasks (parent_task_id, title, description, priority, due_date, is_completed) VALUES
(6, 'Criar componentes', 'Componentes principais do app', 1, '2025-06-04', TRUE),
(6, 'Implementar rotas', 'Navegação com React Router', 2, '2025-06-06', FALSE),
(6, 'Autenticação', 'Login, registro e logout', 1, '2025-06-08', FALSE),
(7, 'Coletar dados', 'Obter amostras para análise', 2, '2025-06-07', TRUE),
(7, 'Gerar gráficos', 'Gráficos de barras, pizza e linha', 1, '2025-06-09', FALSE),
(7, 'Escrever análise', 'Interpretação estatística', 1, '2025-06-10', FALSE),
(8, 'Montar estrutura', 'Definir tópicos dos slides', 0, '2025-06-12', TRUE),
(8, 'Design visual', 'Aplicar layout e cores', 2, '2025-06-13', FALSE),
(8, 'Treinar fala', 'Simular apresentação', 1, '2025-06-14', FALSE),
(12, 'Pesquisar fontes', 'Buscar artigos científicos', 1, '2025-06-15', TRUE),
(12, 'Escrever rascunho', 'Primeira versão do artigo', 2, '2025-06-17', FALSE),
(12, 'Revisar e formatar', 'Normas da revista', 1, '2025-06-19', FALSE),
(15, 'Instalar sistema', 'Instalar Ubuntu Server', 1, '2025-06-15', TRUE),
(15, 'Configurar rede', 'IP estático e firewall', 2, '2025-06-16', FALSE),
(15, 'Testar acesso', 'Acesso externo via SSH', 1, '2025-06-18', FALSE);
