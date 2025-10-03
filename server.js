import express from 'express'
import http from 'http'
import { WebSocketServer } from 'ws'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3000

const server = http.createServer(app)
const socketServer = new WebSocketServer({ server })
const clients = new Set()

let chatMessages = []

app.use(express.static(path.join(__dirname, 'src')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

socketServer.on('connection', (client) => {
    console.log('New user joined the LeBron chat!')
    clients.add(client)

    client.send(JSON.stringify({
        type: 'history',
        messages: chatMessages
    }))

    client.on('message', (data) => {
        try {
            const messageData = JSON.parse(data)
            const chatMessage = {
                id: Date.now() + Math.random(),
                user: messageData.user || 'Anonymous Fan',
                text: messageData.text,
                timestamp: new Date().toLocaleTimeString(),
                type: 'message'
            }

            chatMessages.push(chatMessage)
            if (chatMessages.length > 50) {
                chatMessages = chatMessages.slice(-50)
            }

            clients.forEach(c => {
                if (c.readyState === 1) {
                    c.send(JSON.stringify(chatMessage))
                }
            })
        } catch (error) {
            console.error('Error processing message:', error)
        }
    })

    client.on('close', () => {
        clients.delete(client)
        console.log('User left the chat')
    })
})

server.listen(PORT, () => {
    console.log(`LeBron James chat server running on port ${PORT}! Make sure to share your favorite LeBron moments`)
    console.log(`Open http://localhost:${PORT} in your browser`)
})