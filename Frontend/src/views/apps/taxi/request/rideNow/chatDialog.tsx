'use client';

import { Box, Typography, Dialog, DialogTitle, DialogContent } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { format } from 'date-fns';

// ----------------------
// Chat Bubble Component
// ----------------------
const ChatBubble = ({ message }: { message: any }) => {
  const { message: text, createdAt, sender, delivered, read } = message;

  // Simulate logged-in user dynamically
  const currentUserId = sender?.type === 'Driver' ? sender._id : 'user123'; // Replace with real session logic
  const isSentByCurrentUser = sender?._id === currentUserId;

  const formattedTime = format(new Date(createdAt), 'p');

  // WhatsApp-style status logic
  let StatusIcon = AccessTimeIcon;
  let iconColor = isSentByCurrentUser ? 'rgba(255,255,255,0.7)' : '#777';

  if (delivered && !read) {
    StatusIcon = DoneIcon; // single gray tick
    iconColor = isSentByCurrentUser ? 'rgba(255,255,255,0.7)' : '#777';
  } else if (read) {
    StatusIcon = DoneAllIcon; // double blue tick
    iconColor = '#18303bff'; // blue
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isSentByCurrentUser ? 'flex-end' : 'flex-start',
        mt: 2,
      }}
    >
      <Box
        sx={{
          backgroundColor: isSentByCurrentUser ? '#83b7e4ff' : '#E9ECEF',
          color: isSentByCurrentUser ? '#fff' : '#000',
          p: 1.5,
          borderRadius: 2,
          borderTopRightRadius: isSentByCurrentUser ? 0 : 2,
          borderTopLeftRadius: isSentByCurrentUser ? 2 : 0,
          maxWidth: '70%',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      >
        {/* Message Text */}
        <Typography variant="body2" sx={{ wordBreak: 'break-word', mb: 0.3 }}>
          {text}
        </Typography>

        {/*  Sender + Time + Tick (Same line) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 0.3,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: isSentByCurrentUser ? 'rgba(255,255,255,0.8)' : '#777',
              fontWeight: 500,
            }}
          >
            {sender?.type === 'Driver' ? '👨‍✈️ Driver' : '👤 User'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: isSentByCurrentUser ? 'rgba(255,255,255,0.7)' : '#777',
              }}
            >
              {formattedTime}
            </Typography>

            {isSentByCurrentUser && (
              <StatusIcon sx={{ fontSize: 16, color: iconColor }} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ----------------------
// Chat Wrapper Component
// ----------------------
const ChatDialog = ({ messages, onClose, isLoading, requestId }: any) => (
  <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
    {/* Header with bottom shadow */}
    <DialogTitle
      sx={{
        fontWeight: 600,
        p: 2,
        position: 'sticky',
        top: 0,
        backgroundColor: '#fff',
        zIndex: 1,
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', // 👈 subtle shadow line
      }}
    >
      Request ID: {requestId}
    </DialogTitle>

    {/* Chat content area */}
    <DialogContent sx={{ maxHeight: 500, overflowY: 'auto', p: 2 }}>
      {isLoading ? (
        null
      ) : messages.length === 0 ? (
        <Typography align="center" color="text.secondary">
          No Messages found for this Request
        </Typography>
      ) : (
        messages.map((msg: any, index: number) => (
          <ChatBubble key={msg._id || index} message={msg} />
        ))
      )}
    </DialogContent>
  </Dialog>
);

export default ChatDialog;
