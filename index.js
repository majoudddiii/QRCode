const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const QRCode = require('qrcode');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require('./database'); // Import the database

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'uploads'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext);
    }
});
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.render('form');
});

app.post('/submit', upload.single('photo'), async (req, res) => {
    const id = uuidv4();
    const { name, email, major, semester, year, month, day } = req.body;
    const birthday = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    // Save user data in SQLite
    db.run(
        `INSERT INTO users (id, name, email, major, semester, birthday, photo) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name, email, major, semester, birthday, photo],
        async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error.');
            }

            const profileUrl = `${req.protocol}://${req.get('host')}/profile/${id}`;
            try {
                const qr = await QRCode.toDataURL(profileUrl);
                res.render('qr', { qrCode: qr, profileUrl });
            } catch (err) {
                console.error(err);
                res.status(500).send('Failed to generate QR Code.');
            }
        }
    );
});

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM users WHERE id = ?`, [id], async (err, user) => {
        if (err || !user) {
            return res.status(404).send('Profile not found.');
        }

        const profileUrl = `${req.protocol}://${req.get('host')}/profile/${id}`;
        try {
            const qr = await QRCode.toDataURL(profileUrl);
            res.render('profile', { user, qrCode: qr });
        } catch (err) {
            console.error(err);
            res.status(500).send('Failed to generate QR Code.');
        }
    });
});

app.get('/users', (req, res) => {
    const query = 'SELECT * FROM users';

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error fetching users.');
        } else {
            res.json(rows);
        }
    });
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
