import { h } from "tsx-dom";

import { SettingsCheckbox } from "../../settingsCheckbox";
import { ExtensionContextProps } from "../../../lib/bootstrap";

export function ExperimentalTab({ context }: ExtensionContextProps) {
    return (
        <div>
            <div data-i18n="setting_experimental_info?markdown" />
            <div>
                <SettingsCheckbox
                    key="cleanThirdPartyCookies.beforeCreation"
                    i18n="setting_thirdparty_before_creation"
                    context={context}
                />
            </div>
            <div>
                <SettingsCheckbox key="purgeExpiredCookies" i18n="setting_purge_expired_cookies" context={context} />
            </div>
        </div>
    );
}
