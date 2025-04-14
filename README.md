# mcp-probot-hdi

A CLI tool for checking drug-drug and herb-drug interactions using the Model Context Protocol.

## Installation

```bash
npm install -g mcp-probot-hdi
```

## Configuration

Before using the tool, you need to set your API key as an environment variable:

```bash
export PROBOT_API_KEY=your_api_key_here
```

## Usage

This tool provides a Model Context Protocol interface for checking drug interactions. It can be used with any MCP-compatible client.

The tool provides the following capabilities:

### drug_interaction

Checks interactions between drugs and/or herbs.

Parameters:

- `drug1`: (Required) First drug or herb name
- `drug2`: (Optional) Second drug or herb name

## Requirements

- Node.js >= 18.0.0
- Valid PROBOT_API_KEY environment variable

## License

MIT
