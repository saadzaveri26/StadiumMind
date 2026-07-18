import * as React from "react";

export interface ChatBubbleProps {
  role: "user" | "model";
  content: string;
  timestamp?: string;
  isVoice?: boolean;
  followUps?: string[];
  onFollowUpClick?: (text: string) => void;
}

const ChatBubbleComponent = ({
  role,
  content,
  timestamp,
  isVoice = false,
  followUps = [],
  onFollowUpClick,
}: ChatBubbleProps) => {
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full max-w-[85%] gap-3 items-end ${
        isUser ? "ml-auto justify-end" : "mr-auto"
      }`}
    >
      {/* Bot Icon */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 border border-outline-variant/50 text-tertiary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h7.5v7.5H7.5v-7.5Z" />
          </svg>
        </div>
      )}

      <div className="flex flex-col gap-2 w-full">
        <div
          className={`rounded-2xl p-4 text-on-surface shadow-sm relative group border ${
            isUser
              ? "bg-primary-container border-primary/20 rounded-br-sm text-inverse-surface"
              : "bg-surface-container-low border-l-2 border-l-tertiary border-outline-variant/30 rounded-bl-sm"
          }`}
        >
          {isVoice && (
            <div className="flex items-center gap-1.5 mb-2 text-xs font-data-mono text-tertiary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 animate-pulse">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
              <span>VOICE INSTRUCTION</span>
            </div>
          )}

          <p className="font-body-md whitespace-pre-line leading-relaxed text-sm break-words">
            {content}
          </p>

          {/* Follow-up question chips rendered inline inside the bot response bubble per static design */}
          {!isUser && followUps.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-outline-variant/30">
              {followUps.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onFollowUpClick && onFollowUpClick(chip)}
                  className="px-3 py-1.5 rounded bg-surface-container-highest text-on-surface font-label-bold text-[12px] flex items-center gap-1 hover:bg-tertiary/20 hover:text-tertiary transition-colors border border-transparent hover:border-tertiary/50 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 text-tertiary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l8.982-11.795m-9 0L9 3l8.982 11.795M9.813 15.904L9 21M9.813 15.904h9.043M9 3h9.043" />
                  </svg>
                  {chip}
                </button>
              ))}
            </div>
          )}

          {timestamp && (
            <span
              className={`text-[9px] absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity font-data-mono ${
                isUser ? "right-0 text-on-primary-container" : "left-0 text-on-surface-variant"
              }`}
            >
              {timestamp}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

ChatBubbleComponent.displayName = "ChatBubble";

export const ChatBubble = React.memo(ChatBubbleComponent);
