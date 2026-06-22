: << 'CMDBLOCK'
@echo off
REM ============================================================================
REM Cross-platform polyglot hook dispatcher for natroc-awareness.
REM
REM Priority chain on Windows:
REM   1. PowerShell .ps1 (native Windows, no bash needed)
REM   2. Git Bash (extensionless bash script)
REM
REM On Unix the bash portion runs natively.
REM
REM Usage: run-hook.cmd <script-name> [args...]
REM
REM Examples:
REM   run-hook.cmd session-start           -> runs session-start.ps1 or session-start
REM   run-hook.cmd memory-read claude      -> calls session-start.ps1 with arg "claude"
REM   run-hook.cmd session-start-codex      -> runs session-start-codex.ps1
REM ============================================================================

if "%~1"=="" (
    echo run-hook.cmd: missing script name >&2
    exit /b 1
)

set "HOOK_DIR=%~dp0"
set "SCRIPT_NAME=%~1"
set "PS1_FILE=%HOOK_DIR%%~1.ps1"

REM --- Priority 1: PowerShell .ps1 (native Windows) ---
if exist "%PS1_FILE%" (
    REM Test for modern PowerShell (pwsh) first, then Windows PowerShell
    where pwsh >nul 2>nul
    if not errorlevel 1 (
        pwsh -NoProfile -ExecutionPolicy Bypass -File "%PS1_FILE%" %2 %3 %4 %5 %6 %7 %8 %9
        exit /b %ERRORLEVEL%
    )
    powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1_FILE%" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)

REM --- Priority 2: Git Bash (extensionless bash script) ---
if exist "C:\Program Files\Git\bin\bash.exe" (
    "C:\Program Files\Git\bin\bash.exe" "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)
if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
    "C:\Program Files (x86)\Git\bin\bash.exe" "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)
where bash >nul 2>nul
if not errorlevel 1 (
    bash "%HOOK_DIR%%~1" %2 %3 %4 %5 %6 %7 %8 %9
    exit /b %ERRORLEVEL%
)

REM --- No handler found ---
REM If a PowerShell .ps1 exists alongside but neither pwsh nor powershell
REM could be found, the error from powershell above is the real problem.
REM If neither .ps1 nor bash exists, tell the user.
echo run-hook.cmd: could not find %HOOK_DIR%%~1.ps1 or a bash interpreter >&2
exit /b 0
CMDBLOCK

# =============================================================================
# Unix portion - runs in bash natively.
# Priority:
#   1. Extensionless bash script (native on Unix)
#   2. .ps1 via pwsh if available
# =============================================================================
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_NAME="$1"
shift

# Priority 1: extensionless bash script
if [ -x "${SCRIPT_DIR}/${SCRIPT_NAME}" ] || [ -f "${SCRIPT_DIR}/${SCRIPT_NAME}" ]; then
    exec bash "${SCRIPT_DIR}/${SCRIPT_NAME}" "$@"
fi

# Priority 2: .ps1 via pwsh
if [ -f "${SCRIPT_DIR}/${SCRIPT_NAME}.ps1" ]; then
    if command -v pwsh >/dev/null 2>&1; then
        exec pwsh -NoProfile -File "${SCRIPT_DIR}/${SCRIPT_NAME}.ps1" "$@"
    fi
fi

# No handler found - exit silently
exit 0
