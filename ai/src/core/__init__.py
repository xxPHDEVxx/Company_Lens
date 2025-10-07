from dotenv import load_dotenv
from pathlib import Path
import os

# Load .env from the ai directory (2 levels up from core)
env_dir = Path(__file__).parent.parent.parent
if os.environ.get("environment") == "Production":  # Fixed typo: environmnet -> environment
    load_dotenv(env_dir / ".env.production")
else:
    load_dotenv(env_dir / ".env")