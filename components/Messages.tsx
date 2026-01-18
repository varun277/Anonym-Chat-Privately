import { useUsername } from "@/app/hooks/useUsername";
import { time } from "node:console";
import React, { useCallback } from "react";

interface MessageWrapperProps {
  messages?: any[];
  isFetching?: boolean;
  isError?: boolean;
}

const MessageWrapper = ({
  messages = [],
  isFetching = false,
  isError = false,
}): MessageWrapperProps => {
  const { userName } = useUsername();

  // Get the title color based on sender
  const getTitleStyle = useCallback(
    (msg: any) => {
      if (!msg.sender) return {};
      return msg.sender === userName ? { color: "green" } : { color: "aqua" };
    },
    [userName]
  );

  const getTime = useCallback((timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);

    const hours = date.getHours(); // Gets the hour (0-23)
    const minutes = date.getMinutes(); // Gets the minute (0-59)

    // Pad single digits with a leading zero for "HH:MM:SS" format
    const formattedTime = [hours, minutes]
      .map((unit) => unit.toString().padStart(2, "0"))
      .join(":");

    return formattedTime;
  }, []);

  return (
    <>
      {messages && messages?.length === 0 && (
        <div className="noMessageswrapper">
          No messages yet, start the conversation
        </div>
      )}
      {messages?.map((msg: any, index: number) => (
        <div key={msg.id} className="messageItemWrapper">
          <div className="messageTitleWrapper">
            <strong style={getTitleStyle(msg)}>
              {msg.sender === userName ? `ME` : msg.sender}:
            </strong>
            <span className="timestampStyle">{getTime(msg?.timestamp)}</span>
          </div>
          <span className="textStyle">{msg.text}</span>
        </div>
      ))}
    </>
  );
};

export default MessageWrapper;
