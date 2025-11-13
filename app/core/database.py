# app/core/database.py
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from typing import AsyncGenerator
from .config import settings

engine = create_async_engine(settings.database_url, echo=True)
async_session_local = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def close_db():
    await engine.dispose()

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_local() as session:
        yield session