#!/usr/bin/env node

// Add basic error handling

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { RequestPayloadSchema } from "./types.js";

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

const server = new Server(
  {
    name: "mcp-probot-hdi",
    version: "0.0.1",
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
        name: "drug_interaction",
        description:
          "Checks drug-drug or herb-drug interactions/combination usages between two drugs or herbs",
        inputSchema: {
          type: "object",
          properties: {
            drug1: {
              type: "string",
              description: "First drug name or herb name (required)",
            },
            drug2: {
              type: "string",
              description: "Second drug name or herb name (optional)",
            },
          },
          required: ["drug1"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const validatedArgs = RequestPayloadSchema.parse(args);

  if (request.params.name === "drug_interaction") {
    const apiKey = process.env.PROBOT_API_KEY;
    if (!apiKey) {
      return {
        content: [
          {
            type: "text",
            text: "PROBOT_API_KEY environment variable is not set",
          },
        ],
        isError: true,
      };
    }

    const response = await fetch("https://db.drugsea.cn/api2/g/mcp/probot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(validatedArgs),
    });

    const data = await response.json();
    const { api_status, content } = data;
    if (!api_status) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(content) }],
      isError: false,
    };
  }
  throw new Error("Tool not found");
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
