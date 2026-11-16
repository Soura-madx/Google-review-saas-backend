const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateReview = async (req, res) => {
  const { businessName, category, tags, rating, cafeName, selectedTag } = req.body;

  const finalName = businessName || cafeName || "this place";
  const finalTags = tags || (selectedTag ? [selectedTag] : []);
  const finalRating = rating || 5;
  
  // 🌟 FIX: Hotel aur Cafe dono ki category properly mask ho jayegi
  let finalCategory = 'business';
  if (category === 'cafe') finalCategory = 'restaurant/food spot';
  if (category === 'hotel') finalCategory = 'hotel/resort/property';

  try {
    if (!finalName || finalTags.length === 0) {
      return res.status(400).json({ success: false, message: "Business name and tags are required." });
    }

    const model = genAI.getGenerativeModel({ 
        model: "gemini-3.8-flash",
        generationConfig: { temperature: 0.9 }
    });

    // 🌟 SMART PROMPT FOR HOTELS & RESTAURANTS
    const prompt = `Write a highly authentic, real-sounding Google Maps review for a ${finalCategory} named "${finalName}". 
    The user gave a ${finalRating}-star rating and their highlights were: "${finalTags.join(', ')}".

    CRITICAL RULES YOU MUST STRICTLY FOLLOW:
    1. NO HALLUCINATION: Do NOT invent specific products, dishes (like burgers, coffee), or hotel amenities (like swimming pools, spa, complimentary breakfast, beach views) UNLESS they are explicitly mentioned in the highlights. 
    2. CONTEXT AWARENESS: If the business is a hotel/resort, talk about the "stay", "property", or "rooms". If it is a restaurant, talk about the "meal", "food", or "dining". Do not mix them up.
    3. EXTREME VARIETY: Never use standard AI openings like "I recently visited", "I had a great stay", or "This place is...". Start directly with a compliment, a unique phrase, or by mentioning the vibe immediately. Make every generation structurally different.
    4. TONE: Casual, conversational, and natural. Use a mix of English and very light Hinglish (if it fits). Sound like a real local customer or traveler, not a robot.
    5. FORMAT: 2 to 3 sentences maximum. Keep it punchy. Add 1 or 2 natural emojis. Do not use quotes or asterisks.`;

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI_TIMEOUT')), 15000)
    );

    const aiPromise = model.generateContent(prompt);
    const result = await Promise.race([aiPromise, timeoutPromise]);
    let generatedText = result.response.text().replace(/["*]/g, "").trim(); 

    res.status(200).json({ success: true, reviewText: generatedText, isFallback: false });

  } catch (error) {
    console.error("AI Error or Timeout:", error.message);
    
    const finalNameFallback = businessName || cafeName || "this place";
    const cleanTags = finalTags.map(tag => tag.replace(/[\u1000-\uFFFF]+/g, "").trim()).join(" aur ");
    
    // Fallbacks updated to sound natural for both hotels and cafes
    const fallbackTemplates = [
      `Bohot hi badhiya experience raha ${finalNameFallback} mein! Yahan ka ${cleanTags} sach mein lajawab hai. Must visit! 🌟`,
      `Quality aur service dono ekdum top-notch. ${finalNameFallback} ne dil khush kar diya, especially inka ${cleanTags}. 💯`,
      `${finalNameFallback} is absolutely amazing. ${cleanTags} ke liye toh 100/100 points! Highly recommended. 🔥`,
      `Paisa vasool experience! Loved the ${cleanTags} at ${finalNameFallback}. Doston ke sath aane ke liye best hai. 👌`,
      `Service se lekar overall vibe tak, sab perfect. ${cleanTags} bohot pasand aaya ${finalNameFallback} ka. Will definitely come back! ✨`
    ];

    const finalReview = fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)];
    res.status(200).json({ success: true, reviewText: finalReview, isFallback: true });
  }
};

module.exports = { generateReview };