import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
  const { selectedUser } = get();
  const socket = useAuthStore.getState().socket;
  const authUser = useAuthStore.getState().authUser;

  try {
    // Save message in DB
    const res = await axiosInstance.post(
      `/messages/send/${selectedUser._id}`,
      messageData
    );

    const savedMessage = res.data;

    // ✅ Add message instantly to sender's chat
    set((state) => ({
      messages: [...state.messages, savedMessage],
    }));

    // ✅ Emit socket event so receiver gets it in real time
    if (socket) {
      socket.emit("sendMessage", {
        ...savedMessage,
        senderId: authUser._id,
        receiverId: selectedUser._id,
      });
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to send message");
  }
},


  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;

    // ✅ prevent duplicate listeners
    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const isRelevantMessage =
        (newMessage.senderId.toString() === selectedUser._id.toString() &&
          newMessage.receiverId.toString() === authUser._id.toString()) ||
        (newMessage.receiverId.toString() === selectedUser._id.toString() &&
          newMessage.senderId.toString() === authUser._id.toString());

      if (!isRelevantMessage) return;

      // ✅ functional update
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

