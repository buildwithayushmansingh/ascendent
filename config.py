# config.py — reads settings from the .env file (never hard-code secrets)

import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI', '')
DB_NAME = os.environ.get('DB_NAME', 'ascendent')
SECRET_KEY = os.environ.get('SECRET_KEY', '')
TOKEN_MAX_AGE_DAYS = int(os.environ.get('TOKEN_MAX_AGE_DAYS', '7'))

# The "day" for streaks is decided by the SERVER in this timezone (so nobody can
# cheat by changing their device clock). Use any name from the IANA list.
APP_TIMEZONE = os.environ.get('APP_TIMEZONE', 'Asia/Kolkata')