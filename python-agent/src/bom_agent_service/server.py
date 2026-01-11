"""Server entry point for running with uv run."""

import os
from pathlib import Path

import uvicorn

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    env_file = Path(__file__).parent.parent.parent.parent / ".env"
    if env_file.exists():
        load_dotenv(env_file)
        print(f"Loaded environment from {env_file}")
except ImportError:
    pass  # dotenv not installed, rely on system env vars


def main():
    """Run the BOM Agent Service API server."""
    print("Starting BOM Agent Service...")
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "bom_agent_service.main:app",
        host="0.0.0.0",
        port=port,
    )


if __name__ == "__main__":
    main()
