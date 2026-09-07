# FetchRelay agent skill

Install the public skill into a supported agent using the open-source skills CLI:

```sh
npx skills add JAIPilot/fetchrelay-integrations --skill fetchrelay
```

Review the selected files and installation location before accepting the CLI prompt. This is an instruction package plus a self-contained Node.js helper, not an MCP registry entry or a separately hosted API. It does not need access to Google Drive.

Set `FETCHRELAY_API_KEY` in your agent's server-side environment. Never include the key in prompts or public configuration. Ask the agent to use FetchRelay to extract a specific public page, inspect warnings and keep the source URL. For a crawl, specify the intended scope and credit budget.

[Read the skill](fetchrelay/SKILL.md) before installing. [Create a key](https://fetchrelay.com/account). [API reference](https://fetchrelay.com/docs/api).

skills.sh discovers skills through real CLI installations. A published GitHub package and a successful install test do not guarantee a directory listing or ranking. Release QA disables installation telemetry so test installs are not presented as adoption.
