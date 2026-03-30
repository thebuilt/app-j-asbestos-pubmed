// Note: In a production app, this logic should preferably live on a backend server to protect your API keys.

// Replace this placeholder with your actual OpenAI API Key later.
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE";

// A mock function for when the API key isn't provided
export const getAISummaryMock = (paper) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`This paper, titled "${paper.title}", explores critical findings in asbestos research. It details specific methodologies and results concerning health impacts, offering new insights into exposure risks and disease progression. The study emphasizes the importance of continued monitoring and potential treatment pathways for affected individuals. (This is a mock 60-word summary generated because no API key is present).`);
    }, 500);
  });
};

export const getAISchematicImageMock = (paper) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a random science-y looking placeholder image
      const randomId = Math.floor(Math.random() * 1000);
      resolve(`https://picsum.photos/seed/${randomId}/600/400`);
    }, 500);
  });
};

export const enhancePaperWithAI = async (paper) => {
  // Check if API key is not set
  if (!OPENAI_API_KEY || OPENAI_API_KEY === "YOUR_OPENAI_API_KEY_HERE") {
    // Use mock data
    const summary = await getAISummaryMock(paper);
    const imageUrl = await getAISchematicImageMock(paper);
    return { ...paper, aiSummary: summary, aiImage: imageUrl };
  }

  // Real API Logic (Uncomment and install `openai` npm package when ready)
  /*
  try {
    const summaryRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `Write a 60-word simple summary for a 5-year-old about this scientific paper title: "${paper.title}". Make it engaging and easy to understand.` }],
      })
    });
    const summaryData = await summaryRes.json();
    const summary = summaryData.choices[0].message.content;

    const imageRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        prompt: `A schematic diagram style illustration for a 5-year old explaining the scientific concept of: ${paper.title}`,
        n: 1,
        size: "512x512"
      })
    });
    const imageData = await imageRes.json();
    const imageUrl = imageData.data[0].url;

    return { ...paper, aiSummary: summary, aiImage: imageUrl };
  } catch(e) {
    console.error("Error with AI API", e);
    return { ...paper, aiSummary: "AI Summary Failed", aiImage: "https://via.placeholder.com/600x400.png?text=Error" };
  }
  */
};
