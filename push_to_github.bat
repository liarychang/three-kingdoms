@echo off
chcp 65001 >nul
echo 正在執行 Git 同步更新...
python auto_git_sync.py
pause
