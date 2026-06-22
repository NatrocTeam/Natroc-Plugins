import readline from "readline";

// ── ANSI ────────────────────────────────────────────────────────────────────
const HIDE = "\x1b[?25l";
const SHOW = "\x1b[?25h";
const CLEAR = "\x1b[2K";
const UP = (n) => `\x1b[${n}A`;
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

const SPINNER = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
const BAR_FILL = "━";
const BAR_EMPTY = "─";

// ── Checkbox ────────────────────────────────────────────────────────────────
export function checkbox(options) {
  const message = options.message || "Select items:";
  const choices = options.choices || [];
  const pageSize = options.pageSize || 8;

  const items = choices.map((c) => ({
    name: c.name,
    label: c.label || c.name,
    checked: c.checked !== false,
  }));

  let cursor = 0;
  let scroll = 0;
  let first = true;
  let lines = 0;
  let done = false;

  // Detect the "Select All" item index
  const selectAllIdx = items.findIndex((i) => i.name === "__select_all__");

  return new Promise((resolve) => {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);

    const writer = process.stdout.write.bind(process.stdout);

    function cleanup() {
      process.stdin.removeListener("keypress", onKeypress);
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.stdin.pause();
      writer(SHOW);
    }

    function render() {
      // Sync Select All: checked only when ALL non-select-all items are checked
      if (selectAllIdx !== -1) {
        const nonAll = items.filter((_, i) => i !== selectAllIdx);
        items[selectAllIdx].checked = nonAll.every((i) => i.checked);
      }

      const visible = items.slice(scroll, scroll + pageSize);
      const buf = [];

      buf.push(`\n${BOLD}?${RESET} ${GREEN}${message}${RESET}\n\n`);

      for (const item of visible) {
        const idx = items.indexOf(item);
        const isCur = idx === cursor;
        const chk = item.checked ? `${GREEN}■${RESET}` : `${DIM}□${RESET}`;
        const ptr = isCur ? `${CYAN}›${RESET}` : " ";
        const name = isCur ? `${CYAN}${item.label}${RESET}` : item.label;
        buf.push(`  ${ptr} ${chk} ${name}\n`);
      }

      if (items.length > pageSize) {
        const pct = Math.round((scroll / (items.length - pageSize)) * 100);
        buf.push(`\n  ${DIM}${pct}% · ${items.length} total${RESET}\n`);
      }

      const count = items.filter(
        (i) => i.checked && i.name !== "__select_all__",
      ).length;
      const total = items.filter((i) => i.name !== "__select_all__").length;
      buf.push(`\n  ${BOLD}${count}/${total}${RESET} ${DIM}selected${RESET}\n`);
      buf.push(`  ${DIM}↑↓ navigate · space toggle · enter confirm${RESET}\n`);

      const out = buf.join("");
      const newLines = out.split("\n").length - 1;

      if (!first) {
        writer(UP(lines));
        for (let i = 0; i < lines; i++) writer(CLEAR + "\n");
        writer(UP(lines));
      }
      first = false;
      lines = newLines;
      writer(out);
    }

    function onKeypress(_str, key) {
      if (!key || done) return;

      if (key.name === "up" && cursor > 0) {
        cursor--;
        if (cursor < scroll) scroll = cursor;
        render();
      } else if (key.name === "down" && cursor < items.length - 1) {
        cursor++;
        if (cursor >= scroll + pageSize) scroll = cursor - pageSize + 1;
        render();
      } else if (key.name === "space") {
        const toggled = items[cursor];

        if (selectAllIdx !== -1 && cursor === selectAllIdx) {
          // Toggle Select All → toggle ALL real items
          const nextState = !toggled.checked;
          for (let i = 0; i < items.length; i++) {
            if (i !== selectAllIdx) items[i].checked = nextState;
          }
        } else {
          // Toggle one real item
          toggled.checked = !toggled.checked;
        }

        render();
      } else if (key.name === "return") {
        done = true;
        cleanup();
        const result = items.filter((i) => i.checked).map((i) => i.name);
        resolve(result);
      } else if (key.name === "c" && key.ctrl) {
        cleanup();
        process.exit(0);
      }
    }

    process.stdin.on("keypress", onKeypress);
    writer(HIDE);
    render();
  });
}

// ── Spinner ─────────────────────────────────────────────────────────────────
export function spinner(label, promise) {
  let i = 0;
  const timer = setInterval(() => {
    process.stdout.write(`\r${CLEAR}  ${CYAN}${SPINNER[i]}${RESET} ${label}`);
    i = (i + 1) % SPINNER.length;
  }, 80);

  return promise
    .then((result) => {
      clearInterval(timer);
      process.stdout.write(`\r${CLEAR}  ${GREEN}✔${RESET} ${label}\n`);
      return result;
    })
    .catch((err) => {
      clearInterval(timer);
      process.stdout.write(`\r${CLEAR}  ${RED}✘${RESET} ${label}\n`);
      throw err;
    });
}

// ── Confirm ─────────────────────────────────────────────────────────────────
export function confirm(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`\n${BOLD}?${RESET} ${message} ${DIM}(Y/n)${RESET} `, (ans) => {
      rl.close();
      resolve(ans.toLowerCase() !== "n");
    });
  });
}

// ── Progress bar ─────────────────────────────────────────────────────────────
export function progress(current, total, label) {
  const width = 24;
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  const bar = `${GREEN}${BAR_FILL.repeat(filled)}${RESET}${DIM}${BAR_EMPTY.repeat(empty)}${RESET}`;
  const p = `${YELLOW}${String(pct).padStart(3)}%${RESET}`;
  const lbl = label ? ` ${label}` : "";

  process.stdout.write(`\r${CLEAR}  ${bar} ${p}${lbl}`);
}

// ── Progress done ────────────────────────────────────────────────────────────
export function progressDone() {
  process.stdout.write("\n");
}
