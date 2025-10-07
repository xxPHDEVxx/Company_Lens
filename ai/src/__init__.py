from dotenv import load_dotenv
from pathlib import Path

# Load .env from the ai directory (parent of src)
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)