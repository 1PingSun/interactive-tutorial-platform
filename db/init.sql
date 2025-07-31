CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    room_id INTEGER,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id),
    name VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'notyet' -- 'notyet', 'done'
);

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id),
    file_path VARCHAR(500) NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id),
    question_text TEXT NOT NULL,
    correct_answer TEXT,
    order_index INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'notyet' -- 'notyet', 'done'
);

INSERT INTO rooms (room_id, name, file_path) VALUES
(1, 'Room Title', 'room_description.md');

INSERT INTO tasks (room_id, name, order_index) VALUES
(1, 'Web 基礎知識', 1),
(1, 'JavaScript 基礎', 2),
(1, 'React 組件', 3);

INSERT INTO articles (task_id, file_path) VALUES
(1, 'web-basics.md'),
(2, 'js-basics.md'),
(3, 'react-components.md');

INSERT INTO questions (task_id, question_text, correct_answer, order_index) VALUES
(1, 'HTML 的主要結構是什麼？', '<!DOCTYPE html>', 1),
(1, '在 HTML 中如何設定 class 爲 a？', 'class="a"', 2),
(2, '在 JavaScript 中，如何宣告一個變數 a？', 'var a;', 1),
(2, 'JavaScript 中如何定義函數 myFunction()？', 'function myFunction() {}', 2),
(3, 'React 中如何創建一個組件？', 'function MyComponent() {}', 1),
(3, '在 React 中，如何使用 useState？', 'const [state, setState] = useState(initialState);', 2);