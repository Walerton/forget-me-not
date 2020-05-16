import { singleton } from "tsyringe";

import { Settings } from "../../shared/settings";
import { StoreUtils } from "../../shared/storeUtils";
import { TabWatcher } from "../tabWatcher";
import { SupportsInfo } from "../../shared/supportsInfo";
import { IncognitoWatcher } from "../incognitoWatcher";
import { RuleManager } from "../../shared/ruleManager";
import { AbstractStorageCleaner } from "./abstractStorageCleaner";

@singleton()
export class LocalStorageCleaner extends AbstractStorageCleaner {
    constructor(
        settings: Settings,
        ruleManager: RuleManager,
        storeUtils: StoreUtils,
        tabWatcher: TabWatcher,
        incognitoWatcher: IncognitoWatcher,
        supports: SupportsInfo
    ) {
        super(settings, ruleManager, storeUtils, tabWatcher, incognitoWatcher, supports.removeLocalStorageByHostname, {
            dataType: "localStorage",
            domainsToClean: "domainsToClean",
            startupApplyRules: "startup.localStorage.applyRules",
            cleanAllApplyRules: "cleanAll.localStorage.applyRules",
            domainLeave: "domainLeave.localStorage",
        });
    }
}
