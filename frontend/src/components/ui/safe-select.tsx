import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SafeSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    children: React.ReactNode;
    id?: string;
    className?: string;
}

// Safe Select wrapper that handles DOM errors gracefully
export const SafeSelect = ({ 
    value, 
    onValueChange, 
    placeholder, 
    children, 
    id,
    className 
}: SafeSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Reset error state when value changes
    useEffect(() => {
        if (hasError) {
            setHasError(false);
        }
    }, [value]);

    const handleValueChange = (newValue: string) => {
        try {
            onValueChange(newValue);
            setIsOpen(false);
        } catch (error) {
            console.error("Select value change error:", error);
            setHasError(true);
        }
    };

    const handleOpenChange = (open: boolean) => {
        try {
            setIsOpen(open);
        } catch (error) {
            console.error("Select open change error:", error);
            setHasError(true);
        }
    };

    if (hasError) {
        // Fallback to native select if Radix UI fails
        return (
            <select
                id={id}
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="">{placeholder || "Auswählen..."}</option>
                <option value="apartment">Ferienwohnung</option>
                <option value="house">Ferienhaus</option>
                <option value="room">Zimmer</option>
                <option value="hotel">Hotel</option>
                <option value="bungalow">Bungalow</option>
                <option value="other">Sonstiges</option>
            </select>
        );
    }

    try {
        return (
            <Select 
                value={value} 
                onValueChange={handleValueChange}
                open={isOpen}
                onOpenChange={handleOpenChange}
            >
                <SelectTrigger id={id} className={className}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent 
                    position="popper" 
                    sideOffset={4}
                    className="z-50"
                    onCloseAutoFocus={(e) => {
                        // Prevent focus issues that can cause DOM errors
                        e.preventDefault();
                    }}
                >
                    {children}
                </SelectContent>
            </Select>
        );
    } catch (error) {
        console.error("SafeSelect render error:", error);
        setHasError(true);
        return null;
    }
};