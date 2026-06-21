param()

# =============================================================================
# UserPromptSubmit hook for natroc-awareness — Codex (PowerShell)
#
# Reads ~/.codex/memory/MEMORY.md and injects as additionalContext.
# =============================================================================

$memoryFile = Join-Path $HOME ".codex" "memory" "MEMORY.md"

if (-not (Test-Path $memoryFile)) {
    exit 0
}

$content = Get-Content $memoryFile -Raw
if (-not $content.Trim()) {
    exit 0
}

$context = "<AGENT-MEMORY>`nYou have persistent agent memory from previous sessions:`n`n$content`n</AGENT-MEMORY>"

$json = @{
    hookSpecificOutput = @{
        hookEventName = "UserPromptSubmit"
        additionalContext = $context
    }
} | ConvertTo-Json -Compress -Depth 5

[Console]::Out.WriteLine($json)
exit 0
