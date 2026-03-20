// STATUS: done | Report template placeholders
/**
 * Replaces {{key}} placeholders (word keys including underscores) with values from vars.
 * Unknown keys are left unchanged.
 */
export function interpolateReportTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{([\w]+)\}\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match
  );
}
