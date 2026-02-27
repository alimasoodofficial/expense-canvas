import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Currency = "PKR" | "USD" | "EUR" | "GBP";

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatAmount: (amount: number, fromCurrency?: string) => string;
    convertAmount: (amount: number, fromCurrency?: string, toCurrency?: string) => number;
    exchangeRates: Record<Currency, number>;
    loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// We assume database values are stored in a base currency (e.g., PKR or USD).
// For this implementation, we'll assume the DB stores in USD-equivalent values
// and we convert to the display currency. Or if DB is PKR, we convert from PKR.
// Let's assume the "true" value in DB is PKR as per users preference for default.
const BASE_CURRENCY: Currency = "PKR";

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const [currency, setCurrency] = useState<Currency>("PKR");
    const [rates, setRates] = useState<Record<Currency, number>>({
        PKR: 1,
        USD: 0.0036, // Fallback rates
        EUR: 0.0033,
        GBP: 0.0028,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                setLoading(true);
                // Using Frankfurter API (Free, no key)
                // Note: Frankfurter uses EUR as default base, but we can specify PKR if available.
                // Actually PKR is not always in Frankfurter. Let's use an API that has PKR.
                // fawazahmed0's API is great for this.
                const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${BASE_CURRENCY.toLowerCase()}.json`);
                const data = await response.json();
                const pkrRates = data[BASE_CURRENCY.toLowerCase()];

                setRates({
                    PKR: 1,
                    USD: pkrRates.usd || 0.0036,
                    EUR: pkrRates.eur || 0.0033,
                    GBP: pkrRates.gbp || 0.0028,
                });
            } catch (error) {
                console.error("Failed to fetch exchange rates:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
    }, []);

    const convertAmount = (amount: number, fromCurrency = "PKR", toCurrency = currency) => {
        const fromRate = rates[fromCurrency as Currency] || 1;
        const toRate = rates[toCurrency as Currency] || 1;
        const amountInPKR = amount / fromRate;
        return amountInPKR * toRate;
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
        <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, convertAmount, exchangeRates: rates, loading }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
    return context;
};
