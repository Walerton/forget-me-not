import { h } from "tsx-dom";
import * as punycode from "punycode";

import { CleanupType } from "../lib/shared";
import { RuleDialog } from "./dialogs/ruleDialog";
import { isValidExpression } from "../lib/expressionUtils";
import { ExtensionContext } from "../lib/bootstrap";

export function appendPunycode(domain: string) {
    const punified = punycode.toUnicode(domain);
    return punified === domain ? domain : `${domain} (${punified})`;
}

export function getSuggestedRuleExpression(domain: string, cookieName?: string) {
    if (cookieName) return `${cookieName.toLowerCase()}@${domain.startsWith(".") ? `*${domain}` : domain}`;
    return domain.startsWith(".") ? `*${domain}` : `*.${domain}`;
}

export function showAddRuleDialog(context: ExtensionContext, expression: string, next?: () => void) {
    if (isValidExpression(expression)) {
        const { settings } = context;
        // eslint-disable-next-line no-inner-declarations
        function onConfirm(type: CleanupType | false, changedExpression: string, temporary: boolean) {
            if (changedExpression && type !== false) {
                settings.setRule(changedExpression, type, temporary);
                next?.();
            }
        }

        const definition = settings.getExactRuleDefinition(expression);
        const focusType = definition ? definition.type : CleanupType.NEVER;
        const temporary = definition?.temporary || false;

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        <RuleDialog
            expression={expression}
            editable
            focusType={focusType}
            temporary={temporary}
            onConfirm={onConfirm}
            context={context}
        />;
    }
}
