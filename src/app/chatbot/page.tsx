import React from 'react';

export default function ChatBot() {
  return (
    <div className="flex flex-col h-screen ">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h1 className="text-xl font-semibold">CHATBOT</h1>
      </div>

      {/* Center: "HOW CAN I HELP YOU?" */}
      <div className="flex-grow flex items-center justify-center bg-white">
        <p className="text-2xl font-semibold text-gray-400">
          HOW CAN I HELP YOU?
        </p>
      </div>

      {/* Bottom Bar */}
      <div className="p-4 border-t bg-white flex items-center space-x-2">
        {/* Plus (+) button */}
        <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
          {/* Heroicons Plus Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        {/* Text Input */}
        <input
          type="text"
          placeholder="Write a message..."
          className="flex-grow px-4 py-2 border rounded focus:outline-none"
        />

        {/* Microphone button */}
        <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
          {/* Heroicons Microphone Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11c0 3.866-3.582 7-8 7S3 14.866 3 11m8 7v4m0 4h.01M15 11V7a3 3 0 10-6 0v4a3 3 0 006 0z"
            />
          </svg>
        </button>

        {/* Send button */}
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Send
        </button>
      </div>
    </div>
  );
}
