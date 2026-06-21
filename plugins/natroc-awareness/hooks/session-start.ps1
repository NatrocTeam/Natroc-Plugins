param(
    [string]$Platform = "claude"
)

# =============================================================================
# SessionStart hook for natroc-awareness (PowerShell)
#
# Injects the using-natroc-plugins SKILL.md into session context.
# Platform-agnostic: works on Windows, Linux, macOS.
# =============================================================================

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pluginRoot = if ($env:CLAUDE_PLUGIN_ROOT) { $env:CLAUDE_PLUGIN_ROOT } else { Resolve-Path "$scriptDir/.." }

$skillFile = Join-Path $pluginRoot "skills" "using-natroc-plugins" "SKILL.md"

if (Test-Path $skillFile) {
    $skillContent = Get-Content $skillFile -Raw
} else {
    $skillContent = "# Natroc Plugin Awareness`n`nError: using-natroc-plugins SKILL.md not found.`n`nInvoke the `natroc-awareness:using-natroc-plugins` skill manually."
}

$context = "<EXTREMELY-IMPORTANT>`nYou have Natroc Plugin Awareness.`n`n**Below is the full content of your 'natroc-awareness:using-natroc-plugins' skill. For all other Natroc plugin skills, use the 'Skill' tool:**`n`n$skillContent`n</EXTREMELY-IMPORTANT>"

$json = @{
    hookSpecificOutput = @{
        hookEventName = "SessionStart"
        additionalContext = $context
    }
} | ConvertTo-Json -Compress -Depth 5

[Console]::Out.WriteLine($json)

exit 0
