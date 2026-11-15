const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateReview = async (req, res) => {
  const { businessName, category, tags, rating, cafeName, selectedTag } = req.body;

  try {
    const finalName = businessName || cafeName || "this place";
    const finalTags = tags || (selectedTag ? [selectedTag] : []);
    const finalRating = rating || 5;
    
    // 🌟 FIX 1: Prevent AI from assuming it's a specific food joint just because it says 'cafe'
    const finalCategory = (category === 'cafe') ? 'restaurant/food spot' : (category || 'business');

    if (!finalName || finalTags.length === 0) {
      return res.status(400).json({ success: false, message: "Business name and at least one tag are required." });
    }

    // 🌟 FIX 2: Changed gemini-3.8-flash (invalid) to gemini-1.5-flash
    // 🌟 FIX 3: Added temperature 0.9 for more unique and diverse reviews
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { temperature: 0.9 }
    });

    // 🌟 FIX 4: Strict Anti-Hallucination & Anti-Repetition Prompt
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
    
    // Remove unwanted markdown artifacts like quotes or bolding
    let generatedText = result.response.text().replace(/["*]/g, "").trim(); 

    res.status(200).json({ 
      success: true, 
      reviewText: generatedText,
      isFallback: false 
    });

  } catch (error) {
    console.error("AI Error or Timeout:", error.message);
    
    const finalNameFallback = businessName || cafeName || "this place";
    const cleanTags = finalTags.map(tag => tag.replace(/[\u1000-\uFFFF]+/g, "").trim()).join(" aur ");
    
    // 🌟 FIX 5: 5 Unique Fallback structures
    const fallbackTemplates = [
      `Bohot hi badhiya experience raha ${finalNameFallback} mein! Yahan ka ${cleanTags} sach mein lajawab hai. Must visit! 🌟`,
      `Quality aur service dono ekdum top-notch. ${finalNameFallback} ne dil khush kar diya, especially inka ${cleanTags}. 💯`,
      `${finalNameFallback} is absolutely amazing. ${cleanTags} ke liye toh 100/100 points! Highly recommended. 🔥`,
      `Paisa vasool jagah! Loved the ${cleanTags} at ${finalNameFallback}. Doston ke sath aane ke liye best hai. 👌`,
      `Service se lekar taste tak, sab perfect. ${cleanTags} bohot pasand aaya ${finalNameFallback} ka. Will come back soon! ✨`
    ];

    const randomIndex = Math.floor(Math.random() * fallbackTemplates.length);
    const finalReview = fallbackTemplates[randomIndex];

    res.status(200).json({ 
      success: true, 
      reviewText: finalReview,
      isFallback: true 
    });
  }
};

module.exports = { generateReview };