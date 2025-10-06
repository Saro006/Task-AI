# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# from pydantic_settings import BaseSettings
# import os

# class Settings(BaseSettings):
#     database_url: str = "sqlite:///./taskdb.db"
#     google_api_key: str = "AIzaSyCmLoACE4fOq1Ab1u73ntNpH79gXKFFsuY"
    
#     class Config:
#         env_file = ".env"

# settings = Settings()

# # Create database engine
# engine = create_engine(settings.database_url)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = declarative_base()

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str  # will be read from env, no default
    google_api_key: str | None = None  # optional, can also be loaded from env

    class Config:
        env_file = ".env"


settings = Settings()

# Create database engine (PostgreSQL)
engine = create_engine(settings.database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
