# config.py — reads settings from the .env file (never hard-code secrets)

import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI', '')
DB_NAME = os.environ.get('DB_NAME', 'ascendent')
SECRET_KEY = os.environ.get('SECRET_KEY', '')
TOKEN_MAX_AGE_DAYS = int(os.environ.get('TOKEN_MAX_AGE_DAYS', '7'))