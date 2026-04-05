const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();

// Allow requests from your frontend
app.use(cors());
app.use(express.json());

// Set up Google Sheets Authentication
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: credentials.client_email,
    private_key: credentials.private_key,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// API Endpoint to receive data
app.post('/api/submit', async (req, res) => {
  try {
    const { name, department, start, stop, continue: continueHabit, timestamp } = req.body;

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A:F', // Change 'Sheet1' if your tab is named differently
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, name, department, start, stop, continueHabit]],
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Simple health check route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));