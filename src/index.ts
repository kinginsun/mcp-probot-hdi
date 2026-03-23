#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  HdiByNameSchema,
  SearchItemSchema,
  HdiByIdSchema,
} from "./types.js";

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

const API_BASE = "https://db.drugsea.cn/api2/g/mcp";

function getApiKey(): string {
  const apiKey = process.env.PROBOT_API_KEY;
  if (!apiKey) {
    throw new Error("PROBOT_API_KEY environment variable is not set");
  }
  return apiKey;
}

async function callApi(endpoint: string, body: Record<string, unknown>) {
  const apiKey = getApiKey();
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

const server = new Server(
  {
    name: "mcp-probot-hdi",
    version: "0.0.6",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "probot-hdi",
        description:
          "Search herb-drug or drug-drug interactions by drug/herb names. " +
          "Each drug parameter accepts a single name or multiple aliases separated by '|' " +
          '(e.g. "aspirin|阿司匹林|乙酰水杨酸"). ' +
          "drug1 is required, drug2 is optional. When only drug1 is provided, returns all known interactions for that drug/herb.",
        inputSchema: {
          type: "object",
          properties: {
            drug1: {
              type: "string",
              description:
                'First drug/herb name, or multiple aliases separated by "|" (e.g. "aspirin|阿司匹林")',
            },
            drug2: {
              type: "string",
              description:
                'Second drug/herb name, or multiple aliases separated by "|" (optional)',
            },
            maxRows: {
              type: "number",
              description:
                "Maximum number of interaction results to return (default: 10)",
            },
          },
          required: ["drug1"],
        },
      },
      {
        name: "probot-search-item",
        description:
          "Look up a drug or herb in the Probot database by name and return its item_id. " +
          "Use this to resolve a drug/herb name to its unique identifier before querying interactions by ID.",
        inputSchema: {
          type: "object",
          properties: {
            drug: {
              type: "string",
              description:
                'Drug or herb name to search for, or multiple aliases separated by "|" (e.g. "aspirin|阿司匹林")',
            },
          },
          required: ["drug"],
        },
      },
      {
        name: "probot-hdi-by-id",
        description:
          "Search herb-drug or drug-drug interactions by item_id(s). " +
          "Use item_id obtained from probot-search-item. " +
          "item_id1 is required, item_id2 is optional. When only item_id1 is provided, returns all known interactions for that item.",
        inputSchema: {
          type: "object",
          properties: {
            item_id1: {
              type: "string",
              description: "First item_id (obtained from probot-search-item)",
            },
            item_id2: {
              type: "string",
              description: "Second item_id (optional)",
            },
            maxRows: {
              type: "number",
              description:
                "Maximum number of interaction results to return (default: 10)",
            },
          },
          required: ["item_id1"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "probot-hdi": {
        const validated = HdiByNameSchema.parse(args);
        const data = await callApi("probot", validated);
        if (!data.api_status) {
          return {
            content: [{ type: "text", text: JSON.stringify(data) }],
            isError: true,
          };
        }
        return {
          content: [{ type: "text", text: JSON.stringify(data.content) }],
          isError: false,
        };
      }

      case "probot-search-item": {
        const validated = SearchItemSchema.parse(args);
        const data = await callApi("probot/search", validated);
        if (!data.api_status) {
          return {
            content: [{ type: "text", text: JSON.stringify(data) }],
            isError: true,
          };
        }
        return {
          content: [{ type: "text", text: JSON.stringify(data.content) }],
          isError: false,
        };
      }

      case "probot-hdi-by-id": {
        const validated = HdiByIdSchema.parse(args);
        const data = await callApi("probot/id", validated);
        if (!data.api_status) {
          return {
            content: [{ type: "text", text: JSON.stringify(data) }],
            isError: true,
          };
        }
        return {
          content: [{ type: "text", text: JSON.stringify(data.content) }],
          isError: false,
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: message }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
