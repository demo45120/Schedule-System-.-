const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1vU_n01bnUwy03wFXhrG0aiHjsB_JHDUZ3bxTB1MKhok';

sheets.spreadsheets.values.get({
  spreadsheetId: SPREADSHEET_ID,
  range: 'users!A:F'
}, (err, res) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
  const rows = res.data.values;
  if (!rows) {
    console.log('No data found');
    process.exit(0);
  }
  console.log('=== ALL USERS ===');
  console.log('Total:', rows.length - 1, 'users\n');
  
  rows.slice(1, 10).forEach((r, i) => {
    console.log(`${i+1}. Username: ${r[0]}`);
    console.log(`   Fullname: ${r[2]}`);
    console.log(`   Hash: ${r[1]}`);
    console.log(`   Approved: ${r[4]}\n`);
  });
  process.exit(0);
});
