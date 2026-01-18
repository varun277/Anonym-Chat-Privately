"use client";
import { useUsername } from "@/app/hooks/useUsername";
import MessageWrapper from "@/components/Messages";
import { client } from "@/lib/client";
import { useRealtime } from "@/lib/realtime-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";

const Room = () => {
  // Ref for input field
  const inputRef = useRef<HTMLInputElement>(null);
  // Get roomId from params
  const params = useParams();
  const roomId = params?.roomId;
  const { userName } = useUsername();
  const router = useRouter();
  // States
  const [copyStatus, setCopyStatus] = useState("COPY");
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [inputMessage, setInputMessage] = useState<String>("");

  const onButtonClick = () => {
    const url = window.location.href;
    if (!url) return;

    navigator.clipboard.writeText(url as string);
    setCopyStatus("COPIED");
    setTimeout(() => {
      setCopyStatus("COPY");
    }, 2000);
  };

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const timeRemainingStyle: React.CSSProperties =
    timeRemaining !== null && timeRemaining < 60
      ? { color: "red" }
      : { color: "green" };

  // Mutation
  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      await client.messages.post(
        {
          sender: userName,
          text: text,
        },
        { query: { roomId } }
      );
    },
  });

  const { mutate: destroyRoom } = useMutation({
    mutationFn: async () => {
      await client.room.delete(null, { query: { roomId } });
    },
  });

  const { data: ttl } = useQuery({
    queryKey: ["room-ttl", roomId],
    queryFn: async () => {
      const response = await client.room.ttl.get({ query: { roomId } });
      return response?.data?.ttl;
    },
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (!ttl || ttl < 0) {
      return;
    }
    setTimeRemaining(ttl);
  }, [ttl]);

  useEffect(() => {
    if (timeRemaining && timeRemaining === 0) {
      router.push("/?destroyed=true");
    }
  }, [timeRemaining, router]);

  // Query to fetch messages
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      const response = await client.messages.get({ query: { roomId } });
      return response.data;
    },
  });

  useRealtime({
    channels: [roomId as string],
    events: ["chat.message", "chat.destroy"],
    onData: ({ event }) => {
      if (event === "chat.message") {
        refetch();
      }

      if (event === "chat.destroy") {
        router.push("/?destroyed=true");
      }
    },
  });

  return (
    <div>
      <header className="header">
        <div className="headerStart">
          <span>ROOM ID</span>
          <div className="roomIdContainer">
            <span>{roomId || "Loading...."}</span>
            <button onClick={() => onButtonClick()}>{copyStatus}</button>
          </div>
        </div>
        <div className="headerEnd">
          <div>
            <span>SELF DESTRUCT</span>
            <p style={timeRemainingStyle}>
              {timeRemaining !== null
                ? formatTimeRemaining(timeRemaining)
                : "--:--"}
            </p>
          </div>
          <button onClick={() => destroyRoom()}>💣 DESTROY NOW</button>
        </div>
      </header>
      <div className="content">
        <div className="messagesContainer">
          <MessageWrapper
            messages={data?.messages}
            isFetching={isFetching}
            isError={isError}
          />
        </div>
      </div>
      <footer className="typeMessageContainer">
        <div className="messageInputWrapper">
          <span className="arrowStyle">{">"}</span>
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={inputMessage as string}
            className="inputStyle"
            placeholder="Type anything.."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Send message
                sendMessage({ text: inputMessage as string });
                setInputMessage("");
                inputRef?.current?.focus();
              }
            }}
            onChange={(e) => {
              setInputMessage(e.target.value);
            }}
          />
        </div>
        <button
          onClick={() => {
            sendMessage({ text: inputMessage as string });
            setInputMessage("");
            inputRef.current?.focus();
          }}
          className="sendBtnStyle"
        >
          {`SENT`}
        </button>
      </footer>
    </div>
  );
};

export default Room;
