const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateReview = async (req, res) => {
  try {
    const { cafeName, selectedTag } = req.body;

    if (!cafeName || !selectedTag) {
      return res.status(400).json({ success: false, message: "Cafe name and tag are required." });
    }

    // "lite" models sabse fast hote hain, apne available models me se fast wala choose karein
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" }); 

    const prompt = `You are a real customer leaving a 5-star Google review for a cafe/restaurant named "${cafeName}". 
    The highlight of your experience was: "${selectedTag}". 
    Rules: Short (2 lines), natural Hinglish, SEO keywords like "best cafe", 1-2 emojis, NO hashtags.`;

    // 🌟 FALLBACK REVIEWS: Agar AI latak jaye, toh inme se ek bhej do
    const fallbackReviews = {
      "Delicious Food 😋": [
        `${cafeName} ka food seriously bohot delicious hai! Definitely city ka best food. Highly recommended! 😋🥘`,
        `Craving satisfied! ${cafeName} me khana ekdum fresh aur tasty tha. Must visit restaurant in town. 🍔✨`,
        `Quality aur taste dono amazing. Yeh definitely mera favorite spot ban gaya hai. Best food quality! 🍝🔥`,
        `Agar real taste dhoondh rahe ho toh ${cafeName} is the best place. Khana ekdum lajawab tha. 🍕👌`
      ],
      "Great Vibe & Aesthetic ✨": [
        `${cafeName} ka vibe aur aesthetic ekdum top-notch hai. Doston ke sath chill karne ke liye best cafe! ✨`,
        `Ambience bohot hi soothing aur beautiful hai. Instagram photos ke liye best place. Highly recommend! 📸🌟`,
        `Perfect aesthetic aur relaxing vibe. Evening spend karne ke liye town ka best cafe hai yeh. 🌆💖`,
        `Great interior aur cozy atmosphere. ${cafeName} is truly a hidden gem! ✨🪴`
      ],
      "Best Coffee in Town ☕": [
        `Agar aapko acchi coffee chahiye, toh ${cafeName} is the must-visit place. Amazing taste! ☕`,
        `Best coffee experience in the city! Barista ne perfect blend banaya tha. Love it. ☕❤️`,
        `Mera din ban gaya inki coffee peekar. Definitely the best coffee shop around here. ☕✨`,
        `Perfect aroma aur perfect taste. ${cafeName} ki coffee is just mind-blowing. Top tier! ☕🔥`
      ],
      "Amazing Service 🤝": [
        `${cafeName} ki service aur staff bohot polite hain. Great experience and amazing hospitality! 🤝`,
        `Super fast service aur welcoming staff. Is restaurant ki customer service city me best hai. 💯🙌`,
        `Staff bohot helpful aur attentive tha. Overall amazing experience at ${cafeName}. ⭐⭐⭐⭐⭐`,
        `Service ekdum prompt thi. Everything was perfectly managed. Highly recommended place! 🤝✨`
      ]
    };
    // ⏱️ TIMEOUT LOGIC: AI ko sirf 6 seconds ka time milega
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI_TIMEOUT')), 6000)
    );

    // AI API Call
    const aiPromise = model.generateContent(prompt);

    // Race lagwao: Jo pehle complete hoga (AI ya 6 sec ka Timeout), wo jeetega
    const result = await Promise.race([aiPromise, timeoutPromise]);
    const generatedText = result.response.text();

    res.status(200).json({ 
      success: true, 
      reviewText: generatedText.trim() 
    });

  } catch (error) {
    console.error("AI Error or Timeout:", error.message);
    
    // Agar AI fail hua ya 6 second se zyada time liya, toh Fallback Review bhej do
    const defaultFallback = `${cafeName} ek bohot badhiya jagah hai. Great food aur amazing vibe, must visit! ✨`;
    const finalReview = fallbackReviews[req.body.selectedTag] || defaultFallback;

    // Status 200 hi bhejenge taki customer ko error na dikhe
    res.status(200).json({ 
      success: true, 
      reviewText: finalReview,
      isFallback: true // Frontend ko batane ke liye (optional)
    });
  }
};

module.exports = { generateReview };