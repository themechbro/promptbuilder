/**
 * Compiles a structured template string by injecting user form values.
 * Performs post-processing cleanup to eliminate whitespace artifacts from optional fields.
 * 
 * @param {string} templateString - The raw prompt template containing placeholders like {content}
 * @param {Object} formValues     - Key-value pairs matching the template placeholders
 * @returns {string}              - The compiled, clean prompt text
 */


export function buildPrompt(templateString, formValues = {}) {
  if (!templateString) return "";

  // 1. Substitute variables cleanly
  let compiled = templateString.replace(/{(\w+)}/g, (match, key) => {
    const value = formValues[key];
    if (value !== undefined && value !== null && value !== "") {
      return String(value).trim();
    }
    return "";
  });

  // 2. Comprehensive structural cleanup
  compiled = compiled
    // Fix specific inline template remnants
    .replace(/for a \s+audience\./gi, ".")
    .replace(/for \s+as/gi, "as")
    
    // Target any structured constraint line that remains completely unpopulated, 
    // even if it has a trailing space, dot, colon, or list index format.
    .replace(/^[0-9\.\s]*Additional structural restrictions:\s*[\.\s]*$/gm, "")
    .replace(/^[0-9\.\s]*Instructions:\s*[\.\s]*$/gm, "")
    
    // Catch any remaining standalone generic title lines ending with empty colons/dots
    .replace(/^.+:\s*[\.\s]*$/gm, "")
    
    // Final whitespace standardization pass
    .replace(/[ \t]+/g, " ")          
    .replace(/ \./g, ".")             
    .replace(/\n{3,}/g, "\n\n")       
    .trim();                          

  return compiled;
}