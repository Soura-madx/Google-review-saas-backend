const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateReview = async (req, res) => {
  // 🌟 FIX: variables ko try block ke bahar define karein taki catch block bhi inhe dekh sake!
  const { cafeName, selectedTag } = req.body;

  try {
    if (!cafeName || !selectedTag) {
      return res.status(400).json({ success: false, message: "Cafe name and tag are required." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `You are a real customer leaving a 5-star Google review for a cafe/restaurant named "${cafeName}". 
    The highlight of your experience was: "${selectedTag}". 
    Rules: Short (2 lines), natural Hinglish, SEO keywords like "best cafe", 1-2 emojis, NO hashtags.`;

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI_TIMEOUT')), 6000)
    );

    const aiPromise = model.generateContent(prompt);
    
    // Race lagwao
    const result = await Promise.race([aiPromise, timeoutPromise]);
    const generatedText = result.response.text();

    res.status(200).json({ 
      success: true, 
      reviewText: generatedText.trim() 
    });

  } catch (error) {
    console.error("AI Error or Timeout:", error.message);
    
    // 🌟 FALLBACK REVIEWS 
    const fallbackReviews = {
      "Delicious Food 😋": [
        `${cafeName} ka food seriously bohot delicious hai! Definitely city ka best food. Highly recommended! 😋🥘`,
        `Craving satisfied! ${cafeName} me khana ekdum fresh aur tasty tha. 🍔✨`
      ],
      "Great Vibe & Aesthetic ✨": [
        `${cafeName} ka vibe aur aesthetic ekdum top-notch hai. Doston ke sath chill karne ke liye best cafe! ✨`,
        `Perfect aesthetic aur relaxing vibe at ${cafeName}. Highly recommend! 📸🌟`
      ],
      "Best Coffee in Town ☕": [
        `Agar aapko acchi coffee chahiye, toh ${cafeName} is the must-visit place. Amazing taste! ☕`,
        `Best coffee experience in the city! Love it here at ${cafeName}. ☕❤️`
      ],
      "Amazing Service 🤝": [
        `${cafeName} ki service aur staff bohot polite hain. Great experience! 🤝`,
        `Super fast service aur welcoming staff. ${cafeName} is simply the best. 💯🙌`
      ]
    };

    // Randomization Logic
    const selectedArray = fallbackReviews[selectedTag] || fallbackReviews["Great Vibe & Aesthetic ✨"];
    const randomIndex = Math.floor(Math.random() * selectedArray.length);
    const finalReview = selectedArray[randomIndex];

    // Status 200 hi jayega taki customer ka page crash na ho
    res.status(200).json({ 
      success: true, 
      reviewText: finalReview,
      isFallback: true 
    });
  }
};

module.exports = { generateReview };