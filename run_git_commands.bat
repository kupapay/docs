@echo off
setlocal enabledelayedexpansion

cd C:\Users\HomePC\Documents\kupapay

echo.
echo ============================================================
echo Running: git status -sb
echo ============================================================
python -c "import subprocess; r = subprocess.run('git status -sb', shell=True, capture_output=True, text=True); print('STDOUT:\n' + (r.stdout or '(empty)')); print('\nSTDERR:\n' + (r.stderr or '(empty)')); print(f'\nReturn code: {r.returncode}')"

echo.
echo ============================================================
echo Running: git add -A
echo ============================================================
python -c "import subprocess; r = subprocess.run('git add -A', shell=True, capture_output=True, text=True); print('STDOUT:\n' + (r.stdout or '(empty)')); print('\nSTDERR:\n' + (r.stderr or '(empty)')); print(f'\nReturn code: {r.returncode}')"

echo.
echo ============================================================
echo Running: git commit
echo ============================================================
python -c "import subprocess; r = subprocess.run('git commit -m \"docs: TASK-008 add system diagram\"', shell=True, capture_output=True, text=True); print('STDOUT:\n' + (r.stdout or '(empty)')); print('\nSTDERR:\n' + (r.stderr or '(empty)')); print(f'\nReturn code: {r.returncode}')"

echo.
echo ============================================================
echo All commands completed
echo ============================================================
