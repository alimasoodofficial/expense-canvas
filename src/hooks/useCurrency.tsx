import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Currency = "PKR" | "USD" | "EUR" | "GBP" | "SAR" | "AED" | "AUD";

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatAmount: (amount: number, fromCurrency?: string) => string;
    convertAmount: (amount: number, fromCurrency?: string, toCurrency?: string) => number;
    exchangeRates: Record<Currency, number>;
    loading: boolean;
    lastUpdated: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const BASE_CURRENCY: Currency = "PKR";

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const [currency, setCurrency] = useState<Currency>(() => (localStorage.getItem("app_currency") as Currency) || "PKR");
    const [rates, setRates] = useState<Record<Currency, number>>({
        PKR: 1,
        USD: 0.00360,
        EUR: 0.00336,
        GBP: 0.00282,
        SAR: 0.0135,
        AED: 0.0132,
        AUD: 0.0055,
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem("app_currency", currency);
    }, [currency]);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                setLoading(true);
                const response = await fetch(`https://open.er-api.com/v6/latest/PKR`);
                const data = await response.json();

                if (data.result === "success") {
                    setRates({
                        PKR: 1,
                        USD: data.rates.USD,
                        EUR: data.rates.EUR,
                        GBP: data.rates.GBP,
                        SAR: data.rates.SAR,
                        AED: data.rates.AED,
                        AUD: data.rates.AUD,
                    });
                    setLastUpdated(new Date().toLocaleTimeString());
                }
            } catch (error) {
                console.error("Failed to fetch exchange rates:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
        const interval = setInterval(fetchRates, 3600000); // Update every hour
        return () => clearInterval(interval);
    }, []);

    const convertAmount = (amount: number, fromCurrency = "PKR", toCurrency = currency) => {
        if (!rates[fromCurrency as Currency] || !rates[toCurrency as Currency]) return amount;
        const amountInBase = amount / rates[fromCurrency as Currency];
        return amountInBase * rates[toCurrency as Currency];
    };

    const formatAmount = (amount: number, fromCurrency = "PKR") => {
        const convertedAmount = convertAmount(amount, fromCurrency, currency);
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(convertedAmount);
    };

    return (
        <CurrencyContext.Provider value={{
            currency, setCurrency,
            formatAmount, convertAmount,
            exchangeRates: rates, loading, lastUpdated
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
    return context;
};
