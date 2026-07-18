import * as React from "react";
import { render, screen } from "@testing-library/react";
import { ChatBubble } from "./ChatBubble";

describe("ChatBubble Component", () => {
  test("renders message content correctly", () => {
    render(<ChatBubble role="model" content="Hello operator" />);
    expect(screen.getByText("Hello operator")).toBeInTheDocument();
  });

  test("renders voice instruction indicator when isVoice is true", () => {
    render(<ChatBubble role="model" content="Audio instruction" isVoice={true} />);
    expect(screen.getByText("VOICE INSTRUCTION")).toBeInTheDocument();
  });

  test("does not render voice instruction indicator when isVoice is false", () => {
    render(<ChatBubble role="model" content="Text instruction" isVoice={false} />);
    expect(screen.queryByText("VOICE INSTRUCTION")).not.toBeInTheDocument();
  });

  test("renders follow-up chips for bot responses", () => {
    const followUps = ["Navigate there", "View Menu"];
    const handleFollowUpClick = jest.fn();

    render(
      <ChatBubble
        role="model"
        content="Bot response"
        followUps={followUps}
        onFollowUpClick={handleFollowUpClick}
      />
    );

    const button1 = screen.getByRole("button", { name: /Navigate there/i });
    const button2 = screen.getByRole("button", { name: /View Menu/i });

    expect(button1).toBeInTheDocument();
    expect(button2).toBeInTheDocument();

    button1.click();
    expect(handleFollowUpClick).toHaveBeenCalledWith("Navigate there");
  });
});
