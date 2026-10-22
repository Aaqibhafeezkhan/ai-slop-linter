export interface AiSlopOptions {
  /** Rule ids to skip. */
  ignore?: string[];
  /** Run only these rule ids. */
  only?: string[];
  /** BCP 47 tag of the prose language; rules whose evidence is English stand down for any other. */
  language?: string;
}

type Reporter = (context: unknown, options?: AiSlopOptions) => Record<string, (node: unknown) => void>;

/** A fixable textlint rule. `context` is textlint's TextlintRuleContext; it is not imported so this package stays dependency-free. */
declare const rule: { linter: Reporter; fixer: Reporter };
export default rule;
