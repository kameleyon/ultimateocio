# UltimateOcio MCP Server

This project implements a Model Context Protocol (MCP) server that provides various tools for assisting AI models like Claude.

## Key Components

- **MCP Server**: Runs on NodeJS and communicates with Claude via standard input/output
- **Tool Registry**: Provides functionality through registered tools
- **Filesystem Tools**: Allows Claude to interact with files and directories

## Filesystem Tools

The MCP server includes the following filesystem tools:

1. **directory-manager**: Create, list, and get tree representation of directories
2. **file-reader**: Read single or multiple files
3. **file-writer**: Write content to files
4. **file-info**: Get detailed metadata about files and directories
5. **file-mover**: Move or rename files and directories
6. **file-searcher**: Search for files using patterns
7. **file-editor**: Edit files with pattern matching and replacements

## Security Measures

The project includes security measures for filesystem operations:

- **Path Validation**: Ensures all paths are within allowed directories
- **Path Resolution**: Normalizes paths and prevents directory traversal attacks
- **Existence Checks**: Verifies paths exist before attempting operations

## Debug Features

The server includes several debugging features:

- **Debug Mode**: Enables detailed logging of tool execution
- **Request/Response Logging**: Captures all incoming and outgoing messages
- **Error Handling**: Provides detailed error messages without crashing

## Implementation Details

- Uses the official MCP SDK (`@modelcontextprotocol/sdk`)
- All tools implement a standard interface with `execute` method
- Filesystem tools use the `pathUtils` utility for secure path handling

## Project Structure

```
ultimateocio/
├── src/
│   ├── main.ts                  # Entry point and SDK-based MCP server
│   ├── mcp/                     # Core MCP implementation
│   ├── tools/                   # Tool implementations
│   │   └── code-tools/          # Individual tools
│   │       ├── directory-manager.ts
│   │       ├── file-reader.ts
│   │       ├── file-writer.ts
│   │       ├── file-info.ts
│   │       ├── file-mover.ts
│   │       ├── file-searcher.ts
│   │       └── file-editor.ts
│   └── utils/
│       └── pathUtils.ts         # Path validation utilities
└── docs/
    └── fixDirAccess.md          # Documentation on directory access fixes
```

## Running the Server

To start the server:

```bash
npm run build
npm run start
```

This initializes the MCP Server and registers all tools, including the filesystem tools.
