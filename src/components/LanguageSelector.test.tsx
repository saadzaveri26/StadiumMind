import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageSelector } from "./LanguageSelector";

// Hoisted mock to render DropdownMenu inline without Radix browser-events/portal complexities in unit tests
jest.mock("./ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => <div onClick={onClick}>{children}</div>,
}));

describe("LanguageSelector Component", () => {
  test("renders select language trigger button with correct accessibility label", () => {
    render(<LanguageSelector currentLanguageCode="en" onChange={jest.fn()} />);
    
    const triggerBtn = screen.getByRole("button", { name: /select language/i });
    expect(triggerBtn).toBeInTheDocument();
  });

  test("renders language list items and triggers onChange with correct language code on click", () => {
    const handleChange = jest.fn();
    render(<LanguageSelector currentLanguageCode="en" onChange={handleChange} />);

    // Since mock renders content inline, language items are already in document
    const spanishOption = screen.getByText("Español");
    expect(spanishOption).toBeInTheDocument();

    fireEvent.click(spanishOption);
    expect(handleChange).toHaveBeenCalledWith("es");
  });
});
