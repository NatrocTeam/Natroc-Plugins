param()

# =============================================================================
# Stop hook for natroc-awareness - Claude (PowerShell)
#
# Instructs the agent to update ~/.claude/memory/MEMORY.md with new knowledge.
#
# Loop protection (two layers):
#   1. stop_hook_active guard (built-in): if true, this is a continuation Stop
#      and the primary write step already ran, so stay silent.
#   2. session flag guard: if ~/.claude/memory/.last-written already contains
#      the current session_id, memory was already written this session, so
#      stay silent and let the agent stop cleanly.
#
# On the first Stop of a session, the flag is missing, so we inject the
# write-memory instruction. The instruction tells the agent to append the
# session_id to the flag file right after updating MEMORY.md. On the next
# Stop, the flag matches and the hook becomes a no-op - breaking the
# forced continuation loop while still updating memory every task.
# =============================================================================

$input = [Console]::In.ReadToEnd()

# --- Loop protection layer 1: continuation Stop (built-in) -----------------
if ($input -match '"stop_hook_active"\s*:\s*true') {
    exit 0
}

$memoryDir = Join-Path $HOME ".claude" "memory"
$memoryFile = Join-Path $memoryDir "MEMORY.md"
$flagFile = Join-Path $memoryDir ".last-written"

# --- Extract session_id from Claude Stop hook input ------------------------
$sessionId = $null
if ($input -match '"session_id"\s*:\s*"([^"]*)"') {
    $sessionId = $matches[1]
}

# --- Determine marker: session_id when available, else stable daily date -------
if ($sessionId) {
    $expectedMarker = $sessionId
    $flagCmd = "printf '%s' '$sessionId' > '$flagFile'"
} else {
    # Use YYYY-MM-DD as stable daily marker instead of a per-second timestamp.
    # A per-second timestamp changes every call and the agent can never "catch up",
    # causing an infinite Stop→instruction→Stop loop on runtimes that don't pass session_id.
    $expectedMarker = (Get-Date -Format "yyyy-MM-dd")
    $flagCmd = "printf '%s' '$expectedMarker' > '$flagFile'"
}

# --- Loop protection layer 2: session flag ---------------------------------
# Check against whichever marker we resolved above (session_id or daily date)
if ((Test-Path $flagFile)) {
    $stored = (Get-Content $flagFile -Raw -ErrorAction SilentlyContinue) -as [string]
    if ($stored -and $stored.Trim() -eq $expectedMarker) {
        exit 0
    }
}

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

### Loop guard (MANDATORY):
After updating `$memoryFile, run this exact command to mark memory as written for this session (prevents the Stop hook from re-prompting you):

```bash
$flagCmd
```
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
