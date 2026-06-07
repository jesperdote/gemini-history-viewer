# Gemini History Viewer

A web-based viewer for your Gemini CLI history.

## Features
- Browse multiple projects.
- View session history.
- See prompts, model thoughts, tool calls, and responses.
- Modern dark-themed UI.

## How to Run

Ensure you have Docker and Docker Compose installed.

1.  **Run with Docker Compose**:
    ```bash
    docker compose up --build
    ```
2.  **Access the viewer**:
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## Configuration

The application mounts your local Gemini history directory (`~/.gemini/tmp`) into the container. If your history is stored elsewhere, update the `GEMINI_HISTORY_PATH` in the `.env` file.

```env
GEMINI_HISTORY_PATH=/path/to/your/.gemini/tmp
```
