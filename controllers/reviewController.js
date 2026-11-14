const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateReview = async (req, res) => {
  // 🌟 NEW: Ab hume Array of tags, rating, aur category bhi milegi
  const { businessName, category, tags, rating, cafeName, selectedTag } = req.body;

  try {
    // Backward compatibility (agar kisi purane QR code se request aaye toh crash na ho)
    const finalName = businessName || cafeName;
    const finalTags = tags || (selectedTag ? [selectedTag] : []);
    const finalRating = rating || 5;
    const finalCategory = category || 'cafe';

    if (!finalName || finalTags.length === 0) {
      return res.status(400).json({ success: false, message: "Business name and at least one tag are required." });
    }

    // Standard Gemini 1.5 Flash Model
    const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });

    // 🌟 SMART PROMPT: Ab yeh kisi bhi category (Salon, Gym, Clinic) ke hisaab se review likhega
    const prompt = `You are a real customer leaving a ${finalRating}-star Google review for a ${finalCategory} business named "${finalName}". 
    The highlights of your experience were: "${finalTags.join(', ')}". 
    Rules: Short (2-3 lines), natural conversational Hinglish, SEO keywords for local business, 1-2 emojis, NO hashtags.`;

    // 15 seconds Timeout Logic
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI_TIMEOUT')), 15000)
    );

    const aiPromise = model.generateContent(prompt);
    
    // Race lagwao
    const result = await Promise.race([aiPromise, timeoutPromise]);
    const generatedText = result.response.text();

    res.status(200).json({ 
      success: true, 
      reviewText: generatedText.trim(),
      isFallback: false 
    });

  } catch (error) {
    console.error("AI Error or Timeout:", error.message);
    
    // 🌟 DYNAMIC FALLBACK: Ab 10 categories hain, isliye static text ki jagah 
    // hum "Tags" ko mila kar ek smart fallback sentence banayenge.
    
    const finalNameFallback = businessName || cafeName || "this place";
    const cleanTags = finalTags.map(tag => tag.replace(/[\u1000-\uFFFF]+/g, "").trim()).join(" aur ");
    
    const fallbackTemplates = [
      `Mera experience ${finalNameFallback} me sach me amazing tha! Inka ${cleanTags} bohot pasand aaya. Definitely recommended! 🌟`,
      `${finalNameFallback} ki service ekdum top-class hai. Khaas kar ${cleanTags} ne toh dil jeet liya. Highly recommended! 💯`,
      `Agar aap ek acchi jagah dhund rahe hain, toh ${finalNameFallback} is the best! ${cleanTags} ke liye ${finalRating}/5 stars. 👌`,
      `Very happy with the service at ${finalNameFallback}! The highlights were the ${cleanTags}. Zarur visit karein! ✨`,
      `Quality aur service me koi compromise nahi. ${finalNameFallback} me experience bohot badhiya raha, especially ${cleanTags}. 👏`
    ];

    // Pick a random fallback
    const randomIndex = Math.floor(Math.random() * fallbackTemplates.length);
    const finalReview = fallbackTemplates[randomIndex];

    // Status 200 hi jayega taki customer ka page na fasa rahe
    res.status(200).json({ 
      success: true, 
      reviewText: finalReview,
      isFallback: true 
    });
  }
};

module.exports = { generateReview };