const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    }
};

const MovieSchema = new mongoose.Schema({
    title: String,
    description: String,
    link480p: String,
    link720p: String,
    link1080p: String,
    telegramLink: String,
    createdAt: { type: Date, default: Date.now }
});

const Movie = mongoose.models.Movie || mongoose.model('Movie', MovieSchema);

module.exports = async (req, res) => {
    // CORS Header
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        await connectDB();
        
        // सभी मूवीज को खोजें और नई मूवी को सबसे पहले दिखाएं
        const movies = await Movie.find({}).sort({ createdAt: -1 });
        
        res.status(200).json(movies);

    } catch (error) {
        console.error("Error fetching movies:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
