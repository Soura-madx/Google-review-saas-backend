const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateReview = async (req, res) => {
  const { businessName, category, tags, rating, cafeName, selectedTag } = req.body;

  // 🌟 FIX 1: In variables ko try block ke BAHAR rakha gaya hai
  const finalName = businessName || cafeName || "this place";
  const finalTags = tags || (selectedTag ? [selectedTag] : []);
  const finalRating = rating || 5;
  const finalCategory = (category === 'cafe') ? 'restaurant/food spot' : (category || 'business');

  try {
    if (!finalName || finalTags.length === 0) {
      return res.status(400).json({ success: false, message: "Business name and at least one tag are required." });
    }

    const model = genAI.getGenerativeModel({ 
        model: "gemini-3.8-flash",
        generationConfig: { temperature: 0.9 }
    });

    const prompt = `Write a highly authentic, real-sounding Google Maps review for a ${finalCategory} named "${finalName}". 
    The user gave a ${finalRating}-star rating and their highlights were: "${finalTags.join(', ')}".

    CRITICAL RULES YOU MUST STRICTLY FOLLOW:
    1. NO ASSUMPTIONS (ANTI-HALLUCINATION): Do NOT invent specific dishes, products, or drinks (like burgers, coffee, pizza, etc.) UNLESS they are explicitly mentioned in the highlights. If food is mentioned generally, just use words like "food", "meal", or "dishes".
    2. NO SPECIFIC LABELS: Do not strictly call it a "cafe" if it might be a restaurant. Just use the business name or call it a "spot", "place", or "restaurant".
    3. EXTREME VARIETY: Never use standard AI openings like "I recently visited", "I had a great time", or "This place is...". Start directly with a compliment, a unique phrase, or by mentioning the vibe/food immediately. Make every generation structurally different.
    4. TONE: Casual, conversational, and natural. Use a mix of English and very light Hinglish (if it fits). Sound like a real local customer, not a robot.
    5. FORMAT: 2 to 3 sentences maximum. Keep it punchy. Add 1 or 2 natural emojis. Do not use quotes or asterisks.`;

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI_TIMEOUT')), 15000)
    );

    const aiPromise = model.generateContent(prompt);
    
    const result = await Promise.race([aiPromise, timeoutPromise]);
    
    let generatedText = result.response.text().replace(/["*]/g, "").trim(); 

    res.status(200).json({ 
      success: true, 
      reviewText: generatedText,
      isFallback: false 
    });

  } catch (error) {
    console.error("AI Error or Timeout:", error.message);
    
    // 🌟 FIX 2: Ab ye catch block bina crash huye perfectly chalega
    const cleanTags = finalTags.map(tag => tag.replace(/[\u1000-\uFFFF]+/g, "").trim()).join(" aur ");
    
    const fallbackTemplates = [
      `Bohot hi badhiya experience raha ${finalName} mein! Yahan ka ${cleanTags} sach mein lajawab hai. Must visit! 🌟`,
      `Quality aur service dono ekdum top-notch. ${finalName} ne dil khush kar diya, especially inka ${cleanTags}. 💯`,
      `${finalName} is absolutely amazing. ${cleanTags} ke liye toh 100/100 points! Highly recommended. 🔥`,
      `Paisa vasool jagah! Loved the ${cleanTags} at ${finalName}. Doston ke sath aane ke liye best hai. 👌`,
      `Service se lekar taste tak, sab perfect. ${cleanTags} bohot pasand aaya ${finalName} ka. Will come back soon! ✨`
    ];

    const randomIndex = Math.floor(Math.random() * fallbackTemplates.length);
    const finalReview = fallbackTemplates[randomIndex];

    // AI fail hone par bhi customer ko Fallback Text chala jayega bina error ke
    res.status(200).json({ 
      success: true, 
      reviewText: finalReview,
      isFallback: true 
    });
  }
};

module.exports = { generateReview };