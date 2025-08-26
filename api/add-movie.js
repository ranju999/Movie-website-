const mongoose = require('mongoose');
const url = require('url');

const mongoURI = process.env.MONGO_URI;

// डेटाबेस से कनेक्ट करने के लिए एक फंक्शन
const connectDB = async () => {
    // अगर पहले से कनेक्टेड है, तो दोबारा कनेक्ट न करें
    if (mongoose.connection.readyState === 1) {
        return;
    }
    await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

// --- मूवी का Schema और Model ---
// mongoose.models.Movie || ... यह सुनिश्चित करता है कि मॉडल दोबारा न बने
const Movie = mongoose.models.Movie || mongoose.model('Movie', new mongoose.Schema({
    title: String,
    description: String,
    link480p: String,
    link720p: String,
    link1080p: String,
    telegramLink: String,
    createdAt: { type: Date, default: Date.now }
}));

// --- मुख्य सर्वरलेस फंक्शन ---
module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        await connectDB(); // डेटाबेस से कनेक्ट करें

        // req.body में फॉर्म से भेजा गया डेटा होगा
        const newMovieData = req.body;
        
        console.log("फॉर्म से डेटा मिला:", newMovieData);

        const movie = new Movie({
            title: newMovieData.movieTitle,
            description: newMovieData.description,
            link480p: newMovieData.link480p,
            link720p: newMovieData.link720p,
            link1080p: newMovieData.link1080p,
            telegramLink: newMovieData.telegramLink
        });

        await movie.save();

        // सफलतापूर्वक सेव होने पर यूजर को एडमिन डैशबोर्ड पर वापस भेजें
        res.writeHead(302, { Location: '/admin-dashboard.html' });
        res.end();

    } catch (error) {
        console.error("डेटाबेस में सेव करते समय त्रुटि:", error);
        res.status(500).json({ message: "सर्वर में कुछ खराबी हुई", error: error.message });
    }
};
