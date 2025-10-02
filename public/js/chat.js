// Chat functionality for booking messages with real-time Socket.IO
document.addEventListener('DOMContentLoaded', function() {
    console.log('Chat.js loaded');

    // Check if variables are available
    console.log('Chat variables check:', {
        currentBookingId: typeof currentBookingId !== 'undefined' ? currentBookingId : 'undefined',
        currentUserId: typeof currentUserId !== 'undefined' ? currentUserId : 'undefined',
        otherParticipantName: typeof otherParticipantName !== 'undefined' ? otherParticipantName : 'undefined',
        receiverId: typeof receiverId !== 'undefined' ? receiverId : 'undefined'
    });

    // Initialize Socket.IO connection
    const socket = io();
    let isConnected = false;

    // Connect to Socket.IO and join user room
    socket.on('connect', () => {
        isConnected = true;
        console.log('Socket.IO connected, joining user room:', currentUserId);
        socket.emit('join-user', currentUserId);
        console.log('Connected to chat server');
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        isConnected = false;
    });

    // Set chat title based on user role
    if (typeof otherParticipantName !== 'undefined') {
        document.getElementById('chatTitle').textContent = `Chat with ${otherParticipantName}`;
    }

    // Load conversation when chat opens
    window.openChat = function() {
        console.log('openChat function called');
        console.log('Current booking ID:', currentBookingId);

        const chatSection = document.getElementById('chatSection');
        const chatTitle = document.getElementById('chatTitle');

        console.log('Chat elements found:', {
            chatSection: !!chatSection,
            chatTitle: !!chatTitle
        });

        if (chatSection) {
            chatSection.style.display = 'block';
            console.log('Chat section shown');

            // Scroll to chat section
            chatSection.scrollIntoView({ behavior: 'smooth' });

            // Load messages
            loadConversation();
        } else {
            console.error('Chat section element not found!');
        }
    };

    // Close chat
    window.closeChat = function() {
        document.getElementById('chatSection').style.display = 'none';
    };

    // Send message via Socket.IO
    window.sendMessage = function() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const content = messageInput.value.trim();

        if (!content || !isConnected) return;

        // Send message via Socket.IO
        socket.emit('send-message', {
            bookingId: currentBookingId,
            content: content,
            senderId: currentUserId,
            receiverId: receiverId
        });

        // Clear input immediately for better UX
        messageInput.value = '';
    };

    // Listen for new messages via Socket.IO
    socket.on('new-message', (data) => {
        if (data.bookingId === currentBookingId) {
            addMessageToUI(data.message, true);
            scrollToBottom();

            // Re-enable input
            const messageInput = document.getElementById('messageInput');
            const sendButton = document.getElementById('sendButton');
            messageInput.disabled = false;
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fa-solid fa-paper-plane me-1"></i>Send';
        }
    });

    // Listen for message errors
    socket.on('message-error', (data) => {
        alert('Failed to send message: ' + data.message);

        // Re-enable input
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        messageInput.disabled = false;
        sendButton.disabled = false;
        sendButton.innerHTML = '<i class="fa-solid fa-paper-plane me-1"></i>Send';
    });

    // Load conversation
    function loadConversation() {
        fetch(`/message/booking/${currentBookingId}/conversation`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayMessages(data.messages);
                scrollToBottom();

                // Mark as read
                if (data.unreadCount > 0) {
                    markAsRead();
                }
            } else {
                console.error('Failed to load conversation:', data.message);
            }
        })
        .catch(error => {
            console.error('Error loading conversation:', error);
        });
    }

    // Display messages in UI
    function displayMessages(messages) {
        const container = document.getElementById('messagesContainer');

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fa-solid fa-comments fa-2x mb-2"></i>
                    <p>Start a conversation about your booking</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        messages.forEach(message => {
            addMessageToUI(message, false);
        });
    }

    // Add single message to UI
    function addMessageToUI(message, isNew = false) {
        const container = document.getElementById('messagesContainer');
        const isCurrentUser = message.sender._id === currentUserId;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${isCurrentUser ? 'message-sent' : 'message-received'}`;
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <strong>${isCurrentUser ? 'You' : (message.sender.profile?.firstName || message.sender.username)}</strong>
                    <small class="text-muted">${formatTime(message.createdAt)}</small>
                </div>
                <div class="message-text">${escapeHtml(message.content)}</div>
            </div>
        `;

        // Add animation for new messages
        if (isNew) {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateY(10px)';
            container.appendChild(messageElement);

            // Animate in
            setTimeout(() => {
                messageElement.style.transition = 'all 0.3s ease';
                messageElement.style.opacity = '1';
                messageElement.style.transform = 'translateY(0)';
            }, 10);
        } else {
            container.appendChild(messageElement);
        }
    }

    // Format time for display
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    // Scroll to bottom of messages
    function scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTop = container.scrollHeight;
    }

    // Mark messages as read
    function markAsRead() {
        fetch(`/message/booking/${currentBookingId}/mark-read`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`Marked ${data.markedCount} messages as read`);
            }
        })
        .catch(error => {
            console.error('Error marking messages as read:', error);
        });
    }

    // Enable/disable send button based on input
    document.getElementById('messageInput').addEventListener('input', function() {
        const sendButton = document.getElementById('sendButton');
        sendButton.disabled = !this.value.trim();
    });

    // Send message on Enter key
    document.getElementById('messageInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey && !sendButton.disabled) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Auto-load messages when chat opens (no more polling needed with Socket.IO)
});
