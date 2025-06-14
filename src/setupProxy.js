const { AccessToken } = require('livekit-server-sdk');

// Load from environment variables
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;

// Fail early if credentials are missing
if (!API_KEY || !API_SECRET) {
  console.error('ERROR: LiveKit credentials not found in environment variables');
  console.error('Make sure LIVEKIT_API_KEY and LIVEKIT_API_SECRET are set in .env file');
  process.exit(1);
}


module.exports = function(app) {
  app.post('/api/token', async (req, res) => {  // <-- Note: async
    try {
      console.log('Token endpoint called');
      
      const at = new AccessToken(API_KEY, API_SECRET, {
        identity: 'user-' + Math.random().toString(36).substring(7),
      });
      
      at.addGrant({ 
        roomJoin: true, 
        room: 'coaching-room',
        canPublish: true,
        canSubscribe: true 
      });
      
      // In v2.x, toJwt() returns a Promise
      const token = await at.toJwt();  // <-- Note: await
      
      console.log('Token generated successfully');
      console.log('Token preview:', token.substring(0, 50) + '...');
      
      res.json({ token });
      
    } catch (error) {
      console.error('Token generation failed:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
};