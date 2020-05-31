import { singleton } from "tsyringe";
import { browser, BrowsingData, History } from "webextension-polyfill-ts";
import { getDomain } from "tldjs";

import { Cleaner } from "./cleaner";
import { Settings } from "../../shared/settings";
import { getValidHostname, getFirstPartyDomain } from "../../shared/domainUtils";
import { TabWatcher } from "../tabWatcher";
import { RuleManager } from "../../shared/ruleManager";

@singleton()
export class HistoryCleaner extends Cleaner {
    public constructor(
        private readonly settings: Settings,
        private readonly ruleManager: RuleManager,
        private readonly tabWatcher: TabWatcher
    ) {
        super();
        browser.history?.onVisited.addListener(this.onVisited);
    }

    private onVisited = ({ url }: History.HistoryItem) => {
        if (url && this.settings.get("instantly.enabled") && this.settings.get("instantly.history")) {
            const domain = getValidHostname(url);
            if (
                domain &&
                (!this.settings.get("instantly.history.applyRules") ||
                    this.ruleManager.isDomainInstantly(domain, false))
            )
                browser.history.deleteUrl({ url });
        }
    };

    public async clean(typeSet: BrowsingData.DataTypeSet, startup: boolean) {
        if (typeSet.history) {
            if (this.settings.get(startup ? "startup.history.applyRules" : "cleanAll.history.applyRules")) {
                typeSet.history = false;
                const items = await browser.history.search({ text: "" });
                if (!items.length) return;

                const protectOpenDomains = this.ruleManager.protectOpenDomains(startup);
                const urlsToClean = this.getUrlsToClean(items, startup, protectOpenDomains);
                await Promise.all(urlsToClean.map((url) => browser.history.deleteUrl({ url })));
            }
        }
    }

    public async cleanDomainOnLeave(storeId: string, domain: string) {
        if (
            this.settings.get("domainLeave.enabled") &&
            this.settings.get("domainLeave.history") &&
            // Other stores might still contain the domain and we can't clean per-store yet
            !this.tabWatcher.containsDomain(domain)
        ) {
            const domainFP = getFirstPartyDomain(domain);
            const items = await browser.history.search({ text: domainFP });
            const filteredItems = items.filter((item) => {
                if (!item.url) return false;
                const hostname = getValidHostname(item.url);
                return hostname === domain || getDomain(hostname) === domainFP;
            });
            const urlsToClean = this.getUrlsToClean(filteredItems, false, true);
            await Promise.all(urlsToClean.map((url) => browser.history.deleteUrl({ url })));
        }
    }

    private isDomainProtected(domain: string, ignoreStartupType: boolean, protectOpenDomains: boolean) {
        if (protectOpenDomains && this.tabWatcher.containsDomain(domain)) return true;
        return this.ruleManager.isDomainProtected(domain, false, ignoreStartupType);
    }

    private getUrlsToClean(items: History.HistoryItem[], ignoreStartupType: boolean, protectOpenDomains: boolean) {
        const unprotected = (url: string | undefined) =>
            !!url && !this.isDomainProtected(getValidHostname(url), ignoreStartupType, protectOpenDomains);
        return items.map((item) => item.url).filter(unprotected) as string[];
    }
}
