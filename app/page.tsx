"use client";
import { useRouter } from "next/navigation";
import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { useUsername } from "../app/hooks/useUsername";

export default function Home() {
  // In build router in nextJs
  const router = useRouter();
  // Styles for the container
  const containerStyles = {
    padding: "20px",
  };
  // Get username from the hook
  const { userName } = useUsername();

  const isRoomNotFound =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("error") ===
      "room-not-found";

  const isRoomFull =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("error") === "room-full";

  const isRoomDestroyed =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("destroyed") ===
      Boolean(true).toString();

  const createPrivateRoom = async () => {
    const response = await client.room.create.post();
    if (response.status === 200) {
      const roomId = response?.data?.roomId;
      // Redirect to the newly created room
      if (roomId) {
        router.push(`/room/${roomId}`);
      }
    }
  };

  // Mutations
  const { mutate: onCreateRoom } = useMutation({
    mutationFn: createPrivateRoom,
    // onSuccess: () => {
    //   // Invalidate and refetch
    //   queryClient.invalidateQueries({ queryKey: ["todos"] });
    // },
  });

  return (
    <main className="flex min-h-screen flex-col justify-center px-8">
      <div className="max-w-md mx-auto min-w-[320px]">
        {isRoomNotFound && (
          <div className="errorAlert">
            Room not found. Please check the link or create a new room.
          </div>
        )}
        {isRoomFull && (
          <div className="errorAlert">
            Room is full. Please try joining another room or create a new one.
          </div>
        )}
        {isRoomDestroyed && (
          <div className="errorAlert">
            The room has been destroyed successfully.
          </div>
        )}
        <div
          className="flex justify-center flex-col align-center text-center"
          style={{ padding: "16px" }}
        >
          <h1 style={{ color: "green", margin: "0" }}>{">"}Private chat</h1>
          <p style={{ color: "#d6d4daaa", margin: "0" }}>
            A private, self destructing chat room for free
          </p>
        </div>

        <div
          className="border border-zinc-800 bg-zinc-900/50 flex justify-center"
          style={containerStyles}
        >
          <div className="space-y-20">
            <div className="space-y-2 flex flex-col">
              <label className="flex items-center text-zinc-500">
                Your Identity:
                <div
                  style={{
                    marginLeft: "4px",
                    padding: "6px",
                    border: "1px solid #d6d4d253",
                    minWidth: "200px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {userName || "Generating..."}
                </div>
              </label>
              <button
                className="bg-zinc-800 text-zinc-200 text-sm hover:bg-zinc-700 w-full cursor-pointer"
                style={{ padding: "10px", marginTop: "20px" }}
                onClick={() => onCreateRoom()}
              >
                CREATE SECURE ROOM
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
