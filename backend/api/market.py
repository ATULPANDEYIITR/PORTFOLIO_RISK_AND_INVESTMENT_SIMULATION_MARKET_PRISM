from fastapi import APIRouter

router = APIRouter(prefix="/api")


# -----------------------------
# MARKET INDICES
# -----------------------------

@router.get("/indices")
def get_indices():
    return [
        {
            "name": "NIFTY 50",
            "exchange": "NSE",
            "value": 24580.35,
            "change": 185.40,
            "change_percent": 0.76,
            "status": "up"
        },
        {
            "name": "SENSEX",
            "exchange": "BSE",
            "value": 80512.18,
            "change": 542.60,
            "change_percent": 0.68,
            "status": "up"
        },
        {
            "name": "NIFTY BANK",
            "exchange": "NSE",
            "value": 52640.25,
            "change": -125.30,
            "change_percent": -0.24,
            "status": "down"
        },
        {
            "name": "NIFTY IT",
            "exchange": "NSE",
            "value": 42180.70,
            "change": 310.25,
            "change_percent": 0.74,
            "status": "up"
        }
    ]


# -----------------------------
# STOCKS
# -----------------------------

@router.get("/stocks")
def get_stocks():
    return [
        {
            "symbol": "RELIANCE",
            "company": "Reliance Industries",
            "exchange": "NSE",
            "price": 2925.40,
            "change": 35.60,
            "change_percent": 1.23,
            "market_cap": "19.80T",
            "sector": "Energy"
        },
        {
            "symbol": "TCS",
            "company": "Tata Consultancy Services",
            "exchange": "NSE",
            "price": 4185.25,
            "change": 42.15,
            "change_percent": 1.02,
            "market_cap": "15.10T",
            "sector": "IT"
        },
        {
            "symbol": "HDFCBANK",
            "company": "HDFC Bank",
            "exchange": "NSE",
            "price": 1742.80,
            "change": -12.40,
            "change_percent": -0.71,
            "market_cap": "13.30T",
            "sector": "Banking"
        },
        {
            "symbol": "INFY",
            "company": "Infosys",
            "exchange": "NSE",
            "price": 1925.60,
            "change": 28.35,
            "change_percent": 1.49,
            "market_cap": "7.90T",
            "sector": "IT"
        },
        {
            "symbol": "ICICIBANK",
            "company": "ICICI Bank",
            "exchange": "NSE",
            "price": 1385.45,
            "change": 18.20,
            "change_percent": 1.33,
            "market_cap": "9.70T",
            "sector": "Banking"
        },
        {
            "symbol": "SBIN",
            "company": "State Bank of India",
            "exchange": "NSE",
            "price": 825.30,
            "change": -4.25,
            "change_percent": -0.51,
            "market_cap": "7.30T",
            "sector": "Banking"
        }
    ]


# -----------------------------
# SECTORS
# -----------------------------

@router.get("/sectors")
def get_sectors():
    return [
        {
            "name": "Information Technology",
            "short_name": "IT",
            "performance": 1.42,
            "status": "up"
        },
        {
            "name": "Banking",
            "short_name": "BANK",
            "performance": -0.35,
            "status": "down"
        },
        {
            "name": "Pharmaceuticals",
            "short_name": "PHARMA",
            "performance": 0.82,
            "status": "up"
        },
        {
            "name": "Automobile",
            "short_name": "AUTO",
            "performance": 1.15,
            "status": "up"
        },
        {
            "name": "Energy",
            "short_name": "ENERGY",
            "performance": 0.64,
            "status": "up"
        },
        {
            "name": "FMCG",
            "short_name": "FMCG",
            "performance": -0.18,
            "status": "down"
        }
    ]


# -----------------------------
# MARKET SUMMARY
# -----------------------------

@router.get("/summary")
def get_market_summary():
    return {
        "market_status": "OPEN",
        "nse": "Active",
        "bse": "Active",
        "indices_trending_up": 3,
        "indices_trending_down": 1,
        "stocks_trending_up": 4,
        "stocks_trending_down": 2
    }


# -----------------------------
# INDIVIDUAL STOCK
# -----------------------------

@router.get("/stocks/{symbol}")
def get_stock(symbol: str):
    stocks = get_stocks()

    for stock in stocks:
        if stock["symbol"].upper() == symbol.upper():
            return stock

    return {
        "error": "Stock not found",
        "symbol": symbol.upper()
    }