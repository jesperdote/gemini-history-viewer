# Gemini History Viewer

A web-based viewer for your Gemini CLI history, supporting both macOS and Ubuntu environments.

## Features
- **Cross-Platform Support**: Works with Gemini CLI installations on both macOS and Ubuntu/Linux.
- **Smart Parsing**: Automatically detects and handles both the newer JSON session format (macOS) and the legacy JSONL format.
- **Project Discovery**: Automatically identifies projects in your Gemini history and filters out internal CLI directories.
- **Rich UI**: Browse multiple projects, view session history, and see model thoughts, tool calls, and responses in a modern dark-themed interface.

## How to Run

Ensure you have Docker and Docker Compose installed.

1.  **Start the viewer**:
    ```bash
    docker compose up --build
    ```
2.  **Access the application**:
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## Configuration

The application is configured to automatically find your Gemini history in the default location (`~/.gemini/tmp`).

### Custom History Path
If your history is stored in a different location, you can override the default by setting the `GEMINI_HISTORY_PATH` environment variable in a `.env` file:

```env
GEMINI_HISTORY_PATH=/your/custom/path/to/.gemini/tmp
```

## Technical Details
- **Frontend**: React + TypeScript + Vite + Tailwind CSS.
- **Backend**: Node.js + Express.
- **Deployment**: Dockerized for consistent performance across platforms, utilizing lightweight Alpine images.
