-- Criar BD
CREATE DATABASE IF NOT EXISTS tarefas;
USE tarefas;

-- Apagar tabelas se existirem
DROP TABLE IF EXISTS subtasks;
DROP TABLE IF EXISTS complexTasks;
DROP TABLE IF EXISTS simpleTasks;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS personalizacao;

-- =========================================================
-- 1. TABELA GENÉRICA DE TAREFAS
-- =========================================================
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority INT CHECK(priority BETWEEN 0 AND 3),
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    position VARCHAR(45) DEFAULT NULL,
    type ENUM('simple', 'complex') NOT NULL,  -- define o subtipo
    is_daily BOOLEAN DEFAULT FALSE
);

-- =========================================================
-- 2. TABELAS DE SUBTIPOS
-- =========================================================
CREATE TABLE simpleTasks (
    id INT PRIMARY KEY,
    FOREIGN KEY (id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE complexTasks (
    id INT PRIMARY KEY,
    FOREIGN KEY (id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- =========================================================
-- 3. SUBTAREFAS (filhas de complexTasks)
-- =========================================================
CREATE TABLE subtasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_task_id INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority INT CHECK(priority BETWEEN 0 AND 3),
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (parent_task_id) REFERENCES complexTasks(id) ON DELETE CASCADE
);

-- =========================================================
-- 4. PERSONALIZAÇÃO
-- =========================================================
CREATE TABLE IF NOT EXISTS personalizacao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    text_color VARCHAR(20),
    sidebar_color VARCHAR(20),
    background_color VARCHAR(20),
    card_color VARCHAR(20),
    card_position VARCHAR(20)
);

INSERT INTO personalizacao (text_color, sidebar_color, background_color, card_color, card_position)
VALUES ('#1d4ed8', '#f3f4f6', '#f3f4f6', '#ffffff', 'lista');

-- =========================================================
-- 5. INSERIR DADOS
-- =========================================================

-- Inserir tarefas simples (1: inserir em tasks, 2: inserir o mesmo id em simpleTasks)
INSERT INTO tasks (title, description, priority, due_date, is_completed, position, type)
VALUES
('Ler capítulo 1', 'Ler o primeiro capítulo do livro X', 1, '2025-06-01', FALSE, NULL, 'simple'),
('Fazer caminhada', 'Caminhada de 30 minutos no parque', 2, '2025-06-02', TRUE, NULL, 'simple'),
('Estudar SQL', 'Revisar comandos básicos e avançados de SQL', 1, '2025-06-05', FALSE, NULL, 'simple'),
('Limpar o quarto', 'Organizar livros, roupas e aspirar o chão', 2, '2025-06-03', TRUE, NULL, 'simple'),
('Assistir documentário', 'Assistir ao episódio sobre IA', 0, '2025-06-07', FALSE, NULL, 'simple'),
('Revisar redação', 'Corrigir erros e melhorar argumentos', 1, '2025-06-08', TRUE, NULL, 'simple'),
('Fazer compras', 'Lista: arroz, leite, frutas e pão', 2, '2025-06-05', TRUE, NULL, 'simple'),
('Treinar lógica', 'Resolver 10 exercícios de lógica', 2, '2025-06-06', FALSE, NULL, 'simple'),
('Escrever artigo', 'Artigo sobre segurança da informação', 1, '2025-06-20', FALSE, NULL, 'simple'),
('Organizar arquivos', 'Classificar documentos no Google Drive', 0, '2025-06-04', FALSE, NULL, 'simple'),
('Praticar inglês', 'Estudar gramática e assistir vídeo', 1, '2025-06-09', FALSE, NULL, 'simple');

INSERT INTO simpleTasks (id)
SELECT id FROM tasks WHERE type = 'simple';

-- Inserir tarefas complexas
INSERT INTO tasks (title, description, priority, due_date, is_completed, position, type)
VALUES
('Configurar servidor', 'Instalar e configurar Apache ou Nginx', 1, '2025-06-18', FALSE, NULL, 'complex'),
('Escrever artigo', 'Artigo sobre segurança da informação', 1, '2025-06-20', FALSE, NULL, 'complex'),
('Desenvolver app React', 'Criar um aplicativo em React com autenticação', 1, '2025-06-10', FALSE, NULL, 'complex'),
('Projeto de estatística', 'Montar gráficos e análises descritivas', 2, '2025-06-12', FALSE, NULL, 'complex'),
('Preparar apresentação', 'Montar slides para apresentação de TCC', 1, '2025-06-15', FALSE, NULL, 'complex');

INSERT INTO complexTasks (id)
SELECT id FROM tasks WHERE type = 'complex';

-- Inserir subtarefas
INSERT INTO subtasks (parent_task_id, title, description, priority, due_date, is_completed) VALUES
(14, 'Criar componentes', 'Componentes principais do app', 1, '2025-06-04', TRUE),
(14, 'Implementar rotas', 'Navegação com React Router', 2, '2025-06-06', FALSE),
(14, 'Autenticação', 'Login, registro e logout', 1, '2025-06-08', FALSE),
(15, 'Coletar dados', 'Obter amostras para análise', 2, '2025-06-07', TRUE),
(15, 'Gerar gráficos', 'Gráficos de barras, pizza e linha', 1, '2025-06-09', FALSE),
(15, 'Escrever análise', 'Interpretação estatística', 1, '2025-06-10', FALSE),
(16, 'Montar estrutura', 'Definir tópicos dos slides', 0, '2025-06-12', TRUE),
(16, 'Design visual', 'Aplicar layout e cores', 2, '2025-06-13', FALSE),
(16, 'Treinar fala', 'Simular apresentação', 1, '2025-06-14', FALSE),
(13, 'Pesquisar fontes', 'Buscar artigos científicos', 1, '2025-06-15', TRUE),
(13, 'Escrever rascunho', 'Primeira versão do artigo', 2, '2025-06-17', FALSE),
(13, 'Revisar e formatar', 'Normas da revista', 1, '2025-06-19', FALSE),
(12, 'Instalar sistema', 'Instalar Ubuntu Server', 1, '2025-06-15', TRUE),
(12, 'Configurar rede', 'IP estático e firewall', 2, '2025-06-16', FALSE),
(12, 'Testar acesso', 'Acesso externo via SSH', 1, '2025-06-18', FALSE);
