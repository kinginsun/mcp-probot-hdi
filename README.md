# mcp-probot-hdi

An MCP (Model Context Protocol) server for querying herb-drug and drug-drug interactions from the [Probot HDI database](https://cancer.probot.hk).

## Installation

```bash
npm install -g @kinginsun/mcp-probot-hdi
```

## Configuration

Set your API key as an environment variable:

```bash
export PROBOT_API_KEY=your_api_key_here
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
        "PROBOT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Tools

### `probot-hdi`

Search herb-drug or drug-drug interactions by drug/herb names.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `drug1` | string | Yes | Drug/herb name, or multiple aliases separated by `\|` (e.g. `"aspirin\|阿司匹林\|乙酰水杨酸"`) |
| `drug2` | string | No | Second drug/herb name, supports `\|` separated aliases |
| `maxRows` | number | No | Maximum results to return (default: 10) |

**Example:**

```json
{
  "name": "probot-hdi",
  "arguments": {
    "drug1": "aspirin",
    "drug2": "ginkgo biloba"
  }
}
```

### `probot-search-item`

Look up a drug or herb by name and return its `item_id`. Use this to resolve drug/herb names to unique identifiers before querying interactions by ID.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `drug` | string | Yes | Drug/herb name, or multiple aliases separated by `\|` |

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

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `item_id1` | string | Yes | First item_id |
| `item_id2` | string | No | Second item_id |
| `maxRows` | number | No | Maximum results to return (default: 10) |

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
- Valid `PROBOT_API_KEY` environment variable

## License

MIT
