const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

// डेटाबेस से कनेक्ट करने का फंक्शन
const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    }
};

// मूवी का Schema (संरचना)
const MovieSchema = new mongoose.Schema({
    title: String,
    description: String,
    link480p: String,
    link720p: String,
    link1080p: String,
    telegramLink: String,
    createdAt: { type: Date, default: Date.now }
});

// मॉडल, यह सुनिश्चित करता है कि मॉडल दोबारा न बने
const Movie = mongoose.models.Movie || mongoose.model('Movie', MovieSchema);

// मुख्य सर्वरलेस फंक्शन
module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        await connectDB();
        
        const movie = new Movie(req.body);
        await movie.save();

        // सफलतापूर्वक सेव होने पर एडमिन डैशबोर्ड पर वापस भेजें
        res.writeHead(302, { Location: '/admin-dashboard.html?status=success' });
        res.end();

    } catch (error) {
        console.error("Error saving movie:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
