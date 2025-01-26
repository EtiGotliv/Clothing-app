const express = require('express')
const app = express()
const cors = require('cors')
const corsOptions = {
    origin:"http://localhost:5173",
}

app.use(cors(corsOptions))

app.get('/api', (req, res) => {
    res.json({ fruits: ["apple", "orange", "banana"] });
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});