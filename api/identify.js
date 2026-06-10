// ViSnap — Serverless API function
// Deployed on Vercel. Your ANTHROPIC_API_KEY lives here, never in the browser.

export const config = { maxDuration: 30 };

const SYSTEM_PROMPT = `You are ViSnap, an expert at identifying movies, TV shows, and scenes from screenshots or descriptions. Always respond ONLY with valid JSON — no markdown, no code blocks, no extra text.`;

const USER_PROMPT = (desc) => `
Identify the movie or TV show${desc ? ` from this description: "${desc}"` : ' in this image'}.

Respond ONLY with valid JSON in this exact format:
{
  "title": "Exact movie or show title",
  "type": "Movie or TV Show",
  "year": "Release year or year range",
  "genre": ["Genre1", "Genre2"],
  "confidence": "High / Medium / Low",
  "scene": "Brief description of this specific scene and what's happening",
  "season_episode": "Season X, Episode Y — or N/A for movies",
  "rating": "IMDb rating out of 10, e.g. 8.4",
  "cast": [
    {"name": "Actor Name", "role": "Character Name"},
    {"name": "Actor Name", "role": "Character Name"}
  ],
  "streaming": ["Netflix", "Disney+", "Prime Video", "Apple TV+", "Max", "Hulu"],
  "tagline": "Official tagline or one-line description",
  "director": "Director name(s)"
}

If you cannot identify it:
{"error": "Could not identify this scene. Try a clearer screenshot or more specific description."}
`;

export default async function handler(req, res) {
  // CORS — allow any origin so the frontend can call this freely
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: API key missing.' });
  }

  const { image_base64, image_media_type, description } = req.body || {};

  if (!image_base64 && !description) {
    return res.status(400).json({ error: 'Provide an image or description.' });
  }

  // Build message content
  const content = [];
  if (image_base64 && image_media_type) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: image_media_type, data: image_base64 }
    });
  }
  content.push({ type: 'text', text: USER_PROMPT(description) });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'Anthropic API error' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text?.trim();

    // Parse and return the JSON from Claude
    try {
      const parsed = JSON.parse(text);
      return res.status(200).json(parsed);
    } catch {
      return res.status(200).json({ error: 'Could not parse response. Please try again.' });
    }

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
