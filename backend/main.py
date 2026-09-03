from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.market import router as market_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(market_router)


@app.get("/")
def read_root():
    return {"message": "MarketX API is running"}