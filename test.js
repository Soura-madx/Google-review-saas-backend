require('dotenv').config();

async function checkModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        
        console.log("Aapki API key ke liye yeh models available hain:");
        const generateModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
        generateModels.forEach(m => console.log(m.name));
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

checkModels();