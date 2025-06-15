import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import OracleAdapterABI from "../../abi/OracleAdapter.json";

const ORACLE_ADAPTER_ADDRESS =
  "0xb580Bbc11d8Af009D1235E4601CB3B500B2E7da1" as const;

export function useETHPrice() {
  const {
    data: rawPrice,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: ORACLE_ADAPTER_ADDRESS,
    abi: OracleAdapterABI.abi,
    functionName: "getPrice",
    args: ["0x0000000000000000000000000000000000000000"], // address(0) for ETH
  });

  // Format the price to user-friendly string
  const formattedPrice = rawPrice
    ? (() => {
        const priceInEth = formatEther(rawPrice as bigint);
        const priceNumber = parseFloat(priceInEth);

        // Format as currency with no decimal places for round numbers,
        // or 2 decimal places for non-round numbers
        if (priceNumber % 1 === 0) {
          return `$${priceNumber.toLocaleString()}`;
        } else {
          return `$${priceNumber.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        }
      })()
    : "$0";

  const price = rawPrice ? Number(formatEther(rawPrice as bigint)) : 0;

  return {
    price,
    formattedPrice,
    loading: isLoading,
    error,
    refetch,
  };
}
