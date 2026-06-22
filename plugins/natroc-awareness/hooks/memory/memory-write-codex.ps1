param()

# =============================================================================
# Stop hook for natroc-awareness - Codex (PowerShell)
#
# Instructs the agent to update ~/.codex/memory/MEMORY.md with new knowledge.
# Exits silently if stop_hook_active is true (loop protection).
# =============================================================================

$input = [Console]::In.ReadToEnd()
if ($input -match '"stop_hook_active"\s*:\s*true') {
    exit 0
}

$memoryFile = Join-Path $HOME ".codex" "memory" "MEMORY.md"
$memoryDir = Split-Path $memoryFile -Parent

$instruction = @"
<EXTREMELY-IMPORTANT>
## Persistent Agent Memory Update Required

Before you stop, you MUST update the persistent agent memory file at:

`$memoryFile

### Instructions:
1. Read the existing `$memoryFile file using the Read tool.
2. Create the directory with `mkdir -p "$memoryDir"` if it does not exist.
3. Identify any new knowledge, patterns, architecture insights, debugging tips, or project conventions you learned during this session that are NOT already in the file.
4. Append the new knowledge under the "## Past Sessions" section, below the `<!-- Agents: append new knowledge below this line after each session. -->` comment.
5. Use the Write tool to save the updated file.
6. Format new entries as simple bullet points under a dated heading, for example:

   ```
   ### Session 2026-06-22
   - Learned: project uses custom middleware pattern in src/middleware/
   - Key insight: auth tokens must include workspace_id claim
   ```

Do NOT overwrite existing memories - only append new ones. If nothing new was learned, add a simple note like "No new knowledge acquired this session."
</EXTREMELY-IMPORTANT>
"@

$json = @{
    hookSpecificOutput = @{
        hookEventName = "Stop"
        additionalContext = $instruction
    }
} | ConvertTo-Json -Compress -Depth 5

[Console]::Out.WriteLine($json)
exit 0
