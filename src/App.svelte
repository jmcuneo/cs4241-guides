<script>
  let messages = []
  let newMessage = ''
  let username = ''
  let ws

  const generateUsername = () => {
    const prefixes = ['King', 'Bron', 'LBJ', 'Chosen', 'Akron']
    const suffixes = ['James', '23', '6', 'TheGOAT', 'MVP']
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    return `${randomPrefix}${randomSuffix}${Math.floor(Math.random() * 100)}`
  }

  import { onMount } from 'svelte'

  onMount(() => {
    username = generateUsername()

    ws = new WebSocket('ws://localhost:3000')

    ws.onopen = () => {
      console.log('Connected to LeBron Chat!')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'history') {
          messages = data.messages
        } else if (data.type === 'message') {
          messages = [...messages, data]
        }

        setTimeout(() => {
          const messageContainer = document.querySelector('.messages')
          if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight
          }
        }, 100)

      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  })

  const sendMessage = () => {
    if (newMessage.trim() && ws && ws.readyState === WebSocket.OPEN) {
      const messageData = {
        user: username,
        text: newMessage.trim()
      }

      ws.send(JSON.stringify(messageData))
      newMessage = ''
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage()
    }
  }
</script>

<main>
  <div class="chat-container">
    <header class="chat-header">
      <h1>LeBron James Fan Chat</h1>
      <div class="user-info">
        <span>You are: <strong>{username}</strong></span>
        <button on:click={() => username = generateUsername()}>Change Name</button>
      </div>
    </header>

    <div class="messages">
      {#each messages as message}
        <div class="message">
          <div class="message-header">
            <span class="username">{message.user}</span>
            <span class="timestamp">{message.timestamp}</span>
          </div>
          <div class="message-text">{message.text}</div>
        </div>
      {/each}
    </div>

    <div class="input-area">
      <input
              type="text"
              bind:value={newMessage}
              on:keypress={handleKeyPress}
              placeholder="Talk about LeBron's greatness..."
              maxlength="200"
      />
      <button on:click={sendMessage} disabled={!newMessage.trim()}>
        Send
      </button>
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #552583 0%, #FDB927 100%);
    min-height: 100vh;
  }

  main {
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }

  .chat-container {
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 800px;
    height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .chat-header {
    background: #552583;
    color: #FDB927;
    padding: 15px 20px;
    border-radius: 10px 10px 0 0;
    text-align: center;
  }

  .chat-header h1 {
    margin: 0 0 10px 0;
    font-size: 1.5em;
  }

  .user-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9em;
  }

  .user-info button {
    background: #FDB927;
    color: #552583;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #f8f9fa;
  }

  .message {
    background: white;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #FDB927;
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }

  .username {
    font-weight: bold;
    color: #552583;
  }

  .timestamp {
    font-size: 0.8em;
    color: #666;
  }

  .message-text {
    color: #333;
    line-height: 1.4;
  }

  .input-area {
    display: flex;
    padding: 20px;
    background: white;
    border-radius: 0 0 10px 10px;
    border-top: 2px solid #FDB927;
  }

  .input-area input {
    flex: 1;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 6px;
    margin-right: 10px;
    font-size: 1em;
  }

  .input-area input:focus {
    outline: none;
    border-color: #552583;
  }

  .input-area button {
    background: #552583;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
  }

  .input-area button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .input-area button:hover:not(:disabled) {
    background: #6a30a0;
  }
</style>