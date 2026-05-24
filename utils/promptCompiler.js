/**
 * Compiles modular PromptKit primitives into an LLM-ready message array.
 * Validates structural prerequisites and catches unhydrated placeholders.
 *
 * @param {Object} payload
 * @param {Object} [payload.persona] - Optional persona component ({ content: string })
 * @param {Object} [payload.protocol] - Optional protocol component ({ content: string })
 * @param {Object} [payload.format] - Optional format component ({ content: string })
 * @param {Object} payload.template - Required template component ({ content: string })
 * @param {Object} payload.variables - Key-value map of template variables
 * @returns {Array<{role: string, content: string}>} Standard ChatCompletion message array
 */
export function compilePromptKitBlueprint(payload) {
  // 1. Guard against empty or whitespace-only templates
  if (!payload?.template?.content?.trim()) {
    throw new Error("Template content is required to compile a prompt.");
  }

  const systemBlocks = [];

  // 2. Layer optional system blocks safely if they contain text
  if (payload.persona?.content?.trim()) {
    systemBlocks.push(
      `## SYSTEM ROLE & PERSONA\n${payload.persona.content.trim()}`,
    );
  }

  if (payload.protocol?.content?.trim()) {
    systemBlocks.push(
      `## EXECUTION PROTOCOL & REASONING FLOW\n${payload.protocol.content.trim()}`,
    );
  }

  if (payload.format?.content?.trim()) {
    systemBlocks.push(
      `## OUTPUT SPECIFICATION & STRUCTURE\n${payload.format.content.trim()}`,
    );
  }

  const systemInstruction = systemBlocks.join("\n\n").trim();

  // 3. Hydrate template variables locally
  let userContent = payload.template.content;
  const passedVariables = payload.variables ?? {};

  if (Object.keys(passedVariables).length > 0) {
    Object.entries(passedVariables).forEach(([key, value]) => {
      // Escape regex boundary flags out of incoming token keys safely
      const sanitizedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`{{${sanitizedKey}}}`, "g");
      userContent = userContent.replace(regex, value ?? "");
    });
  }

  // 4. Assert that no unhydrated placeholders remain
  const unfilledVars = [...userContent.matchAll(/{{([a-zA-Z0-9_-]+)}}/g)].map(
    (match) => match[1],
  );
  if (unfilledVars.length > 0) {
    throw new Error(
      `Compilation failed. Unfilled placeholders detected: ${unfilledVars.join(", ")}`,
    );
  }

  // 5. Package standard multi-model payload array
  const messages = [];

  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }

  messages.push({ role: "user", content: userContent });

  return messages;
}
