@echo off
chcp 65001 > nul
title TWCD 台語數位工具箱 (Next-Gen Suite)

echo ========================================================
echo       TWCD 台語數位工具箱 (Next-Gen Suite)
echo       逆向工程重構版 • 華台翻譯 • 漢羅全羅 • Ruby標音 • CTS
echo ========================================================
echo.
echo 正在啟動本機伺服器並開啟瀏覽器...
echo 網址: http://localhost:8000
echo.
echo 提示：本工具亦支援直接點擊 index.html 100%% 離線運行！
echo 按 Ctrl + C 可隨時關閉伺服器。
echo ========================================================
echo.

start "" "http://localhost:8000"
python -m http.server 8000
