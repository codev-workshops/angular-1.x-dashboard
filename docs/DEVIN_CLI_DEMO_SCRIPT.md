# Devin CLI Blitz Demo -- angular-dashboard Edition

**Duration:** 60 minutes (40 min hands-on + 10 min install/sign-up + 10 min Q&A)

**Audience:** Engineers new to Devin CLI

**Demo Repository:** [`angular-1.x-dashboard`](https://github.com/codev-workshops/angular-1.x-dashboard) -- an AngularJS 1.x component library for building persistent, draggable, resizable widget dashboards.

**What you'll learn:** How to use Devin CLI for day-to-day coding, how AGENTS.md and Skills customize agent behavior, how to connect MCP servers, and how to hand off work to cloud Devin.

---

## Instructor Prerequisites

- Run through this lab once before delivering live
- `angular-1.x-dashboard` repo cloned locally
  - Since this is a private repo it needs to be indexed in DeepWiki before the MCP tool calls work -- alternatively use a public repo for the MCP section (see Part 3)
- Devin CLI installed and authenticated
- AGENTS.md and Skill files ready (provided below)
- MCP server connection verified

## Participant Prerequisites

- A terminal (macOS, Linux, WSL, or Windows PowerShell)
- A Devin account (sign up at https://app.devin.ai if you don't have one)
- Git installed and a repo you can experiment in (or clone `angular-1.x-dashboard`)
- Node.js installed (needed for the MCP exercise)

---

# Part 0 -- Install & Sign Up (10 min)

### Step 0.1 -- Install Devin CLI

**macOS / Linux / WSL:**

```bash
curl -fsSL https://cli.devin.ai/install.sh | bash
```

**macOS via Homebrew:**

```bash
brew install --cask devin-cli
```

**Windows (PowerShell only -- not Git Bash or CMD):**

```powershell
irm https://static.devin.ai/cli/setup.ps1 | iex
```

After install, **restart your terminal**.

### Step 0.2 -- Verify and log in

```bash
devin --version
```

Then, from any project directory, launch the CLI:

```bash
devin
```

On first launch you'll be prompted to authenticate -- or run `/login` inside the CLI. This opens a browser window to sign in with your Devin account.

> **Troubleshooting:**
>
> - `devin: command not found` -- restart your terminal or run `source ~/.bashrc` / `~/.zshrc`
> - Windows: make sure you used **PowerShell** for the install command

**Checkpoint:** You see the Devin CLI welcome screen and are logged in.

---

# Part 1 -- CLI Fundamentals (12 min)

### Step 1.1 -- Start a session in the angular-dashboard repo

> **Narrator:** "Let's open the Devin CLI inside the angular-dashboard repository. This is an AngularJS 1.x component library that lets you build dashboards with draggable, resizable widgets -- think of it as a framework for creating admin panels."

```bash
cd path/to/angular-1.x-dashboard
devin
```

Show the help menu first:

```
/help
```

> **Narrator:** "This is an easy way to see everything the CLI can do. Let's start by asking Devin about the codebase."

Ask Devin something about the codebase:

```
What does this project do? Give me a 3-bullet summary.
```

> **Expected response (paraphrased):**
> Devin reads key files (`README.md`, `package.json`, `src/components/directives/dashboard/dashboard.js`) and responds with something like:
> - It's an AngularJS directive for creating dynamic dashboards with add/remove widget capabilities
> - Widgets can be dragged, resized, and their state persisted to localStorage
> - Supports multiple dashboard layouts, custom widget settings, and real-time data models via WebSocket/REST

Watch how the agent reads files and reports back. Point out the tool-call trace in the terminal.

### Step 1.2 -- Preload a prompt (great for scripting/automation)

Exit the CLI (`Ctrl+C` twice or `/exit`), then start a session with a task already loaded:

```bash
devin
ask: find one small code quality improvement in this repo and explain it
```

> **Expected response (example):**
> Devin might spot the typo `congfigurable widget` in `src/app/customWidgetSettings.js` (line 25 and 58) -- it should be `configurable widget`. Or it might flag the `var title;` declaration on line 102 of `dashboard.js` that is assigned but never read.

> **Narrator:** "Notice Devin didn't just skim the README -- it dug into the source code, found an actual issue, and explained it. This is a great way to script code reviews."

### Step 1.3 -- Permission modes

Devin CLI has 4 permission modes that control how much it can do without asking:

| Mode | Command | Behavior |
| --- | --- | --- |
| **Normal** (default) | `/normal` | Auto-approves read-only tools; asks before writes/shell commands |
| **Accept Edits** | `/accept-edits` | Auto-approves file edits; still prompts for shell commands. *Most people live here.* |
| **Bypass** | `/bypass` | Auto-approves everything (admin org rules still apply) |
| **Autonomous** | `devin --sandbox --permission-mode autonomous` | Unattended execution inside an OS-level sandbox |

**Try it:** switch to Accept Edits mode and ask Devin to make a tiny change:

```
/accept-edits
```

```
Add a one-line comment to the top of the README explaining what this repo is.
```

> **What to point out:** Devin edits `README.md` directly without asking permission. It might add something like:
> ```
> <!-- AngularJS 1.x dashboard framework for building persistent, draggable, resizable widget layouts -->
> ```
> But if it needed to run a shell command (like `gulp build`), it would still prompt.

### Step 1.4 -- Agent modes & essential commands

Walk through these commands briefly:

- `/plan` -- planning mode: Devin proposes a plan before touching code
- `/ask` -- ask mode: Q&A about your code, no changes
- `/compact` -- compact the conversation when it gets long
  - Run `/context` before running `/compact` and then `/context` again after to show the context window shrinking
- `/update` -- update the CLI
- `/model` -- select model
- `/mode` -- see modes (switch between modes with Shift + Tab)

**Try it -- Plan mode:**

```
/plan
```

```
How would you add a "locked widget" feature that prevents individual widgets from being moved or resized?
```

> **Expected response:**
> Devin creates a multi-step plan referencing actual files in the repo, such as:
> 1. Add a `locked` property to `WidgetModel.js` (default: `false`)
> 2. Conditionally disable the jQuery UI Sortable handle in `dashboard.html` when `widget.locked` is `true`
> 3. Hide the resize handles (`widget-w-resizer`, `widget-e-resizer`, etc.) via `ng-if="!widget.locked"`
> 4. Add a lock/unlock toggle icon next to the cog in the widget header
> 5. Persist the `locked` state by adding it to the `serialize()` method in `WidgetModel.js`

> **Narrator:** "Plan mode is great for thinking through a feature before writing any code. It references real files and real code -- `WidgetModel.js`, `dashboard.html`, the `serialize()` method -- so you know the plan is grounded in the actual codebase."

**Checkpoint:** You've run a preloaded prompt, made an edit in Accept Edits mode, and generated a plan in Plan mode.

---

# Part 2 -- AGENTS.md & Skills (12 min)

> **You won't write these from scratch.** Copy the provided files below into your repo, then we'll walk through the structure of what makes a good one.

### Where these files live

```
angular-1.x-dashboard/
|-- AGENTS.md                      <-- repo root (also discovered in subdirectories
|                                     and parent dirs up to the git root)
|-- .devin/
|   +-- skills/
|       +-- pre-pr-check/          <-- directory name = skill name = /slash-command
|           +-- SKILL.md           <-- the skill file (committed, shared with team)
+-- src/ ...
```

For skills you want available in **every** project (personal, not committed to git):

```
# macOS / Linux
~/.config/devin/skills/<skill-name>/SKILL.md

# Windows
%APPDATA%\devin\skills\<skill-name>\SKILL.md
```

Key rules:

- `AGENTS.md` goes at the **repo root** (case-insensitive; `agents.md` works too). You can add additional ones in subdirectories for area-specific guidance.
- Each skill is a **directory** containing a `SKILL.md` file -- the directory name is the skill's identifier and its slash command (`.devin/skills/pre-pr-check/SKILL.md` -> `/pre-pr-check`).
- Project skills (`.devin/skills/`) are committed to git so the whole team shares them; user skills (`~/.config/devin/skills/`) are personal.

### Step 2.1 -- Add the provided AGENTS.md

> **Narrator:** "AGENTS.md is a 'README for agents' -- an open standard (https://agents.md) that gives the agent persistent context about your repo. Devin CLI automatically discovers AGENTS.md files in your workspace. Let's walk through building one together for the angular-dashboard project."

Encourage participants to create their own as they follow along.

Ask Devin to add the following to your repo, or copy this file to the **root of your repo** as `AGENTS.md`:

```markdown
# AGENTS.md

## Project overview
An AngularJS 1.x directive library (`ui.dashboard` module) for building persistent, draggable,
resizable widget dashboards. Uses jQuery UI Sortable for drag-and-drop and Angular UI Bootstrap
for modals/settings. Built with Gulp, tested with Karma + Jasmine.

## Commands
- Install:     `npm install && bower install`
- Build:       `gulp` (runs clean, lint, test, concat, copy)
- Dev server:  `bower install && gulp build:demo && gulp serve` (runs on http://localhost:3000)
- Lint:        `gulp jshint` -- ALWAYS run before committing
- Unit tests:  `gulp test` (Karma + Jasmine + PhantomJS)
- E2E tests:   `gulp protractor` (Protractor)

## Code conventions
- All source lives under `src/components/` (framework) and `src/app/` (demo application)
- Directive files follow the pattern: `<name>.js` + `<name>.spec.js` + optional `<name>.html`
- Use AngularJS 1.x patterns: `.directive()`, `.factory()`, `.controller()` -- no ES6 classes
- Widget definitions (WDOs) are plain objects with `name`, `directive`, `templateUrl`, `dataModelType`
- Data models extend `WidgetDataModel` via prototypal inheritance (`Object.create`)
- Follow `.jshintrc` rules: camelCase, single quotes, strict mode, 2-space indent
- Prepend the Apache 2.0 license header to all new `.js` files (see CONTRIBUTING.md)

## Architecture
- `dashboard.js` -- core directive; manages widget lifecycle (add/remove/save/load)
- `WidgetModel.js` -- instance model; handles sizing, styling, serialization
- `WidgetDataModel.js` -- base class for data sources (extend with `init()` and `destroy()`)
- `DashboardState.js` -- persistence layer; serializes/deserializes to any storage backend
- `LayoutStorage.js` -- multi-layout manager; switches between dashboard configurations
- `widget.js` -- widget directive; wires up dataModel, compiles template, emits lifecycle events

## Boundaries
- Never modify files in `dist/` directly -- they are generated by `gulp build`
- Don't change `bower.json` dependencies without team discussion
- Don't remove the Apache 2.0 license headers from existing files
- Keep `template/*.html` partials minimal -- logic belongs in directives, not templates
```

**Anatomy of a good AGENTS.md** (walk through together):

1. **Project overview** -- one or two lines so the agent orients instantly. Not a sales pitch. Here we specify the module name (`ui.dashboard`), the tech stack, and the build tool.
2. **Commands** -- the exact commands for build/lint/test. This is the highest-value section: the agent stops guessing and starts running `gulp test` instead of `npm test`.
3. **Code conventions** -- concrete, checkable rules ("extend `WidgetDataModel` via prototypal inheritance", "2-space indent"), not vague principles ("write clean code").
4. **Architecture** -- a quick map of the key files so the agent knows where to look. This is especially valuable in a framework repo where the naming isn't always obvious.
5. **Boundaries** -- explicit "never touch X" rules. "Never modify `dist/`" prevents the agent from editing generated files.

**Anti-patterns:** walls of prose, duplicating the entire README, vague rules the agent can't act on, stale commands.

**Try it:** restart `devin` in the repo and ask:

```
What conventions should I follow when adding a new widget data model to this repo?
```

> **Expected response:**
> Devin reflects your AGENTS.md back, mentioning:
> - Extend `WidgetDataModel` via `Object.create(WidgetDataModel.prototype)`
> - Implement `init()` for setup (subscriptions, intervals) and `destroy()` for cleanup
> - Follow the `RandomDataModel` pattern in `src/app/dataModel.js`
> - Use camelCase, single quotes, strict mode, 2-space indent per `.jshintrc`
> - Add Apache 2.0 license header per `CONTRIBUTING.md`

### Step 2.2 -- Add the provided Skill

> **Narrator:** "Skills are reusable, model-invoked procedures stored as SKILL.md files. They become slash commands in the CLI. Let's create one that runs a quality gate before every PR."

Skills are discovered in:

```
.devin/skills/<skill-name>/SKILL.md     # project scope (committed to git)
~/.config/devin/skills/<skill-name>/    # user scope (all projects, not committed)
```

Create `.devin/skills/pre-pr-check/SKILL.md` with this content:

```markdown
---
name: pre-pr-check
description: Run the full pre-PR quality gate -- lint, build, tests, and a
  self-review of the diff. Use before creating or updating any pull request.
---

# Pre-PR Quality Gate

Follow these steps in order. Do not skip steps.

1. Run `gulp jshint` and fix any lint errors.
2. Run `gulp test` (which runs jshint + template cache + Karma unit tests) and ensure all tests pass.
3. Run `gulp` (full default build) to verify concat, copy, and dist generation succeed.
4. Review your own diff with `git diff` and check:
   - No debug statements (`console.log`, `debugger`) left behind
   - No commented-out code
   - All new `.js` files have the Apache 2.0 license header
   - Variables use camelCase; strings use single quotes
   - `WidgetDataModel` subclasses implement both `init()` and `destroy()`
   - No direct edits to files in `dist/` (these are generated)
5. Summarize what was checked and the results before proceeding.
```

**Anatomy of a good SKILL.md** (walk through together):

1. **Frontmatter `name`** -- matches the directory name; this becomes the `/pre-pr-check` slash command.
2. **Frontmatter `description`** -- this is how the agent decides *when* to invoke the skill automatically. Write it like a trigger condition: what it does + when to use it.
3. **Body** -- an explicit, ordered checklist. Skills are procedures, not essays. Number the steps; say "do not skip steps." Notice how the checks reference specific tools from our AGENTS.md (`gulp jshint`, `gulp test`) and specific conventions (Apache header, camelCase, `init()`/`destroy()` pattern).
4. **Scope it right** -- repo-specific procedures go in `.devin/skills/` (committed, shared with the team); personal habits go in `~/.config/devin/skills/`.

**Try it:**

```
/pre-pr-check
```

> **What to expect:** Devin runs each step sequentially:
> 1. Executes `gulp jshint` -- you see the linter output in the terminal
> 2. Executes `gulp test` -- Karma runs the test suite
> 3. Executes `gulp` -- full build pipeline
> 4. Runs `git diff` and audits the diff against the checklist
> 5. Prints a summary table of results

Or invoke it implicitly -- ask Devin to "get this branch ready for a PR" and watch it pick up the skill on its own.

> **Narrator:** "Highlight to the group that skills can be directly invoked with a slash command, but Devin can also invoke them automatically based on the description. If you ask 'prepare this for a PR,' it matches the description and runs the skill without you explicitly calling it."

**Checkpoint:** Devin answers using your AGENTS.md conventions, and `/pre-pr-check` runs your skill.

---

# Part 3 -- MCP Connection (6 min)

> **Narrator:** "MCP -- Model Context Protocol -- lets you give Devin extra tools. Think issue trackers, databases, documentation APIs. We'll connect DeepWiki, a free MCP server that indexes public GitHub repos."

MCP servers give the agent extra tools -- issue trackers, databases, internal APIs.

### Step 3.1 -- Add an MCP server

The fastest way is using the CLI command. For this example we'll use the DeepWiki MCP -- a free remote MCP server that does not require authentication (note: it only works on public repos).

```bash
devin mcp add deepwiki https://mcp.deepwiki.com/mcp
```

This creates a config entry:

```json
{
  "mcpServers": {
    "deepwiki": {
      "serverUrl": "https://mcp.deepwiki.com/mcp"
    }
  }
}
```

Config scopes (where the server definition lives):

| Scope | File | Shared? |
| --- | --- | --- |
| local (default) | `.devin/config.local.json` | No (gitignored -- put tokens here) |
| project | `.devin/config.json` | Yes (committed, shared with team) |
| user | `~/.config/devin/config.json` | No (all your projects) |

To save to project scope (so teammates get it too):

```bash
devin mcp add deepwiki https://mcp.deepwiki.com/mcp -s project
```

### Step 3.2 -- Use the tools

Start `devin` and ask:

```
What MCP servers and tools do you have available? Use one of the DeepWiki MCP tools.
```

> **Note:** If the `angular-1.x-dashboard` repo is not indexed in DeepWiki (it's private), use a publicly available repo to illustrate how the MCP works:

```
Use the DeepWiki MCP to look up the architecture of https://github.com/nicknisi/dotfiles
and summarize how the Neovim configuration is structured.
```

Or use any popular public repo:

```
Use DeepWiki to explain the plugin system of https://github.com/public-apis/public-apis
```

> **Narrator:** "The key takeaway here is that MCP makes Devin extensible. Your team can connect Jira, Confluence, Datadog, PagerDuty -- anything with an MCP server -- and Devin can use those tools directly in the CLI."

---

# Part 4 -- Handoff to Cloud Devin (10 min)

> **Narrator:** "When a task outgrows your laptop -- long-running builds, CI debugging, or you just want to step away -- hand the session off to a cloud Devin. The cloud session picks up your conversation context and git branch."

### Step 4.1 -- Hand off a task

Inside a CLI session (with context built up from the earlier exercises), give Devin a meaningful task to hand off:

```
/handoff implement the locked widget feature you planned earlier and open a PR
```

> **What happens:**
> The CLI packages up your **conversation context and current git branch**, then creates a cloud Devin session that picks up exactly where you left off. Devin cloud will:
> 1. Add the `locked` property to `WidgetModel.js`
> 2. Update `dashboard.html` to conditionally hide resize handles and sortable grips
> 3. Add the lock toggle to the widget header
> 4. Include `locked` in the `serialize()` method for persistence
> 5. Run the pre-PR quality gate (it picks up the skill automatically)
> 6. Open a pull request

**Tip:** `/handoff` with no task description just continues the current work in the cloud.

Make sure you `/handoff` to an org that has the same repo set up.

### Step 4.2 -- Track the session

- Watch progress **directly in the terminal**, or
- Open the session in the **Devin web app** (https://app.devin.ai) -- the CLI prints the session link

> **Narrator:** "This is the core workflow loop: **explore and steer locally, delegate long-running work to the cloud, review the PR when it's done.** You stay productive while Devin handles the grunt work."

**Checkpoint:** You have a cloud session running and can see it at app.devin.ai.

---

# Q&A (10 min)

Common discussion topics:

- **When local vs. cloud?** Local for tight iteration, code exploration, and plan mode. Cloud for long tasks, parallel work, and anything you want to walk away from.
- **Team rollout:** Commit `AGENTS.md` and `.devin/skills/` to your repos so every teammate's agent behaves consistently. Use `-s project` for shared MCP servers (no tokens in committed config!).
- **Safety:** Bypass mode never overrides org-level admin rules; use `--sandbox` for unattended runs.
- **This repo specifically:** The `angular-1.x-dashboard` is a great candidate for Devin because it has a clear directive/model separation, well-defined widget definitions (WDOs), and a `serialize()` pattern that makes new features follow predictable steps.

---

# Quick-Reference Cheat Sheet

| What | Command / File |
| --- | --- |
| Install CLI | `curl -fsSL https://cli.devin.ai/install.sh \| bash` |
| Start session | `devin` |
| Help | `/help` |
| Permission: accept edits | `/accept-edits` |
| Permission: bypass | `/bypass` |
| Plan mode | `/plan` |
| Ask mode (no changes) | `/ask` |
| Context window | `/context` |
| Compact context | `/compact` |
| Run a skill | `/<skill-name>` |
| Add MCP server | `devin mcp add <name> <url>` |
| Hand off to cloud | `/handoff <task description>` |
| Exit | `/exit` or `Ctrl+C` twice |

---

# Code Examples Reference

Below are the key files from `angular-1.x-dashboard` referenced in this demo, with brief descriptions:

| File | What it does |
| --- | --- |
| `src/components/directives/dashboard/dashboard.js` | Core dashboard directive -- widget lifecycle (add, remove, save, load), sortable config, modal settings |
| `src/components/models/WidgetModel.js` | Widget instance model -- sizing (`setWidth`, `setHeight`), styling, `serialize()` for persistence |
| `src/components/models/WidgetDataModel.js` | Base class for data sources -- `setup()`, `init()`, `destroy()` lifecycle hooks |
| `src/components/models/DashboardState.js` | Persistence layer -- save/load widget state to any storage backend (sync or async) |
| `src/components/models/LayoutStorage.js` | Multi-layout manager -- switch between dashboard configurations, serialize layouts |
| `src/components/directives/widget/widget.js` | Widget directive -- wires up `dataModelType`, compiles templates, emits `widgetAdded` events |
| `src/app/demo.js` | Demo controller -- defines `widgetDefinitions` (random, time, datamodel, resizable, fluid) and `defaultWidgets` |
| `src/app/dataModel.js` | `RandomDataModel` -- example data model extending `WidgetDataModel` with `$interval`-based updates |
| `src/app/directives.js` | Demo widget directives -- `wt-time` (clock), `wt-scope-watch` (value display), `wt-fluid` (resize-aware) |
| `src/app/layouts.js` | Multi-layout demo controllers -- `LayoutsDemoCtrl` with 3 tabs and locked default layouts |
| `src/app/customWidgetSettings.js` | Custom settings demo -- per-widget modal overrides, configurable `RandomDataModel` limit |
| `src/app/cartDataModel.js` | Shopping cart data model -- `addItem`, `removeItem`, `processItems` with price tracking |
| `src/components/directives/dashboard/dashboard.html` | Dashboard template -- widget buttons, sortable area, resize handles, header with cog/close/collapse |

---

# Further Reading

- Devin CLI Quickstart: https://docs.devin.ai/cli
- Essential commands: https://docs.devin.ai/cli/essential-commands
- Skills overview: https://docs.devin.ai/cli/extensibility/skills/overview
- MCP configuration: https://docs.devin.ai/cli/extensibility/mcp/configuration
- AGENTS.md standard: https://agents.md
- Troubleshooting: https://docs.devin.ai/cli/troubleshooting
