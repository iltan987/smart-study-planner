export default function ChatBot() {
  return (
    <div
      className={`w-3/4 flex bg-white flex-col justify-between h-screen p-4 rounded-3xl`}
    >
      <div className="flex justify-between p-2 mb-4 border-b">
        <div className="flex flex-col">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold text-black">ChatBot</h2>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {/* { TODO: get the message history }
            ) : (
              <p key={index}>Other message</p>
            )
          )} */}
      </div>

      {/* <MessageInput
        onSendMessage={handleSendInputMessage}
        wrapper={wrapper}
        chatroomusername={currentRoom?.username || ''}
        roomType={currentRoom?.type || ''}
        currentRoom={currentRoom}
      /> */}
    </div>
  );
}
