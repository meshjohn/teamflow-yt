import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sparkles } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/client";
import { client } from "@/lib/orpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Response } from "@/components/ui/shadcn-io/ai/response";

// import {} from "@/components/ui/response"

interface SummerizeThreadProps {
  messageId: string;
}

export function SummerizeThread({ messageId }: SummerizeThreadProps) {
  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
    stop,
    clearError,
  } = useChat({
    id: `thread-summary:${messageId}`,
    transport: {
      async sendMessages(options) {
        return eventIteratorToStream(
          await client.ai.thread.summary.generate(
            {
              messageId: messageId,
            },
            { signal: options.abortSignal }
          )
        );
      },
      reconnectToStream() {
        throw new Error("Unsupported");
      },
    },
  });

  const lastAssistant = messages.findLast((m) => m.role === "assistant");

  const [open, setOpen] = useState(false);

  const summaryText =
    lastAssistant?.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("\n\n") ?? "";

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      const hasAssistantMessage = messages.some((m) => m.role === "assistant");
      if (status !== "ready" || hasAssistantMessage) {
        return;
      }
      sendMessage({ text: "Summarize thread" });
    } else {
      stop();
      clearError();
      setMessages([]);
    }
  }
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="relative overflow-hidden rounded-full bg-gradient-to-t from-violet-600 to-fuchsia-600 text-white shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex items-center gap-1">
            <Sparkles className="size-3.5" />
            <span className="text-xs font-medium">Summarize</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[25rem] p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 py-1.5 px-4">
              <Sparkles className="size-3.5 text-white" />
              <span className="text-sm font-medium ">AI Summary (Preview)</span>
            </span>
          </div>
          {status === "streaming" && (
            <Button
              onClick={() => {
                stop();
              }}
              type="button"
              size="sm"
              variant="outline"
            >
              Stop
            </Button>
          )}
        </div>
        <div className="px-4 py-3 max-h-80 overflow-y-auto">
          {error ? (
            <div className="">
              <p className="text-red-500">{error.message}</p>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  clearError();
                  setMessages([]);
                  sendMessage({ text: "Summarize Thread" });
                }}
              >
                Try Again
              </Button>
            </div>
          ) : summaryText ? (
            <Response parseIncompleteMarkdown={status !== "ready"} >{summaryText}</Response>
          ) : status === "submitted" || status === "streaming" ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              Click summarize to generate
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
