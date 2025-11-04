-- BD SCRIPT

CREATE DATABASE IF NOT EXISTS tarefas;
USE tarefas;

-- Apagar tabelas se já existirem
DROP TABLE IF EXISTS subtasks;
DROP TABLE IF EXISTS complexTasks;
DROP TABLE IF EXISTS simpleTasks;

-- Criar tabela de tarefas simples
CREATE TABLE simpleTasks (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER CHECK(priority BETWEEN 0 AND 3),
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    position VARCHAR(45) DEFAULT NULL
);
-- Criar tabela de tarefas complexas
CREATE TABLE complexTasks (
	id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER CHECK(priority BETWEEN 0 AND 3),
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    position VARCHAR(45) DEFAULT NULL
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
    FOREIGN KEY (parent_task_id) REFERENCES complexTasks(id)
);

-- Inserir 15 tarefas (simples e complexas)
INSERT INTO simpleTasks (title, description, priority, due_date, is_completed) VALUES
('Ler capítulo 1', 'Ler o primeiro capítulo do livro X', 1, '2025-06-01', FALSE),
('Fazer caminhada', 'Caminhada de 30 minutos no parque', 2, '2025-06-02', TRUE),
('Estudar SQL', 'Revisar comandos básicos e avançados de SQL', 1, '2025-06-05', FALSE),
('Limpar o quarto', 'Organizar livros, roupas e aspirar o chão', 2, '2025-06-03', TRUE),
('Assistir documentário', 'Assistir ao episódio sobre IA', 0, '2025-06-07', FALSE),
('Revisar redação', 'Corrigir erros e melhorar argumentos', 1, '2025-06-08', TRUE),
('Fazer compras', 'Lista: arroz, leite, frutas e pão', 2, '2025-06-05', TRUE),
('Treinar lógica', 'Resolver 10 exercícios de lógica', 2, '2025-06-06', FALSE),
('Escrever artigo', 'Artigo sobre segurança da informação', 1, '2025-06-20', FALSE),
('Organizar arquivos', 'Classificar documentos no Google Drive', 0, '2025-06-04', FALSE),
('Praticar inglês', 'Estudar gramática e assistir vídeo', 1, '2025-06-09', FALSE);

INSERT INTO complexTasks (title, description, priority, due_date, is_completed) VALUES
('Configurar servidor', 'Instalar e configurar Apache ou Nginx', 1, '2025-06-18', FALSE),
('Escrever artigo', 'Artigo sobre segurança da informação', 1, '2025-06-20', FALSE),
('Desenvolver app React', 'Criar um aplicativo em React com autenticação', 1, '2025-06-10', FALSE),
('Projeto de estatística', 'Montar gráficos e análises descritivas', 2, '2025-06-12', FALSE),
('Preparar apresentação', 'Montar slides para apresentação de TCC', 1, '2025-06-15', FALSE);

-- Inserir 15 subtarefas associadas a tarefas complexas
INSERT INTO subtasks (parent_task_id, title, description, priority, due_date, is_completed) VALUES
(3, 'Criar componentes', 'Componentes principais do app', 1, '2025-06-04', TRUE),
(3, 'Implementar rotas', 'Navegação com React Router', 2, '2025-06-06', FALSE),
(3, 'Autenticação', 'Login, registro e logout', 1, '2025-06-08', FALSE),
(4, 'Coletar dados', 'Obter amostras para análise', 2, '2025-06-07', TRUE),
(4, 'Gerar gráficos', 'Gráficos de barras, pizza e linha', 1, '2025-06-09', FALSE),
(4, 'Escrever análise', 'Interpretação estatística', 1, '2025-06-10', FALSE),
(5, 'Montar estrutura', 'Definir tópicos dos slides', 0, '2025-06-12', TRUE),
(5, 'Design visual', 'Aplicar layout e cores', 2, '2025-06-13', FALSE),
(5, 'Treinar fala', 'Simular apresentação', 1, '2025-06-14', FALSE),
(2, 'Pesquisar fontes', 'Buscar artigos científicos', 1, '2025-06-15', TRUE),
(2, 'Escrever rascunho', 'Primeira versão do artigo', 2, '2025-06-17', FALSE),
(2, 'Revisar e formatar', 'Normas da revista', 1, '2025-06-19', FALSE),
(1, 'Instalar sistema', 'Instalar Ubuntu Server', 1, '2025-06-15', TRUE),
(1, 'Configurar rede', 'IP estático e firewall', 2, '2025-06-16', FALSE),
(1, 'Testar acesso', 'Acesso externo via SSH', 1, '2025-06-18', FALSE);
