"use client";

import { useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";
import { CountrySelect } from "./ui/country-select";
import { z } from "zod";

// Define schemas for validation
const phoneNumberSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number must be at most 15 digits")
  .regex(
    /^[0-9+\-\s()]*$/,
    "Phone number can only contain numbers, +, -, (, ), and spaces"
  );

const countryCodeSchema = z
  .string()
  .min(2, "Country code must be at least 2 characters")
  .max(2, "Country code must be at most 2 characters")
  .toLowerCase();

const dialCodeSchema = z
  .string()
  .startsWith("+", "Dial code must start with +")
  .regex(/^\+[0-9]{1,3}$/, "Dial code must be a valid international prefix");

// Infer types from schemas
type PhoneNumber = z.infer<typeof phoneNumberSchema>;
type CountryCode = z.infer<typeof countryCodeSchema>;
type DialCode = z.infer<typeof dialCodeSchema>;

interface PhoneInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  onChange?: (value: PhoneNumber, fullValue: string) => void;
  value?: PhoneNumber;
}

export function PhoneInput({
  id = "phone",
  name = "phone",
  placeholder = "(123) 456-7890",
  className = "",
  onChange,
  value = "",
}: PhoneInputProps) {
  const [country, setCountry] = useState<CountryCode>("us");
  const [dialCode, setDialCode] = useState<DialCode>("+1");
  const [phoneNumber, setPhoneNumber] = useState<PhoneNumber>(value);
  const [error, setError] = useState<string | null>(null);

  const handleCountryChange = (value: string, newDialCode: string) => {
    try {
      const validatedCountry = countryCodeSchema.parse(value);
      const validatedDialCode = dialCodeSchema.parse(newDialCode);

      setCountry(validatedCountry);
      setDialCode(validatedDialCode);
      setError(null);

      if (onChange) {
        onChange(phoneNumber, `${validatedDialCode} ${phoneNumber}`);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
    }
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    try {
      const validatedPhoneNumber = phoneNumberSchema.parse(value);
      setPhoneNumber(validatedPhoneNumber);
      setError(null);

      if (onChange) {
        onChange(validatedPhoneNumber, `${dialCode} ${validatedPhoneNumber}`);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
    }
  };

  const fullValue = (dialCode + phoneNumber).trim();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <CountrySelect value={country} onValueChange={handleCountryChange} />
        <div className="relative flex-1">
          <Input
            id={id}
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            className={`pl-10 ${className} ${error ? "border-red-500" : ""}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Phone className="h-4 w-4" />
          </div>
          <input type="hidden" name={name} value={fullValue} />
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
