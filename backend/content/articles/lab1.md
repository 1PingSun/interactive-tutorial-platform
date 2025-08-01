# LAB 1 - 用 Modbus TCP 讀 Holding Registers

## 滲透場景

你已經成功進入化工廠的內部網路，透過 Nmap 掃描發現了一台 PLC 設備正在監聽 TCP 502 埠。現在你需要連接到這台 PLC，讀取其 Holding Registers 中的重要製程參數。這是工控滲透的第一步：資訊蒐集。

在真實的工控攻擊案例中，攻擊者通常會先透過讀取操作來了解目標系統的運作狀況，收集關鍵資訊後再進行下一步的惡意操作。

## Modbus TCP 函式庫簡介

Modbus TCP 是 Python 中專門用於 Modbus 通訊的輕量級函式庫，提供簡潔易用的介面來操控工控設備。對於滲透測試人員來說，它是快速存取 PLC 資料的理想工具：

**主要優勢：**
- 輕量化設計，安裝簡單
- 直接的 TCP 連線管理
- 完整的 Modbus 功能碼支援
- 適合快速原型開發和測試

## 讀取操作實作

### 建立 TCP 連線
Modbus TCP 函式庫使用簡潔的方式建立與 PLC 的連線。只需指定目標 IP 和標準的 502 埠即可開始通訊：

```python
from modbus_tcp import ModbusTcpClient
client = ModbusTcpClient('192.168.56.1', 502)
client.open()
```

### 讀取 Holding Registers
使用 read_holding_registers() 方法來執行讀取操作。此方法對應 Modbus Function Code 3，是最常用的資料讀取指令：

```python
# 從位址 0 開始讀取 8 個 Holding Registers
registers = client.read_holding_registers(0, 8)
print(f"讀取結果: {registers}")
```

### 指定 Unit ID
在多設備環境中，Unit ID 用來識別特定的目標設備。每個 PLC 或模組都有唯一的 Unit ID：

```python
# 讀取 Unit ID 為 1 的設備
registers = client.read_holding_registers(0, 5, unit=1)
```

### 錯誤處理與狀態檢查
Modbus TCP 函式庫會在通訊失敗時回傳 None 或拋出例外。建議加入簡單的錯誤檢查：

```python
try:
    registers = client.read_holding_registers(0, 10)
    if registers is not None:
        print(f"成功讀取: {registers}")
except Exception as e:
    print(f"讀取失敗: {e}")
```

### 數值解析與應用
Holding Registers 回傳的是整數陣列，每個元素代表一個 16-bit 暫存器的值。需要根據 PLC 設定來解釋實際意義：

```python
temp_raw = registers[0]     # 原始溫度值
temp_celsius = temp_raw / 10.0  # 轉換為攝氏溫度
print(f"溫度: {temp_celsius}°C")
```

## 程式碼重點解析

| 關鍵函式 | 參數說明 | 滲透意義 |
|----------|----------|----------|
| `ModbusTcpClient('192.168.56.1', 502)` | 目標 IP 和標準 Modbus 埠 | 建立攻擊連線 |
| `read_holding_registers(0, 8, unit=1)` | 起始位址 0，讀取 8 個暫存器，Unit ID 1 | 批量讀取製程資料 |
| `client.open()` | 開啟 TCP 連線 | 啟動通訊通道 |
| `registers[0]` | 取得特定暫存器數值 | 解析重要參數 |

## 滲透價值分析

透過讀取 Holding Registers，攻擊者可以：

- **資訊蒐集**：了解製程運作參數和當前狀態
- **弱點識別**：找出可操控的關鍵設定值
- **攻擊準備**：為後續寫入攻擊制定策略

這看似簡單的讀取操作，實際上是工控攻擊鏈的重要環節。



## 完整範例程式碼

將以下程式碼儲存為 `modbus_read.py`，即可直接執行測試：

```python
from modbus_tcp import ModbusTcpClient

def main():
    # 目標 PLC 資訊
    target_ip = '192.168.56.1'
    target_port = 502
    
    print(f"[*] 連接目標 PLC: {target_ip}:{target_port}")
    
    try:
        # 建立 Modbus TCP 連線
        client = ModbusTcpClient(target_ip, target_port)
        client.open()
        print("[+] 連線建立成功")
        
        # 讀取 Holding Registers (位址 0-7)
        registers = client.read_holding_registers(0, 8, unit=1)
        
        if registers is not None:
            print("[+] Holding Registers 讀取成功:")
            print("=" * 40)
            
            for i, value in enumerate(registers):
                print(f"Register {i:2d}: {value:5d} (0x{value:04X})")
            
            print("=" * 40)
            
            # 解析製程參數
            reactor_temp = registers[0]
            pressure_set = registers[1] 
            alarm_status = registers[2]
            
            print("[!] 重要製程參數:")
            print(f"    反應爐溫度: {reactor_temp}°C")
            print(f"    壓力設定值: {pressure_set} bar")
            print(f"    警報狀態: {alarm_status}")
            
        else:
            print("[-] 讀取失敗")
            
        # 關閉連線
        client.close()
        print("[*] 連線已關閉")
        
    except Exception as e:
        print(f"[-] 發生錯誤: {e}")

if __name__ == "__main__":
    main()
```

執行指令：
```bash
python modbus_read.py
```

## 答題區