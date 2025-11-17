# app/api/routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.scrapers.indeed import IndeedScraper
from app.services.job_ingestion import ingest_scraped_jobs

router = APIRouter(prefix="/scrape", tags=["scraping"])

@router.post("/indeed")
async def scrape_indeed(query: str, location: str | None = None, 
                        session: AsyncSession = Depends(get_session)):
    scraper = IndeedScraper()
    results = await scraper.search(query=query, location=location)
    inserted = await ingest_scraped_jobs(results, session)
    return {"found": len(results),"inserted": inserted}