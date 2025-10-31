# MCP Drug Interaction Tool Usage

## 配置设置

1. 安装包:

```bash
npm install -g @kinginsun/mcp-probot-hdi
```

2. 设置环境变量:

```bash
export PROBOT_API_KEY=your_api_key_here
```

3. 使用 mcpServers 配置文件:

```bash
mcp --servers mcpServers.yaml
```

## 配置文件说明

### mcpServers.yaml

```yaml
version: 1
servers:
  drug-interaction:
    type: stdio
    command:
      args:
        - npx
        - "@kinginsun/mcp-probot-hdi"
      env:
        PROBOT_API_KEY: ${PROBOT_API_KEY}
    capabilities:
      tools:
        drug_interaction:
          description: Checks drug-drug or herb-drug interactions/combination usages between two drugs or herbs
          schema:
            type: object
            properties:
              drug1:
                type: string
                description: First drug name or herb name (required)
              drug2:
                type: string
                description: Second drug name or herb name (optional)
            required:
              - drug1
```

## 示例请求

### 列出可用工具

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "listTools",
  "params": {}
}
```

### 查询药物相互作用

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "callTool",
  "params": {
    "name": "drug_interaction",
    "arguments": {
      "drug1": "aspirin",
      "drug2": "warfarin"
    }
  }
}
```

## 使用方式

1. 通过 MCP 客户端:

```bash
mcp --servers mcpServers.yaml
```

2. 直接通过管道运行:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"listTools","params":{}}' | PROBOT_API_KEY=your_api_key_here npx @kinginsun/mcp-probot-hdi
```

## 注意事项

1. 确保已全局安装 @kinginsun/mcp-probot-hdi 包
2. 确保环境变量 PROBOT_API_KEY 已正确设置
3. 工具支持药物-药物和草药-药物相互作用查询
4. YAML 格式相比 JSON 更易读，但要注意保持正确的缩进
