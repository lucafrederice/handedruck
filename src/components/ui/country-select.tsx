"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { z } from "zod";

import cn from "@/lib/cn";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define schemas for validation
const countryOptionSchema = z.object({
  value: z.string().min(2).max(2), // ISO 3166-1 alpha-2 country code
  label: z.string().min(1),
  dialCode: z.string().regex(/^\+\d{1,3}$/), // Valid international dialing code
  flag: z.string().min(1), // Emoji flag
});

const countriesSchema = z.array(countryOptionSchema);

// Infer types from schemas
export type CountryOption = z.infer<typeof countryOptionSchema>;

// Validate the countries array
const countries: CountryOption[] = countriesSchema.parse([
  { value: "us", label: "United States", dialCode: "+1", flag: "🇺🇸" },
  { value: "ca", label: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { value: "gb", label: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { value: "au", label: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { value: "de", label: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { value: "fr", label: "France", dialCode: "+33", flag: "🇫🇷" },
  { value: "jp", label: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { value: "cn", label: "China", dialCode: "+86", flag: "🇨🇳" },
  { value: "in", label: "India", dialCode: "+91", flag: "🇮🇳" },
  { value: "br", label: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { value: "mx", label: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { value: "es", label: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { value: "it", label: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { value: "kr", label: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { value: "ru", label: "Russia", dialCode: "+7", flag: "🇷🇺" },
]);

// Define props schema
export const countrySelectPropsSchema = z.object({
  value: z.string().min(2).max(2).optional(),
  onValueChange: z.function().args(z.string(), z.string()).returns(z.void()),
});

type CountrySelectProps = z.infer<typeof countrySelectPropsSchema>;

export function CountrySelect({ value, onValueChange }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  const selectedCountry =
    countries.find((country) => country.value === value) || countries[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[110px] justify-between"
        >
          <span className="flex items-center gap-2 truncate">
            <span>{selectedCountry.flag}</span>
            <span>{selectedCountry.dialCode}</span>
          </span>
          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={country.value}
                  onSelect={() => {
                    onValueChange(country.value, country.dialCode);
                    setOpen(false);
                  }}
                >
                  <span className="mr-2">{country.flag}</span>
                  <span>{country.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {country.dialCode}
                  </span>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      value === country.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
