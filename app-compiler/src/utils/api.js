export async function callClaude(prompt, apiKey) {
  const response = await fetch("/api/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, apiKey }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || `API error: ${response.status}`);
  return data.text;
}