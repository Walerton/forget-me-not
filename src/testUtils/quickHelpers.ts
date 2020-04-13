/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/forget-me-not
 */

import { browser, WebRequest, Cookies } from "webextension-polyfill-ts";

import { Settings } from "../lib/settings";
import { createDefaultSettings } from "../lib/defaultSettings";
import { IncognitoWatcher } from "../background/incognitoWatcher";

export function quickIncognito(incognitoWatcher: IncognitoWatcher, id: number, cookieStoreId = "firefox-private") {
    // eslint-disable-next-line dot-notation
    incognitoWatcher["onCreated"]({ id, incognito: true, cookieStoreId } as any);
}

export function quickSettings({
    version,
    mobile,
    removeLocalStorageByHostname,
}: {
    version: string;
    mobile: boolean;
    removeLocalStorageByHostname: boolean;
}) {
    return new Settings(
        createDefaultSettings({
            version,
            browserInfo: {
                mobile,
            },
            supports: {
                removeLocalStorageByHostname,
            },
        } as any)
    );
}

export function quickCookieDomainInfo(domain: string, type: "never" | "startup" | "leave" | "instantly") {
    const className = `cleanup_type_${type}`;
    return {
        domain,
        className,
        i18nBadge: `${className}_badge`,
        i18nButton: `${className}_button`,
    };
}

export function quickSetCookie(
    domain: string,
    name: string,
    value: string,
    path: string,
    storeId: string,
    firstPartyDomain: string,
    secure = false
) {
    return browser.cookies.set({
        url: "mock",
        name,
        value,
        domain,
        path,
        storeId,
        firstPartyDomain,
        secure,
    });
}

// fixme: rename to quickCookie
export function quickRemoveCookie(
    domain: string,
    name: string,
    path: string,
    storeId: string,
    firstPartyDomain: string,
    secure = false
): Cookies.Cookie {
    // fixme: removeCookie()
    return {
        name,
        domain,
        path,
        storeId,
        firstPartyDomain,
        value: "",
        hostOnly: false,
        secure,
        httpOnly: false,
        session: false,
        sameSite: "no_restriction",
    };
}

export function quickHeadersReceivedDetails(
    url: string,
    tabId: number,
    responseHeaders?: WebRequest.HttpHeaders
): WebRequest.OnHeadersReceivedDetailsType {
    return {
        url,
        tabId,
        responseHeaders,
        requestId: "mock",
        method: "get",
        frameId: 0,
        parentFrameId: -1,
        type: "main_frame",
        thirdParty: false,
        timeStamp: Date.now(),
        statusLine: "HTTP/0.9 200 OK",
        statusCode: 200,
    };
}

export function quickBeforeRedirectDetails(
    url: string,
    redirectUrl: string,
    tabId: number,
    frameId = 0
): WebRequest.OnBeforeRedirectDetailsType {
    return {
        requestId: "request",
        url,
        method: "get",
        frameId,
        parentFrameId: -1,
        tabId,
        type: frameId === 0 ? "main_frame" : "sub_frame",
        thirdParty: false,
        timeStamp: -1,
        fromCache: false,
        statusCode: 200,
        redirectUrl,
        statusLine: "OK",
    };
}

export function quickHttpHeader(name: string, value?: string) {
    return {
        name,
        value,
    };
}
