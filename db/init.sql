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
(1, 'Task 1 - 工控概要：了解工控系統（ICS Basics）', 1),
(1, 'Task 2 - 網路概要：掃描並識別網路設備（Network Reconnaissance）', 2),
(1, 'Task 3 - 工控協議滲透：Modbus概述', 3),
(1, 'Task 4 - 工控協議操作：pymodbusTCP 常用函式介紹', 4),
(1, 'Task 5 - 進階工控安全', 5),
(1, 'LAB 1 – 用 PyModbus 讀保持暫存器', 6),
(1, 'LAB 2 – 寫入暫存器遠端控制', 7),
(1, 'Lab 3 – ARP Spoofing 繞過 IP 白名單', 8),
(1, 'LAB 4 - Wireshark 解析 Modbus', 9),
(1, 'LAB 5 - 竄改', 10);


INSERT INTO articles (task_id, file_path) VALUES
(1, 't1.md'),
(2, 't2.md'),
(3, 't3.md'),
(4, 't4.md'),
(5, 't5.md'),
(6, 'lab1.md'),
(7, 'lab2.md'),
(8, 'lab3.md'),
(9, 'lab4.md'),
(10, 'lab5.md');

INSERT INTO questions (task_id, question_text, correct_answer, order_index) VALUES
(1, 'PLC 是什麼的縮寫？（共 26 個英文字元）', 'Programmable Logic Controller', 1),
(1, '哪一種元件通常提供操作人員圖形化介面？（縮寫：3個英文字元；全名：22個英文字元）', 'HMI（Human-Machine Interface）', 2),
(1, '請列出三種常見的工控設備或系統。（分別為 3、3、5 個英文字元）', 'PLC、HMI、SCADA', 3),
(2, 'Modbus 通訊協議通常使用哪一個 TCP 埠號？（共 3 位數字）', '502', 1),
(2, '請列出一個 Nmap 指令，可以用來掃描常見 OT 協議的開放埠。（7 個詞）', 'nmap -p 502,20000,44818 內網位址', 2),
(2, '哪個工控協議常使用 TCP 或 UDP 埠號 44818？（共 12個英文字元，包括斜線）', 'EtherNet/IP', 3),
(2, '若掃描結果顯示裝置名稱中含有 "Modicon M340"，該設備極可能屬於哪一類？（縮寫：3個英文字元）', 'PLC', 4),
(3, 'Modbus 採用什麼樣的通訊架構？（共 5 個中文字元，包括斜線）', '主/從架構', 1),
(3, '哪一種暫存器用於控制設備開關，且可讀寫？（中文：2 個中文字元，英文： 4 個英文字母）', '線圈（Coil）', 2),
(3, '功能碼 6 代表什麼操作？（共 9 個中文字元）', '寫入單個保持暫存器', 3),
(3, '如果你想透過 Modbus TCP 強制停機一台馬達，通常會寫入哪一類暫存器？（中文：2 個中文字元，英文： 4 個英文字母）', '線圈（Coil）', 4),
(3, 'Modbus RTU 通常使用哪種物理連接方式傳輸資料？（共 6 字元，含連字號）', 'RS-485', 5),
(3, '輸入暫存器（Input Register）是多少位元？（2位數字）', '16', 6),
(3, '使用 Modbus 功能碼 15 寫入多個線圈，表示什麼樣的操作？（12個中文字元）', '批量控制多個開關狀態', 7),
(4, '請問在 pyModbusTCP 中，哪個函式用來讀取多個保持暫存器？（ 24 個英文字元）', 'read_holding_registers()', 1),
(4, '你想寫入一個單一線圈，使用 pyModbusTCP 的哪個函式？（ 19 個英文字元）', 'write_single_coil()', 2),
(4, '若要一次寫入多個保持暫存器，應該使用什麼函式？（ 26 個英文字元）', 'write_multiple_registers()', 3),
(4, 'pyModbusTCP 讀取的離散輸入是幾位元？（ 1 位數）', '1', 4),
(4, '如何用 pyModbusTCP 讀取線圈狀態？（ 12 個英文字元）', 'read_coils()', 5),
(6, '哪一種 Modbus register 類型同時允許讀取和寫入操作？（兩個英文單字）', 'Holding Register', 1),
(6, '在程式碼範例中，read_holding_registers 函式讀取了多少個 holding registers？（一個十進位整數）', '8', 2),
(6, 'Modbus TCP 函式庫中用來開啟連線的方法名稱為何？（一個英文單字）', 'open', 3),
(7, '用來寫入單一 holding register 的 Modbus TCP 函式名稱為何？（三個英文單字，中間以"_"間隔）', 'write_single_register', 1),
(7, '在程式碼中，用來讀取暫存器進行驗證的函式名稱為何？（三個英文單字，中間以"_"間隔）', 'read_holding_registers', 2),
(7, '批量寫入多個暫存器時，傳入的參數 new_values 是什麼資料型態？（一個英文單字）', 'list', 3),
(8, '在 arpspoof 指令中，用來指定網路介面的參數為何？（一個指令）', '-i', 1),
(8, '在 Wireshark 中，ARP Reply 封包的 opcode 欄位值為何？（一個十進位整數）', '2', 2),
(8, '當 ARP Spoofing 成功時，Wireshark 的專家資訊會顯示什麼警告訊息？（四個英文關鍵字）', 'Duplicate IP address detected', 3),
(9, '在 Wireshark 中，用來過濾 Modbus 讀取操作的語法為何？（英文語法，中間有使用到"=="）', 'modbus.func_code == 3', 1),
(9, 'Modbus TCP 標頭中，用來識別設備的欄位名稱為何？（兩個英文單字）', 'UNIT ID', 2),
(9, 'Function Code 6 在 Wireshark 中對應的操作名稱為何？（三個英文單字）', 'Write Single Register', 3),
(10, '在 Python 中，用來打包二進制資料的模組名稱為何？（一個英文單字）', 'struct', 1),
(10, 'Modbus TCP 的 MBAP Header 總長度是多少位元組？（一個十進位整數）', '7', 2),
(10, 'Function Code 的異常回應會設定哪一個位元？（一個十六進制數字）', '0x80', 3),
(5, '輸入 Wireshark 即可通過', 'Wireshark', 1);