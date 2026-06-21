param(
    [string]$Platform = "codex"
)

# =============================================================================
# SessionStart hook for natroc-awareness — Codex variant (PowerShell)
#
# Injects the using-natroc-plugins SKILL.md into session context with
# Codex-specific instructions.
# Platform-agnostic: works on Windows, Linux, macOS.
# =============================================================================

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pluginRoot = if ($env:PLUGIN_ROOT) { $env:PLUGIN_ROOT } else { Resolve-Path "$scriptDir/.." }

# Export for Codex compatibility
$env:CODEX_PLUGIN_ROOT = $pluginRoot

$skillFile = Join-Path $pluginRoot "skills" "using-natroc-plugins" "SKILL.md"

if (Test-Path $skillFile) {
    $skillContent = Get-Content $skillFile -Raw
} else {
    $skillContent = "# Natroc Plugin Awareness`n`nError: using-natroc-plugins SKILL.md not found."
}

$context = "<EXTREMELY-IMPORTANT>`nYou have Natroc Plugin Awareness.`n`n**Below is the full content of your 'natroc-awareness:using-natroc-plugins' skill. For all other Natroc plugin skills, follow the Codex skill-loading instructions in that skill:**`n`n$skillContent`n</EXTREMELY-IMPORTANT>"

$json = @{
    hookSpecificOutput = @{
        hookEventName = "SessionStart"
        additionalContext = $context
    }
} | ConvertTo-Json -Compress -Depth 5

[Console]::Out.WriteLine($json)

exit 0
