import { useState, useEffect, useCallback } from "react";

interface ETHPriceData {
  price: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useETHPrice(): ETHPriceData {
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchETHPrice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Using CoinGecko API (free, no API key required)
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_last_updated_at=true",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.ethereum && data.ethereum.usd) {
        setPrice(data.ethereum.usd);
        setLastUpdated(new Date());
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching ETH price:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch ETH price"
      );
      // Fallback to a reasonable default price if API fails
      setPrice(2765.65);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch price immediately
    fetchETHPrice();

    // Set up interval to fetch price every 30 seconds
    const interval = setInterval(fetchETHPrice, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchETHPrice]);

  return {
    price,
    loading,
    error,
    lastUpdated,
  };
}
