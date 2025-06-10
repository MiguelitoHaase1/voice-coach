const { AccessToken } = require('livekit-server-sdk');

const API_KEY = 'APIgeATUYMh6tEa';    // <-- YOUR REAL KEY
const API_SECRET = 'fkf6NlI9fTAdvMOFxGm4W5tsUueVAjAOu70Lhb7eMXUA';  // <-- YOUR REAL SECRET

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