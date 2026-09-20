import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useMonPrice } from "../useMonPrice";

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("useMonPrice hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    (fetch as vi.Mock).mockReset();
  });

  it("returns loading state initially", () => {
    (fetch as vi.Mock).mockImplementation(() => new Promise(() => {}));
    
    const { result } = renderHook(() => useMonPrice());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.monPriceUsd).toBeNull();
  });

  it("fetches price from CoinGecko API", async () => {
    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ monad: { usd: 0.025 } }),
    });

    const { result } = renderHook(() => useMonPrice());

    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.monPriceUsd).toBe(0.025);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.coingecko.com/api/v3/simple/price?ids=monad&vs_currencies=usd"
    );
  });

  it("uses cached price when valid", async () => {
    const cachedData = { usd: 0.03, timestamp: Date.now() };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

    const { result } = renderHook(() => useMonPrice());

    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.monPriceUsd).toBe(0.03);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("falls back to default price on API error", async () => {
    (fetch as vi.Mock).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useMonPrice());

    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.monPriceUsd).toBe(0.025); // fallback price
  });

  it("converts USDT to MON correctly", async () => {
    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ monad: { usd: 0.025 } }),
    });

    const { result } = renderHook(() => useMonPrice());

    await waitFor(() => expect(result.current.loading).toBe(false));
    
    expect(result.current.usdtToMon(30)).toBe("1200");
    expect(result.current.usdtToMon(270)).toBe("10800");
  });

  it("returns dash when price is not available", async () => {
    // Mock fetch to never resolve (simulating no network)
    (fetch as vi.Mock).mockImplementation(() => new Promise(() => {}));
    
    const { result } = renderHook(() => useMonPrice());
    // Wait a tick for the effect to run
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });
    
    // Should still be loading, but usdtToMon should return dash when price is null
    expect(result.current.usdtToMon(100)).toBe("—");
  });
});
