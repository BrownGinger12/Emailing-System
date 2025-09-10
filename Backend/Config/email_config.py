from dotenv import load_dotenv
import os


load_dotenv() 

class Config:
    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_PORT = os.getenv("MAIL_PORT")
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")  # Replace with env var in production
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")      # Replace with env var in production
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_DEFAULT_SENDER = (os.getenv("MAIL_NAME"), os.getenv("MAIL_SENDER"))
    MAIL_DEBUG = True
    DEBUG = True
    MAIL_SUPPRESS_SEND = False
