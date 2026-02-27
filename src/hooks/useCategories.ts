import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORIES as DEFAULT_CATEGORIES } from "@/lib/expense-data";

export const useCategories = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadCategories = () => {
        if (!user) {
            setCategories([]);
            setIsLoading(false);
            return;
        }

        const stored = localStorage.getItem(`expenses_categories_${user.id}`);
        if (stored) {
            try {
                setCategories(JSON.parse(stored));
            } catch (e) {
                setCategories([...DEFAULT_CATEGORIES]);
            }
        } else {
            setCategories([...DEFAULT_CATEGORIES]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadCategories();

        const handleUpdate = () => {
            loadCategories();
        };

        window.addEventListener("categories_updated", handleUpdate);

        return () => {
            window.removeEventListener("categories_updated", handleUpdate);
        };
    }, [user]);

    const saveAndDispatch = (newCategories: string[]) => {
        setCategories(newCategories);
        if (user) {
            localStorage.setItem(`expenses_categories_${user.id}`, JSON.stringify(newCategories));
            window.dispatchEvent(new Event("categories_updated"));
        }
    };

    const addCategory = (category: string) => {
        if (!category || categories.includes(category)) return;
        const newCategories = [...categories, category];
        saveAndDispatch(newCategories);
    };

    const updateCategory = (oldCategory: string, newCategory: string) => {
        if (!newCategory || categories.includes(newCategory)) return false;
        const newCategories = categories.map(c => c === oldCategory ? newCategory : c);
        saveAndDispatch(newCategories);
        return true;
    };

    const deleteCategory = (category: string) => {
        // You might want to prevent deleting if it's the last category, but let's just allow it for now
        const newCategories = categories.filter(c => c !== category);
        saveAndDispatch(newCategories);
    };

    return {
        categories,
        isLoading,
        addCategory,
        updateCategory,
        deleteCategory
    };
};
