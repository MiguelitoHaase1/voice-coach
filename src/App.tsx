import { Room, RoomEvent } from 'livekit-client';
import { useState, useCallback } from 'react';

const LIVEKIT_URL = 'wss://diaryagentv1-ldu5106b.livekit.cloud'; // Good, you already updated this!

function App() {
  const [room] = useState(() => new Room());
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('Disconnected');

  const connectToRoom = useCallback(async () => {
    try {
      setStatus('Generating token...');
      
      // Set up event handlers BEFORE connecting
      room.on(RoomEvent.Connected, () => {
        setStatus('Connected!');
        setConnected(true);
        console.log('Connected to room');
      });
      
      room.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log(`Participant joined: ${participant.identity}`);
      });
      
      room.on(RoomEvent.Disconnected, () => {
        setStatus('Disconnected');
        setConnected(false);
      });
      
      // Fetch token
      const response = await fetch('/api/token', { method: 'POST' });
      const { token } = await response.json();
      
      // NOW connect
      setStatus('Connecting...');
      await room.connect(LIVEKIT_URL, token);
      
    } catch (error) {
      setStatus(`Error: ${error}`);
      console.error('Connection failed:', error);
    }
  }, [room]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Voice Coach - Lesson 1</h1>
      <p>Status: {status}</p>
      <button 
        onClick={connectToRoom} 
        disabled={connected}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        {connected ? 'Connected' : 'Start Coaching Session'}
      </button>
      
      {connected && (
        <div style={{ marginTop: '20px' }}>
          <p>✅ Room connected! Check console for events.</p>
        </div>
      )}
    </div>
  );
}

export default App;