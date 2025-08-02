# LAB 3 - ARP Spoofing 繞過 IP 白名單

## 滲透場景

經過前兩個 Lab 的學習，你已經掌握了 Modbus TCP 的讀寫操作。但在實際的工控環境中，許多 PLC 設備會配置 **IP 白名單**機制，只允許特定 IP 位址的設備進行連線。

假設化工廠的 PLC (192.168.56.1) 只允許 HMI 工作站（192.168.56.10）進行 Modbus 通訊，而你的 Parrot OS 攻擊機位於 192.168.56.101。直接連線會被拒絕，但透過 ARP Spoofing 技術，你可以偽裝成合法的 HMI 工作站，成功繞過這個防護機制。

## ARP 協議基礎

ARP（Address Resolution Protocol）是網路層與資料鏈路層之間的重要協議，負責將 IP 位址對應到 MAC 位址：

| ARP 運作原理 | 說明 |
|-------------|------|
| **ARP Request** | 廣播詢問特定 IP 的 MAC 位址 |
| **ARP Reply** | 回應自己的 MAC 位址 |
| **ARP Table** | 本地快取 IP-MAC 對應關係 |
| **更新機制** | 收到 ARP Reply 時自動更新 |

## ARP Spoofing 攻擊原理

ARP Spoofing 利用 ARP 協議缺乏驗證機制的弱點，發送偽造的 ARP Reply 封包來污染目標的 ARP Table：

### 攻擊前的正常狀況
```
PLC (192.168.56.1) 的 ARP Table:
192.168.56.10 -> aa:bb:cc:dd:ee:ff (真實 HMI 工作站)
```

### 執行 ARP Spoofing 後
```
PLC (192.168.56.1) 的 ARP Table:
192.168.56.10 -> 08:00:27:xx:xx:xx (攻擊者 MAC)
```

## Parrot OS 內建工具

Parrot OS 作為專業的滲透測試平台，內建了多種 ARP Spoofing 工具：

### Ettercap 圖形介面工具
Ettercap 是最受歡迎的中間人攻擊工具，提供直觀的圖形操作介面：

**啟動方式：**
```bash
sudo ettercap -G
```

**操作步驟：**
1. 選擇網路介面 (enp0s8)
2. 掃描區域網路尋找主機
3. 添加目標到 Target 清單
4. 啟動 ARP Spoofing 攻擊

### arpspoof 命令列工具
arpspoof 是輕量級的 ARP Spoofing 工具，適合快速攻擊：

```bash
# 持續向 PLC 發送偽造的 ARP Reply
sudo arpspoof -i enp0s8 -t 192.168.56.1 192.168.56.10
```

**參數說明：**
- `-i enp0s8`: 指定網路介面
- `-t 192.168.56.1`: 目標 IP (PLC)
- `192.168.56.10`: 要偽裝的 IP (HMI)


## Wireshark 封包分析

### 啟動 Wireshark 監控
使用 Wireshark 可以即時觀察 ARP Spoofing 的攻擊過程：

**啟動指令：**
```bash
sudo wireshark
```

**監控設定：**
1. 選擇 `enp0s8` 介面開始捕獲
2. 設定過濾器：`arp` 只顯示 ARP 封包
3. 觀察封包流量變化

### 識別正常 ARP 流量
在攻擊開始前，觀察正常的 ARP Request/Reply 循環：

| 封包特徵 | 正常值 | 說明 |
|---------|--------|------|
| **Source MAC** | 真實設備 MAC | 來源設備實際 MAC 位址 |
| **Sender IP** | 對應 IP | IP 與 MAC 配對正確 |
| **Opcode** | 1 或 2 | Request=1, Reply=2 |
| **頻率** | 低頻率 | 正常更新週期 |

### 檢測 ARP Spoofing 攻擊
當 ARP Spoofing 開始時，Wireshark 會顯示以下異常特徵：

**異常流量模式：**
```
大量 ARP Reply 封包 (Opcode = 2)
相同 IP 對應到不同 MAC 位址
高頻率的 ARP 更新
```

**Wireshark 警告訊息：**
```
[Expert Info] Duplicate IP address detected for 192.168.56.10
[Expert Info] ARP packet storm detected
```

### 進階過濾器使用
使用更精確的 Wireshark 過濾器來分析攻擊：

```bash
# 顯示特定 IP 的 ARP Reply
arp.opcode == 2 and arp.src.proto_ipv4 == 192.168.56.10

# 檢查 MAC 位址不一致
arp.duplicate-address-detected

# 顯示 ARP 風暴
arp and frame.time_delta < 0.1
```

## 攻擊效果驗證

### 檢查 ARP Table 污染
在目標系統上檢查 ARP Table 是否被成功污染：

```bash
# 在 PLC 或其他設備上執行
arp -a | grep 192.168.56.10
```

**期望結果：**
```
192.168.56.10 ether 08:00:27:xx:xx:xx C enp0s8
```

### 測試 Modbus 連線
ARP Spoofing 成功後，應該能夠繞過 IP 白名單限制：

1. 使用之前的 Modbus TCP 程式測試連線
2. 觀察是否能成功讀取 Holding Registers
3. 確認攻擊流量被重導向到攻擊者

## 攻擊流程整合

### 步驟一：環境準備
```bash
# 啟動 Wireshark 監控
sudo wireshark &

# 檢查網路介面
ip addr show enp0s8
```

### 步驟二：執行 ARP Spoofing
```bash
# 使用 arpspoof 持續攻擊
sudo arpspoof -i enp0s8 -t 192.168.56.1 192.168.56.10
```

### 步驟三：Wireshark 分析
在 Wireshark 中觀察：
- ARP Reply 封包的頻率增加
- Source MAC 位址變更
- 出現重複 IP 警告

### 步驟四：驗證攻擊效果
測試 Modbus 連線是否成功繞過 IP 白名單限制

## 防禦偵測要點

### Wireshark 中的攻擊指標
系統管理員可透過以下 Wireshark 特徵偵測 ARP Spoofing：

| 偵測指標 | Wireshark 顯示 | 風險等級 |
|---------|---------------|----------|
| **ARP 風暴** | 大量連續 ARP Reply | 高 |
| **MAC 變更** | 同 IP 對應不同 MAC | 高 |
| **專家資訊警告** | Duplicate IP detected | 中 |
| **異常頻率** | 過於頻繁的 ARP 更新 | 中 |

## 滲透價值分析

透過 ARP Spoofing 繞過 IP 白名單，攻擊者可以：

- **身份偽裝**：冒充授權設備的 IP 位址
- **防護繞過**：突破基於 IP 的存取控制
- **隱蔽通道**：在合法流量中隱藏攻擊活動

這種攻擊在工控環境中特別有效，因為多數 OT 設備僅依賴 IP 白名單而缺乏 MAC 位址驗證。

## 答題區
