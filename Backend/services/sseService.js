/**
 * Server-Sent Events Service for Real-time Updates
 */

class SSEService {
  constructor() {
    this.clients = new Set();
  }

  /**
   * Add a new SSE client
   */
  addClient(res) {
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection message
    res.write('data: {"type":"connected","message":"Connected to feedback updates"}\n\n');

    // Add client to the set
    this.clients.add(res);

    // Handle client disconnect
    res.on('close', () => {
      this.clients.delete(res);
      console.log('📡 SSE client disconnected');
    });

    console.log(`📡 SSE client connected. Total clients: ${this.clients.size}`);
    return res;
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(data) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    
    // Send to all connected clients
    this.clients.forEach(client => {
      try {
        client.write(message);
      } catch (error) {
        console.error('Error sending SSE message:', error);
        this.clients.delete(client);
      }
    });

    console.log(`📡 Broadcasted to ${this.clients.size} SSE clients:`, data);
  }

  /**
   * Notify about new feedback
   */
  notifyNewFeedback(feedbackData) {
    this.broadcast({
      type: 'new_feedback',
      data: feedbackData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Notify about feedback update
   */
  notifyFeedbackUpdate(feedbackData) {
    this.broadcast({
      type: 'feedback_updated',
      data: feedbackData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get number of connected clients
   */
  getClientCount() {
    return this.clients.size;
  }
}

// Create singleton instance
const sseService = new SSEService();

module.exports = sseService;