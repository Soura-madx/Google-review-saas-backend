const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini with the standard environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateReview = async (req, res) => {
  const { cafeName, selectedTag } = req.body;

  try {
    // Validation
    if (!cafeName || !selectedTag) {
      return res.status(400).json({ success: false, message: "Cafe name and tag are required." });
    }

    // Use the highly responsive 3.8-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });

    // AI Prompt
    const prompt = `You are a real customer leaving a 5-star Google review for a cafe/restaurant named "${cafeName}". The highlight of your experience was: "${selectedTag}". Rules: Short (2-3 lines), natural Hinglish, SEO keywords like "best cafe", 1-2 emojis. NO hashtags.`;

    // SaaS Level Fix: 7-second Timeout logic to ensure fast UI response
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI_TIMEOUT")), 7000)
    );
    const aiPromise = model.generateContent(prompt);

    // Race the AI against the 7-second timer
    const result = await Promise.race([aiPromise, timeoutPromise]);
    const response = result.response.text();

    return res.status(200).json({ 
        success: true, 
        review: response, 
        isFallback: false 
    });

  } catch (error) {
    console.error("AI Error or Timeout triggered Fallback:", error.message);

    // Fallback System: 20 Premium Generic Hinglish Reviews
    const fallbackReviews = [
      `Bohot hi badhiya experience tha ${cafeName} mein! Sab kuch ekdum lajawab tha. Best cafe in town! 🍔🔥`,
      `${cafeName} ka ambience bohot relaxing hai aur service bhi top-notch thi. Highly recommended! ☕✨`,
      `Khana itna tasty tha ki maza aa gaya. ${cafeName} is genuinely a great spot for foodies! 🍕👌`,
      `Dosto ke sath hangout karne ke liye ${cafeName} ekdum perfect jagah hai. Vibe bohot chill hai yahan ki. 🥂😎`,
      `Paisa vasool experience! Portion size kaafi achha hai aur taste best tha. Will visit ${cafeName} again! 🍝💰`,
      `Taste ekdum authentic tha. Mujhe ${cafeName} ka khana aur hospitality bohot pasand aayi. ☕❤️`,
      `Interior bohot aesthetic hai, perfect for Instagram photos. Food is also really good. 📸🍔`,
      `Staff ka behaviour bohot polite tha. Hospitality top-notch hai ${cafeName} ki. 🌟🙌`,
      `Vibe ekdum set thi yahan. Best cafe for weekends, inka taste sach me mind-blowing hai! 🎶🥳`,
      `Hygiene aur cleanliness ka bohot dhyan rakha gaya hai ${cafeName} mein. Food presentation kamaal ki thi. 🥗✨`,
      `Family ke sath time spend karne ke liye best place hai. Sabko yahan aakar bohot pasand aaya. Highly satisfied! 🥘👨‍👩‍👧‍👦`,
      `Agar aapko achha khana khana hai toh ${cafeName} zaroor try karein, mind-blowing taste tha! Definitely coming back. 🤤🔥`,
      `Quiet aur peaceful environment. Great taste aur service. ${cafeName} is simply amazing. 💻☕`,
      `Quick bite ke liye bohot achha option hai. Fresh aur garam khana serve karte hain hamesha. 🥪👍`,
      `Customer service itni achhi hai ki aapko special feel hoga. Best cafe experience in the area! 🏆😊`,
      `Taste to die for hai! Jab bhi kuch achha khane ka man ho toh ${cafeName} zaroor aayein. 🍨🍫`,
      `Ekdum hidden gem hai ${cafeName}. Taste, quality aur service me koi compromise nahi hai. 💎🍝`,
      `Seating arrangement bohot comfortable hai. Apni pasand ka khana enjoy karne ke liye perfect setup hai. 🛋️🍕`,
      `Fresh ingredients use karte hain, jo khane ke taste se clearly pata chalta hai. Brilliant! 🌿👌`,
      `Har baar aane par same consistent taste milta hai. ${cafeName} mera all-time favorite ban gaya hai ab. ❤️🍔`
    ];

    // Pick a random review from the 20 available options
    const randomReview = fallbackReviews[Math.floor(Math.random() * fallbackReviews.length)];

    return res.status(200).json({
      success: true,
      review: randomReview,
      isFallback: true
    });
  }
};

module.exports = { generateReview };