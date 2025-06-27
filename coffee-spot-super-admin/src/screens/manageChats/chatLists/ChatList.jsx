import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/globalStyles.css";
import "./ChatList.css";
import InputField from "../../../utils/customInputField/InputField";
import Loader from "../../../utils/customLoader/Loader";
import { ChatEvents } from "../../../utils/socket/ChatEventHooks/ChatEventHooks";
import moment from "moment";
import Modal from "../../../utils/customModal/Modal";
import { toast } from "react-hot-toast";

const ChatList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [localChats, setLocalChats] = useState([]);

  const { allChats, getAllChats, closeChat, deleteChat } = ChatEvents();

  useEffect(() => {
    setLoading(true);
    getAllChats();
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    setLocalChats(allChats);
  }, [allChats]);

  const handleSearch = (e) => setSearch(e.target.value);

  const filteredChats = localChats.filter((chat) => {
    const userName = chat?.user?.userName || "Unknown User";
    const userLastMessage = [...(chat?.messages || [])]
      .reverse()
      .find((msg) => msg.sender === "USER");

    const lastMessageText = userLastMessage?.text || "";

    return (
      userName.toLowerCase().includes(search.toLowerCase()) ||
      lastMessageText.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleViewDetailChange = (chat) => {
    if (chat.isActive) {
      // Only allow viewing if chat is active
      navigate(`/admin/customer-care/chat-details/${chat._id}`, {
        state: { chat },
      });
    }
  };

  const handleSyncClick = (chat) => {
    if (chat.isActive) {
      // Only allow sync if chat is active
      setSelectedChat(chat);
      setIsSyncModalOpen(true);
    }
  };

  const handleCloseChat = async () => {
    setLoadingAction("CLOSE_CHAT");
    try {
      await closeChat(selectedChat._id);

      setLocalChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChat._id ? { ...chat, isActive: false } : chat
        )
      );

      setIsSyncModalOpen(false);
      toast.success("Chat closed successfully!");
    } catch (error) {
      console.error("Error closing chat:", error);
      toast.error(`Failed to close chat: ${error.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteClick = (chat) => {
    setSelectedChat(chat);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setLoadingAction("DELETE_CHAT");
    try {
      await deleteChat(selectedChat._id);
      // Update local state immediately
      setLocalChats((prevChats) =>
        prevChats.filter((chat) => chat._id !== selectedChat._id)
      );
      setIsDeleteModalOpen(false);
      toast.success("Chat deleted successfully!");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error(`Failed to delete chat: ${error.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <section id="chats">
      <div className="chats-container">
        <h2 className="chats-title">Chats</h2>
        <div className="chats-header">
          <div className="mt-4">
            <InputField
              type="text"
              placeholder="Search Chats"
              value={search}
              onChange={handleSearch}
              width={300}
            />
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : filteredChats.length > 0 ? (
            <table className="chats-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Last Message</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChats.map((chat) => {
                  const userLastMessage = [...(chat.messages || [])]
                    .reverse()
                    .find((msg) => msg.sender === "USER");

                  return (
                    <tr key={chat._id}>
                      <td className="user-profile">
                        <img
                          src={
                            chat?.user?.profilePicture || "default-profile.png"
                          }
                          alt={chat?.user?.userName}
                          className="user-img"
                          onError={(e) => {
                            e.target.src = "default-profile.png";
                          }}
                        />
                        <span className="user-name">
                          {chat?.user?.userName || "Unknown User"}
                        </span>
                      </td>

                      <td>{userLastMessage?.text || "No user messages"}</td>
                      <td>
                        {userLastMessage?.sentAt
                          ? moment(userLastMessage.sentAt).fromNow()
                          : "--"}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            chat.isActive ? "active" : "closed"
                          }`}
                        >
                          {chat.isActive ? "Active" : "Closed"}
                        </span>
                      </td>
                      <td className="actions">
                        {chat.isActive ? (
                          <>
                            <button
                              className="action-btn view-btn"
                              onClick={() => handleViewDetailChange(chat)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="action-btn sync-btn"
                              onClick={() => handleSyncClick(chat)}
                            >
                              <i className="fas fa-sync"></i>
                            </button>
                          </>
                        ) : null}
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteClick(chat)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="no-chats-found">
              <i className="fas fa-comments"></i>
              <p>No Chats Found</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        title={`Close Chat with ${selectedChat?.user?.userName || "User"}`}
        loading={loadingAction === "CLOSE_CHAT"}
        icon={<i className="fas fa-comment-slash"></i>}
        buttons={[
          {
            label: "Close Chat",
            className: "danger-btn",
            onClick: handleCloseChat,
            loading: loadingAction === "CLOSE_CHAT",
            disabled: selectedChat && !selectedChat.isActive,
          },
          {
            label: "Cancel",
            className: "secondary-btn",
            onClick: () => setIsSyncModalOpen(false),
            disabled: loadingAction === "CLOSE_CHAT",
          },
        ]}
      >
        <p>Are you sure you want to close this chat?</p>
        <p className="text-muted">
          {selectedChat?.isActive
            ? "The user won't be able to send new messages until a new chat is started."
            : "This chat is already closed."}
        </p>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Delete Chat with ${selectedChat?.user?.userName || "User"}`}
        loading={loadingAction === "DELETE_CHAT"}
        icon={<i className="fas fa-trash"></i>}
        buttons={[
          {
            label: "Delete",
            className: "danger-btn",
            onClick: handleConfirmDelete,
            loading: loadingAction === "DELETE_CHAT",
          },
          {
            label: "Cancel",
            className: "secondary-btn",
            onClick: () => setIsDeleteModalOpen(false),
            disabled: loadingAction === "DELETE_CHAT",
          },
        ]}
      >
        <p>Are you sure you want to permanently delete this chat?</p>
        <p className="text-muted">
          This action cannot be undone. All messages will be permanently
          removed.
        </p>
      </Modal>
    </section>
  );
};

export default ChatList;
