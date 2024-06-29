import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    console.log("Received request body:", JSON.stringify(req.body));

    const { image } = req.body;

    if (!image) {
      throw new Error("No image data provided");
    }

    // Remove the data URL prefix
    const base64Image = image.split(",")[1];

    // Create a GenerativeModel instance
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    console.log("Sending request to Gemini AI");

    // Analyze the image
    const result = await model.generateContent([
      "Does this image show a shirt that matches the following description: shirt colour is red",
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ]);

    console.log("Received response from Gemini AI");

    const generatedText = result.response.text();
    console.log("Generated text:", generatedText);

    const matches =
      generatedText.toLowerCase().includes("yes") ||
      generatedText.toLowerCase().includes("match");

    res.status(200).json({ matches });
  } catch (error) {
    console.error("Error in API route:", error);
    res
      .status(500)
      .json({ message: `Error analyzing image: ${error.message}` });
  }
}
