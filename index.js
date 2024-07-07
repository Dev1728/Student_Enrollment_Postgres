import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import pg from 'pg';

dotenv.config();
const app = express();

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// SQL part
const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
});

db.connect((err) => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to the database');
    }
});

// Routes
app.get('/', async (req, res) => {
    try {
        const query = 'SELECT s.name ,c.course_name FROM Students s JOIN course c ON s.user_id=c.user_id';
        const result = await db.query(query);
        const allRows = result.rows;
        console.log(allRows);
        res.render('index.ejs', { students: allRows });
    } catch (err) {
        console.log("Error fetching data of students", err.stack);
        res.render('index.ejs', { students: [] });
    }
});

app.post('/new', async (req, res) => {
    const { Name, Age, City ,Course,Id } = req.body;
    const query = `INSERT INTO students(name, age, city) VALUES($1, $2, $3) RETURNING *`;
    

    try {
        const studentResult = await db.query(query, [Name, Age, City]);
        const userId = req.body.Id;

        const insertCourseQuery = 'INSERT INTO Course(user_id, course_name) VALUES($1, $2)';
       const result= await db.query(insertCourseQuery, [userId, Course]);
        
        console.log('Student and course added successfully');
    } catch (err) {
        console.log("Failed to add student", err.stack);
    }
    res.redirect('/');
});

// Server
app.listen(3000, () => {
    console.log("Server is running on port 3000...");
});
