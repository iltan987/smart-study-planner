'use client';

import {
  createChat,
  deleteChat,
  getAllChats,
  renameChat,
} from '@/actions/chat.action';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

interface SidebarChatContextType {
  chats: {
    id: string;
    name: string;
    createdAt: Date;
  }[];
  setChats: Dispatch<
    SetStateAction<
      {
        id: string;
        name: string;
        createdAt: Date;
      }[]
    >
  >;

  loading: boolean;

  isDeletingDialogOpen: boolean;
  setIsDeletingDialogOpen: Dispatch<SetStateAction<boolean>>;
  isRenamingDialogOpen: boolean;
  setIsRenamingDialogOpen: Dispatch<SetStateAction<boolean>>;

  openDeleteDialog: (chatId: string, chatName: string) => void;
  openRenameDialog: (chatId: string, currentName: string) => void;

  handleCreateChat: (chatName?: string) => Promise<
    | {
        chatId: string;
        name: string;
        createdAt: Date;
      }
    | undefined
  >;
  handleConfirmDelete: () => Promise<void>;
  handleConfirmRename: () => Promise<void>;

  newChatNameInput: string;
  setNewChatNameInput: Dispatch<SetStateAction<string>>;
  chatNameToDelete: string;
}

const SidebarChatContext = createContext<SidebarChatContextType | undefined>(
  undefined
);

export const SidebarChatProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [chats, setChats] = useState<
    {
      id: string;
      name: string;
      createdAt: Date;
    }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchChats = async () => {
      const result = await getAllChats();
      if (result.success) {
        setChats(result.data);
      }
      setLoading(false);
    };
    fetchChats();
  }, []);
  const router = useRouter();
  const [isDeletingDialogOpen, setIsDeletingDialogOpen] = useState(false);
  const [isRenamingDialogOpen, setIsRenamingDialogOpen] = useState(false);

  const [chatIdToModify, setChatIdToModify] = useState<string | null>(null);
  const [currentNameForRename, setCurrentNameForRename] = useState<string>('');
  const [newChatNameInput, setNewChatNameInput] = useState<string>('');
  const [chatNameToDelete, setChatNameToDelete] = useState<string>('');

  const handleCreateChat = async (chatName?: string) => {
    const result = await createChat(chatName);
    if (result.success) {
      const newChat = {
        id: result.data.chatId,
        name: result.data.name,
        createdAt: result.data.createdAt,
      };
      setChats((prev) => [...prev, newChat]);
      router.push(`/chat/${result.data.chatId}`);
    } else {
      console.error('Failed to create chat:', result.error);
      return undefined;
    }
    return result.data;
  };

  const openDeleteDialog = (chatId: string, chatName: string) => {
    setChatIdToModify(chatId);
    setChatNameToDelete(chatName);
    setIsDeletingDialogOpen(true);
  };

  const openRenameDialog = (chatId: string, currentName: string) => {
    setChatIdToModify(chatId);
    setCurrentNameForRename(currentName);
    setNewChatNameInput(currentName);
    setIsRenamingDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!chatIdToModify) return;
    setIsDeletingDialogOpen(false);
    await deleteChat(chatIdToModify);
    setChats((prev) => prev.filter((chat) => chat.id !== chatIdToModify));
    router.push('/');
  };

  const handleConfirmRename = async () => {
    if (!chatIdToModify || !newChatNameInput.trim()) return;
    setIsRenamingDialogOpen(false);
    await renameChat(chatIdToModify, newChatNameInput.trim());
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatIdToModify
          ? { ...chat, name: newChatNameInput.trim() }
          : chat
      )
    );
  };

  return (
    <SidebarChatContext.Provider
      value={{
        chats,
        setChats,
        loading,
        isDeletingDialogOpen,
        setIsDeletingDialogOpen,
        isRenamingDialogOpen,
        setIsRenamingDialogOpen,
        openDeleteDialog,
        openRenameDialog,
        handleCreateChat,
        handleConfirmDelete,
        handleConfirmRename,
        newChatNameInput,
        setNewChatNameInput,
        chatNameToDelete,
      }}
    >
      {children}

      <Dialog
        open={isDeletingDialogOpen}
        onOpenChange={(isOpen) => {
          setIsDeletingDialogOpen(isOpen);
          if (!isOpen) {
            setChatNameToDelete('');
            setChatIdToModify(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the chat &quot;
              {chatNameToDelete}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRenamingDialogOpen}
        onOpenChange={(isOpen) => {
          setIsRenamingDialogOpen(isOpen);
          if (!isOpen) {
            setCurrentNameForRename('');
            setNewChatNameInput('');
            setChatIdToModify(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for the chat &quot;{currentNameForRename}
              &quot;.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newChatNameInput}
            onChange={(e) => setNewChatNameInput(e.target.value)}
            placeholder="New chat name"
            className="my-4"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleConfirmRename}>
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarChatContext.Provider>
  );
};

export const useSidebarChat = (): SidebarChatContextType => {
  const context = useContext(SidebarChatContext);
  if (context === undefined) {
    throw new Error('useSidebarChat must be used within a SidebarChatProvider');
  }
  return context;
};
