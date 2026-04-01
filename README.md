# mcp-probot-hdi

An MCP (Model Context Protocol) server for querying herb-drug and drug-drug interactions from the [Probot HDI database](https://cancer.probot.hk).

The server speaks MCP over stdio and forwards tool calls to the Cancer Probot **HTTP MCP API** (`POST` with JSON body and `Authorization: Bearer`).

## Installation

```bash
npm install -g @kinginsun/mcp-probot-hdi
```

## Configuration

### Token (required)

Create a **personal API token** in your Cancer Probot account (user center). The plaintext value starts with `pb-` and is shown only once when created.

Set it via:

```bash
export PROBOT_MCP_TOKEN=pb-your_token_here
```

The server sends this value as the HTTP header `Authorization: Bearer <token>`. Tokens must start with `pb-`; other values are rejected at startup.

### API base URL (optional)

By default requests go to `https://cancer.probot.hk/probot_api/mcp` (no trailing slash). Override if you need another deployment:

```bash
export PROBOT_HDI_API_BASE=https://example.com/probot_api/mcp
```

### Cursor / Claude Desktop

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "probot-hdi": {
      "command": "npx",
      "args": ["@kinginsun/mcp-probot-hdi"],
      "env": {
        "PROBOT_MCP_TOKEN": "pb-your_token_here"
      }
    }
  }
}
```

## Tools

### `probot-hdi`

Search herb-drug or drug-drug interactions by drug/herb names.

| Parameter | Type   | Required | Description                                                                                   |
| --------- | ------ | -------- | --------------------------------------------------------------------------------------------- |
| `drug1`   | string | Yes      | Drug/herb name, or multiple aliases in one string separated by ASCII `\|` (see JSON examples) |
| `drug2`   | string | No       | Second drug/herb; same pipe-separated alias convention                                        |
| `maxRows` | number | No       | Maximum results to return (default: 10)                                                       |

When only `drug1` is provided, the API returns all known interactions involving that item (up to `maxRows`).

**Example:**

```json
{
  "name": "probot-hdi",
  "arguments": {
    "drug1": "aspirin|阿司匹林|乙酰水杨酸",
    "drug2": "ginkgo biloba"
  }
}
```

### `probot-search-item`

Look up a drug or herb by name and return its `item_id`. Use this to resolve drug/herb names to unique identifiers before querying interactions by ID.

| Parameter | Type   | Required | Description                                           |
| --------- | ------ | -------- | ----------------------------------------------------- |
| `drug`    | string | Yes      | Drug/herb name, or multiple aliases separated by `\|` |

**Example:**

```json
{
  "name": "probot-search-item",
  "arguments": {
    "drug": "aspirin|阿司匹林"
  }
}
```

### `probot-hdi-by-id`

Search herb-drug or drug-drug interactions by `item_id`(s) obtained from `probot-search-item`.

| Parameter  | Type   | Required | Description                             |
| ---------- | ------ | -------- | --------------------------------------- |
| `item_id1` | string | Yes      | First item_id                           |
| `item_id2` | string | No       | Second item_id                          |
| `maxRows`  | number | No       | Maximum results to return (default: 10) |

When only `item_id1` is provided, the API returns all known interactions for that item (up to `maxRows`).

**Example:**

```json
{
  "name": "probot-hdi-by-id",
  "arguments": {
    "item_id1": "123",
    "item_id2": "456"
  }
}
```

## Typical Workflow

1. **Direct query** — Use `probot-hdi` with drug names for a quick one-step lookup.
2. **Two-step query** — Use `probot-search-item` to resolve names to `item_id`, then use `probot-hdi-by-id` for precise interaction queries. This is useful when you need to verify which drug was matched or reuse the same ID across multiple queries.

## Requirements

- Node.js >= 18.0.0
- A valid personal token (`pb-…`) in `PROBOT_MCP_TOKEN`

## License

MIT
