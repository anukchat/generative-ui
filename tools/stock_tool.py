import os
from typing import Dict, Any, Optional
from langchain_core.tools import tool
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment variables
API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "demo")

@tool
def get_stock_info(symbol: str) -> Dict[str, Any]:
    """
    Get current stock information for a given stock symbol.
    
    Args:
        symbol: The stock symbol to look up (e.g., AAPL for Apple Inc.)
        
    Returns:
        A dictionary containing stock information including symbol, price, change, and percent change.
    """
    try:
        # Use Alpha Vantage API to get stock data
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={API_KEY}"
        response = requests.get(url)
        data = response.json()
        
        # Check if we have valid data
        if "Global Quote" in data and data["Global Quote"]:
            quote = data["Global Quote"]
            
            # Extract relevant information
            price = float(quote.get("05. price", 0))
            change = float(quote.get("09. change", 0))
            percent_change = quote.get("10. change percent", "0%")
            
            # Create response with UI component data
            result = {
                "symbol": symbol.upper(),
                "price": price,
                "change": change,
                "percent_change": percent_change,
                "last_trading_day": quote.get("07. latest trading day", ""),
                "ui_component": {
                    "type": "stock_chart",
                    "data": {
                        "symbol": symbol.upper(),
                        "price": price,
                        "change": change,
                        "percent_change": percent_change
                    }
                }
            }
            
            return result
        else:
            # If we don't have data, return an error message
            return {
                "error": f"Could not retrieve stock information for {symbol}",
                "details": data.get("Note", "No additional information available.")
            }
    
    except Exception as e:
        return {"error": f"Error retrieving stock information: {str(e)}"}
