const Groq = require("groq-sdk");

// Check if GROQ_API_KEY is properly configured
if (
  !process.env.GROQ_API_KEY ||
  process.env.GROQ_API_KEY === "your-groq-api-key-here"
) {
  console.warn(
    "⚠️  GROQ_API_KEY not properly configured. Please set a valid API key in .env file",
  );
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "your-groq-api-key-here",
});

const generateJobDescription = async (req, res) => {
  try {
    // Log the incoming request for debugging
    console.log("🤖 AI Generate Job Description Request:", {
      title: req.body.title,
      hasApiKey:
        !!process.env.GROQ_API_KEY &&
        process.env.GROQ_API_KEY !== "your-groq-api-key-here",
    });

    // Check API key
    if (
      !process.env.GROQ_API_KEY ||
      process.env.GROQ_API_KEY === "your-groq-api-key-here"
    ) {
      return res.status(500).json({
        success: false,
        error: "GROQ API key not configured. Please contact administrator.",
      });
    }
    const {
      title,
      companyName,
      location,
      employmentType,
      experienceLevel,
      skills,
      salaryMin,
      salaryMax,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Job title is required",
      });
    }

    // Create a prompt for local business job description
    const prompt = `Generate a simple, professional job description for a local business. Keep it concise and practical.

Job Details:
- Title: ${title}
- Company: ${companyName || "Local Business"}
- Location: ${location || "Local Area"}
- Employment Type: ${employmentType || "Full Time"}
- Experience Level: ${experienceLevel || "Entry Level"}
- Skills Required: ${skills || "Will train"}
- Salary Range: ${salaryMin && salaryMax ? `₹${salaryMin} - ₹${salaryMax}` : "Competitive salary"}

Create a job description that includes:
1. Brief company introduction (2-3 lines)
2. Job overview and main responsibilities (4-5 bullet points)
3. Required qualifications (3-4 points, keep basic)
4. What we offer (2-3 benefits)

Keep the language simple, friendly, and suitable for local candidates. Focus on growth opportunities and practical skills. Maximum 200 words.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that creates simple, clear job descriptions for local businesses. Keep descriptions concise, practical, and friendly.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 500,
    });

    const generatedDescription = completion.choices[0]?.message?.content;

    if (!generatedDescription) {
      throw new Error("Failed to generate job description");
    }

    res.json({
      success: true,
      data: {
        description: generatedDescription.trim(),
      },
    });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate job description",
    });
  }
};

const generateCandidateAbout = async (candidatePreferences) => {
  try {
    if (
      !process.env.GROQ_API_KEY ||
      process.env.GROQ_API_KEY === "your-groq-api-key-here"
    ) {
      console.warn(
        "GROQ API key not configured. Skipping AI-generated about section.",
      );
      return null;
    }

    const {
      jobTitles = [],
      industry = [],
      jobTypes = [],
      experienceLevel = "",
      skills = [],
      languages = [],
      currentEmploymentStatus = "",
      shiftPreference = "",
      location = "",
      salaryExpectation = null,
    } = candidatePreferences;

    const skillNames = skills
      .map((skill) =>
        typeof skill === "object" ? skill.name || skill.id : skill,
      )
      .filter(Boolean);

    const salaryText =
      salaryExpectation && (salaryExpectation.min || salaryExpectation.max)
        ? `Salary expectation: ₹${salaryExpectation.min || "Flexible"} - ₹${salaryExpectation.max || "Negotiable"}`
        : "";

    // 🔑 Changed prompt to enforce ONE short output
    const prompt = `Write a single, very short professional summary as if the candidate wrote it themselves. 
Do not explain, do not say "Here is" or "Option". 
Output only the summary in one sentence, under 30 words.

Candidate Profile:
- Target Role: ${jobTitles.slice(0, 1).join("") || "Professional"}
- Experience Level: ${experienceLevel || "Entry level"}
- Top Skills: ${skillNames.slice(0, 3).join(", ") || "various skills"}
- Industry: ${industry.slice(0, 1).join("") || "multiple sectors"}

Format exactly as:
"[Experience level] [Role] with expertise in [skills]"`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert career coach. Always respond with only the candidate's professional summary in one sentence. Never include explanations, options, or extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      max_tokens: 60,
    });

    const generatedAbout = completion.choices[0]?.message?.content;

    if (!generatedAbout) {
      console.warn("Failed to generate candidate about section");
      return null;
    }

    const cleanedAbout = generatedAbout
      .trim()
      .replace(/^["']|["']$/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ");

    return cleanedAbout;
  } catch (error) {
    console.error("AI Generate Candidate About Error:", error);
    return null;
  }
};

module.exports = {
  generateJobDescription,
  generateCandidateAbout,
};
