const Anthropic = require('@anthropic-ai/sdk');

// create one shared Anthropic client
// reads API key from .env automatically
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// imageUrl = the ImageKit URL we just uploaded
// returns  = { captions, mood, qualityScore }
const analyseImage = async (imageUrl) => {

  const response = await anthropic.messages.create({
    model:      'claude-opus-4-6',
    max_tokens: 1024,

    messages: [
      {
        role: 'user',
        content: [
          // PART 1 — send the actual image
          // Claude can see images from URLs directly
          {
            type:   'image',
            source: {
              type: 'url',
              url:  imageUrl
            }
          },

          // PART 2 — tell Claude exactly what to return
          // We tell it to return ONLY raw JSON
          // no extra text, no markdown, no explanation
          // just the JSON object we can parse
          {
            type: 'text',
            text: `Analyse this photo and respond ONLY with raw JSON.
No markdown, no backticks, no explanation. Just this exact structure:

{
  "captions": [
    "first caption — poetic, 8-15 words",
    "second caption — different feeling from first",
    "third caption — more minimal or abstract"
  ],
  "mood": ["mood1", "mood2"],
  "qualityScore": 0
}

Caption rules:
- Write like a photography magazine editor
- Capture feeling, not just what you see
- Never start with "A photo of" or "This image shows"
- Good examples:
  "Golden hour dissolving into stone"
  "The city held its breath at 4am"
  "Where the light goes to rest"

Mood rules — pick 1 to 3 from this list only:
serene, melancholy, electric, nostalgic, ethereal,
raw, tender, haunting, joyful, desolate, intimate, expansive

Quality score rules:
- Integer from 0 to 100
- Consider: sharpness, exposure, composition, framing
- 75-100 = excellent, publish worthy
- 50-74  = acceptable, minor issues
- 0-49   = too blurry, dark, or low resolution`
          }
        ]
      }
    ]
  });

  // response.content[0].text is the raw JSON string Claude returned
  const rawText = response.content[0].text;

  // parse the JSON string into a JavaScript object
  // wrapped in try/catch because if Claude returns
  // unexpected text we don't want the upload to crash
  try {
    const result = JSON.parse(rawText);

    return {
      captions:     Array.isArray(result.captions)          ? result.captions     : [],
      mood:         Array.isArray(result.mood)               ? result.mood         : [],
      qualityScore: typeof result.qualityScore === 'number'  ? result.qualityScore : 50
    };

  } catch (err) {
    // Claude returned something unexpected
    // return safe defaults so the upload still works
    console.error('Claude parse error:', rawText);
    return {
      captions:     ['A moment worth keeping', 'Light and time', 'Still life'],
      mood:         ['serene'],
      qualityScore: 50
    };
  }
};

module.exports = { analyseImage };