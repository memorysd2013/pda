# ma-tek-delivery

## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

# Release Notes

[v1.0.0](#v100) | [v1.0.1](#v101) | [v1.0.2](#v102) | [v1.0.3](#v103) | [v1.0.4](#v104) | [v1.0.5](#v105) | [v1.0.6](#v106) | [v1.0.7](#v107) | [v1.0.8](#v108) | [v1.0.9](#v109) | [v1.0.10](#v1010) | [v1.0.11](#v1011) | [v1.0.12](#v1012) | [v1.0.13](#v1013) | [v1.0.14](#v1014) | [v1.0.15](#v1015) | [v1.0.16](#v1016)

> ## v1.0.16

> ### <ins>Bug Fixes</ins>
> - 處理掃描組件按鈕的 default 事件觸發

> ## v1.0.15

> ### <ins>Bug Fixes</ins>
> - 解決掃描組件參數調整，造成點貨、貨到廠功能失效的問題

> ## v1.0.14

> ### <ins>Performance or Experience</ins>
> - 案件列表頁都會顯示最後一筆紀錄
> - 列表頁掃描搜尋時會以 originalList 搜尋並更新公司篩選、送收件條件
> - 批次多筆篩選調整為案件送件以收件公司篩選、案件收件以送件公司篩選

> ## v1.0.13

> ### <ins>Features</ins>
> - 列表頁的公司篩選按鈕調整為兩排直列
> - 案件詳細頁增加收件電話二

> ### <ins>Bug Fixes</ins>
> - 調整登入流程，取得廠區列表失敗也可以正常登入

> ## v1.0.12

> ### <ins>Bug Fixes</ins>
> - 修正建立貨到廠紀錄時 LabName 傳送的參數為 SiteText

> ## v1.0.11

> ### <ins>Bug Fixes</ins>
> - 新增掃描組件可以清空 model 的按鈕
> - 新增同步掃描條件的屬性

> ## v1.0.10

> ### <ins>Bug Fixes</ins>
> - fix: Google Chrome: Simultaneously 'smooth' scrollIntoView() with more elements doesn't work

> ## v1.0.9

> ### <ins>Bug Fixes</ins>
> - 封鎖 Chrome 下拉重整事件
> - 給予 scrollToSpecificEl setTimeout 避免兩者衝突

> ## v1.0.8

> ### <ins>Bug Fixes</ins>
> - 調整篩選公司名稱的 filter 解決沒有公司名稱的案件顯示的問題

> ## v1.0.7

> ### <ins>Performance or Experience</ins>
> - 點擊公司篩選時不觸發列表滑到底發送 api 的功能，以避免取得太多案件

> ## v1.0.6

> ### <ins>Features</ins>
> - 若有按下公司篩選按鈕, 回到列表時飛梭至該按鈕
> - 貨到廠頁面新增刪除廠區的按鈕
> - 封鎖點貨、貨到廠頁面的案件狀態選擇組件點擊

> ## v1.0.5

> ### <ins>Features</ins>
> - 在案件詳細頁按下關閉回到列表頁時, 也會將列表飛縮至該案件

> ### <ins>Performance or Experience</ins>
> - 開啟 google map 調整為將中文地址轉換成 encode 再開啟, 穩定性較高
> - 按下列表頁重新整理時, 依照 timestamp 起迄只發送一次 api, 減少 api 發送次數與時間
> - 調整設置公司按鈕的邏輯, 減少迴圈使用以提升效能
> - 避免切換按鈕時觸發到列表滑動到底事件

> ### <ins>Bug Fixes</ins>
> - 解決 ios 登出問題

> ## v1.0.4

> ### <ins>Performance or Experience</ins>
> - 調整 PWA 設定

> ## v1.0.3

> ### <ins>Features</ins>
> - 對案件進行操作並返回列表時將該案件拉回畫面

> ## v1.0.2

> ### <ins>Features</ins>
> - 載入新的 QR Code 掃描模組，解決 QR Code 太小無法掃描的問題
> - SiteList 欄位更新，廠區掃描與輸入判斷為代碼
> - Manifest 條整，鎖定螢幕方向，Android icon 加入問題調整
> - 樣式調整，移除卡片客戶名稱的底線，電話地址加入底線

> ## v1.0.1

> ### <ins>Bug Fixes</ins>
> - 調整自動登入邏輯
> - 調整簽名組件，必須要有簽名檔才允許 api 發送

> ## v1.0.0

> ### <ins>Features</ins>
> - 系統初版部署