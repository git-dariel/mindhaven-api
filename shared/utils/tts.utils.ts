/**
 * Utility functions for Text-to-Speech processing
 */

/**
 * Wraps text with SSML tags for enhanced speech synthesis
 * Detects Filipino words and applies appropriate language settings
 */
export function wrapWithSSML(text: string): string {
  // Add period if text doesn't end with punctuation
  const normalizedText = text.trim().match(/[.!?]$/) ? text : `${text}.`;

  // Split into sentences, including those without punctuation
  const sentences = normalizedText.split(/(?<=[.!?])\s+/).filter(Boolean);

  let ssml = "<speak>";
  for (const sentence of sentences) {
    const cleaned = sentence.trim();

    // Enhanced Filipino word detection using common patterns and word structure
    const hasFilipino = cleaned.match(
      /(?:[ng|mg|pag|ka|na|sa|po|mo|ko|ang|mga|si|ni|ay|at|o|kung|para|nang|hindi|ito|yan|yun|dito|diyan|doon|tayo|kami|kayo|sila|ako|ikaw|siya]\b|(?:[aeiou][ng]|[bdklmnpstw][aeiou]|[aeiou][bdklmnpstw])[a-z]*)/i
    );

    if (hasFilipino) {
      // Filipino sentence with natural prosody
      ssml += `<voice language="fil-PH">
        <prosody rate="1.1" pitch="+1st">
          ${cleaned.replace(/[.!?]$/, "")}
        </prosody>
      </voice><break time="150ms"/>`;
    } else {
      // English sentence with natural prosody
      ssml += `<voice language="en-US">
        <prosody rate="1.05" pitch="+1st">
          ${cleaned.replace(/[.!?]$/, "")}
        </prosody>
      </voice><break time="150ms"/>`;
    }
  }
  ssml += "</speak>";
  return ssml;
}
