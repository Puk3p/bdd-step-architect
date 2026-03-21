export const GHERKIN_KEYWORDS = ['Given', 'When', 'Then', 'And', 'But'] as const;

export const GHERKIN_KEYWORD_PATTERN = GHERKIN_KEYWORDS.join('|');

export const GHERKIN_ALIAS_KEYWORDS = ['And', 'But'] as const;

export const STEP_DEFINITION_KEYWORDS = ['Given', 'When', 'Then'] as const;

export const STEP_DEFINITION_KEYWORD_PATTERN = STEP_DEFINITION_KEYWORDS.join('|');
