const express = require('express');
const path = require('path');
const cors = require("cors");
const AuthVerify = require('auth-verify');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: "https://jahongir2007.github.io",
}));

const auth = new AuthVerify();

const secret = auth.totp.secret(); // generating a secret for totp

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/qr', async (req, res)=>{
    try {        
        // making otpauth URI for QR code
        const uri = auth.totp.uri({
            label: "user@example.com",
            issuer: "Live demo of Auth-Verify",
            secret
        });

        // generating QR code
        const qr = await auth.totp.qr(uri);

        // We'll send this QR code to the client
        res.json({ qr });

    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Failed to generate QR' });
    }
});

app.post('/api/verify', async (req, res) => {
    const { code } = req.body; // we'll recieve code from client

    if (!code) { // for debugging...
        return res.status(400).json({ error: "No code provided" });
    }

    try {
        const verified = await auth.totp.verify(secret, code); // verifying user code
        res.json({ verified }); // and we'll send the result to the client
    } catch(err) {
        console.error(err);
        res.status(400).json({ error: "Verification failed", details: err.message });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
