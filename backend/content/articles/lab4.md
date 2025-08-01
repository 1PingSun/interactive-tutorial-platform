# LAB 4 - Wireshark 解析 Modbus

## 滲透場景

在前面的 Lab 中，你學會了執行 Modbus 操作和 ARP Spoofing 攻擊。現在作為一名資安分析師，你需要透過網路流量分析來還原攻擊過程，了解攻擊者究竟對 PLC 執行了哪些操作。

化工廠的網管人員發現了可疑的網路活動，並提供了一份網路封包擷取檔案。你的任務是使用 Wireshark 深入分析這些 Modbus 流量，找出攻擊者讀取了哪些暫存器、修改了什麼數值，以及整個攻擊的時間序列。

## Modbus TCP 封包結構

Modbus TCP 協議在標準 TCP 之上添加了專用的標頭結構，了解這些欄位對於流量分析至關重要：

| 欄位名稱 | 長度 | 說明 | 範例值 |
|---------|------|------|--------|
| **Transaction ID** | 2 bytes | 交易識別碼 | 0x0001 |
| **Protocol ID** | 2 bytes | 協議識別碼（固定值） | 0x0000 |
| **Length** | 2 bytes | 後續資料長度 | 0x0006 |
| **Unit ID** | 1 byte | 設備識別碼 | 0x01 |
| **Function Code** | 1 byte | 功能碼 | 0x03 |
| **Data** | 變長 | 功能相關資料 | 位址、數量等 |

## Wireshark Modbus 解析器

### 啟用 Modbus 協議解析
Wireshark 內建強大的 Modbus 協議解析器，可以自動識別和解析 TCP 502 埠的流量：

**檢查解析器狀態：**
```
Analyze → Enabled Protocols → 搜尋 "Modbus" → 確認已勾選
```

**手動指定埠號：**
```
Edit → Preferences → Protocols → Modbus/TCP → Port: 502
```

### 基本過濾器語法
使用專用的 Modbus 過濾器可以快速定位相關封包：

```bash
# 顯示所有 Modbus 封包
modbus

# 只顯示讀取操作 (Function Code 3)
modbus.func_code == 3

# 只顯示寫入操作 (Function Code 6, 16)
modbus.func_code == 6 or modbus.func_code == 16

# 特定 Unit ID 的流量
modbus.unit_id == 1
```

## 常見 Function Code 分析

### Function Code 3 - 讀取 Holding Registers
這是最常見的讀取操作，在 Wireshark 中會顯示詳細的請求和回應：

**Request 封包結構：**
- `modbus.reference_num`: 起始位址
- `modbus.word_cnt`: 讀取數量
- `modbus.unit_id`: 目標設備

**Response 封包結構：**
- `modbus.byte_cnt`: 回傳位元組數
- `modbus.register_data_uint16`: 暫存器數值陣列

### Function Code 6 - 寫入單一 Register
用於修改單一暫存器的值：

**在 Wireshark 中的顯示：**
```
Modbus/TCP
├── Function Code: Write Single Register (6)
├── Reference Number: 0 (起始位址)
├── Data Value: 1200 (寫入的數值)
└── Unit Identifier: 1
```

### Function Code 16 - 寫入多個 Registers
批量寫入多個暫存器：

**重要欄位：**
- `modbus.reference_num`: 起始位址
- `modbus.word_cnt`: 寫入數量
- `modbus.byte_cnt`: 資料位元組數
- `modbus.data`: 實際寫入的數值

## 進階過濾技巧

### 時間序列分析
使用時間戳記來重建攻擊時間線：

```bash
# 顯示特定時間範圍的 Modbus 流量
frame.time >= "2024-08-01 14:30:00" and frame.time <= "2024-08-01 14:35:00" and modbus

# 依時間排序檢視
Statistics → Flow Graph → 選擇 Modbus 流量
```

### 異常行為識別
透過過濾器找出可疑的操作模式：

```bash
# 頻繁的寫入操作
modbus.func_code == 6 and frame.time_delta < 1

# 大量讀取不同位址
modbus.func_code == 3 and modbus.reference_num > 10

# 異常大的數值寫入
modbus.func_code == 6 and modbus.data > 1000
```

### 資料匯出與統計
Wireshark 提供多種統計功能來分析 Modbus 流量：

**Flow Graph 流程圖：**
```
Statistics → Flow Graph
設定過濾器：modbus
選擇時間範圍進行分析
```

**I/O Graph 流量圖：**
```
Statistics → I/O Graphs
Y軸：COUNT(*)
過濾器：modbus.func_code == 3 (讀取)
過濾器：modbus.func_code == 6 (寫入)
```

## 實際分析案例

### 案例一：資訊蒐集階段
攻擊者通常會先進行大範圍的資料讀取：

**典型特徵：**
- 連續的 Function Code 3 請求
- 覆蓋廣泛位址範圍 (0-50)
- 短時間內大量請求

**Wireshark 顯示：**
```
Frame 1: Read Holding Registers, Address: 0, Count: 10
Frame 2: Read Holding Registers, Address: 10, Count: 10
Frame 3: Read Holding Registers, Address: 20, Count: 10
```

### 案例二：目標攻擊階段
確定目標後，攻擊者會執行精確的寫入操作：

**特徵分析：**
- 針對特定位址的寫入 (Function Code 6)
- 寫入危險數值 (超出正常範圍)
- 立即的讀取驗證

**封包序列：**
```
Frame 10: Write Single Register, Address: 0, Value: 1500
Frame 11: Read Holding Registers, Address: 0, Count: 1
Frame 12: Response: Register Value: 1500
```

## 專家資訊判讀

### Wireshark 警告訊息
Wireshark 會自動標記可疑的 Modbus 流量：

| 警告類型 | 顯示訊息 | 可能原因 |
|---------|----------|----------|
| **Expert Info** | Malformed Packet | 封包結構錯誤 |
| **Expert Info** | Response in wrong direction | 回應方向異常 |
| **Expert Info** | Retransmission** | 封包重傳 |

### 顏色編碼規則
設定 Wireshark 顏色規則來突出顯示重要的 Modbus 流量：

```bash
# 讀取操作 - 綠色
modbus.func_code == 3

# 寫入操作 - 紅色  
modbus.func_code == 6 or modbus.func_code == 16

# 錯誤回應 - 深紅色
modbus.exception_code
```

## 匯出與報告

### 封包資料匯出
將分析結果匯出為不同格式：

**匯出選定封包：**
```
File → Export Specified Packets
設定過濾器：modbus.func_code == 6
儲存為 .pcap 或 .csv 格式
```

**匯出統計資料：**
```
Statistics → Protocol Hierarchy
Statistics → Conversations
Statistics → Endpoints
```

### 產生分析報告
使用 Wireshark 的統計功能產生專業報告：

1. **時間線分析**：Flow Graph 顯示攻擊順序
2. **流量統計**：I/O Graph 顯示攻擊模式
3. **異常識別**：Expert Info 匯總可疑活動
4. **資料提取**：匯出關鍵封包內容

## 防禦建議

### 監控指標設定
基於 Wireshark 分析結果，建議設定以下監控規則：

| 監控項目 | 閾值設定 | 告警等級 |
|---------|----------|----------|
| **寫入頻率** | >10次/分鐘 | 高 |
| **讀取範圍** | >20個連續位址 | 中 |
| **異常數值** | 超出預設範圍 | 高 |
| **非授權時間** | 非工作時間存取 | 中 |



## 答題區