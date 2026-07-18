import * as React from "react";
import { LANGUAGES } from "@/lib/zoneData";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export interface LanguageSelectorProps {
  currentLanguageCode: string;
  onChange: (code: string) => void;
}

export function LanguageSelector({
  currentLanguageCode,
  onChange,
}: LanguageSelectorProps) {
  const currentLang = React.useMemo(() => {
    return LANGUAGES.find((lang) => lang.code === currentLanguageCode) || LANGUAGES[0]!;
  }, [currentLanguageCode]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="icon"
          aria-label="Select language"
          className="h-touch-target-min w-touch-target-min flex items-center justify-center text-primary transition-all duration-200 hover:bg-primary-container rounded-full"
        >
          <span className="material-symbols-outlined text-[24px]">language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[180px]">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={`flex items-center justify-between px-3 py-2 cursor-pointer ${
              lang.code === currentLanguageCode
                ? "bg-primary-container text-primary font-bold"
                : "hover:bg-surface-variant text-on-surface"
            }`}
          >
            <span>{lang.nativeName}</span>
            <span className="font-data-mono text-xs opacity-60 uppercase">{lang.code}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
