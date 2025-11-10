import { findByProps, findByCodeLazy } from "@vendetta/metro";
import { before, after } from "@vendetta/patcher";
import { storage } from "@vendetta/plugin";

// Default spoofed user data (hardcoded as per snippet; can be made configurable via storage if needed)
const SPOOFED_USER_DATA = {
    id: "1307155206609309780",
    email: "you234@gmail.com",
    phone: "+34655544544",
    verified: true
};

// Helper to find the dispatch module (using the provided snippet logic)
let _mods: any;
webpackChunkdiscord_app.push([[Symbol()], {}, (r: any) => { _mods = r.c; }]);
webpackChunkdiscord_app.pop();
const findByPropsHelper = (...props: string[]) => {
    for (let m of Object.values(_mods)) {
        try {
            if (!m.exports || m.exports === window) continue;
            if (props.every((x) => m.exports?.[x])) return m.exports;
            for (let ex in m.exports) {
                if (props.every((x) => m.exports?.[ex]?.[x])) return m.exports[ex];
            }
        } catch {}
    }
};

const unpatches: (() => void)[] = [];

const start = () => {
    try {
        // Find dispatch module
        const DispatchModule = findByPropsHelper("_dispatch");
        if (!DispatchModule) return;

        // Get the real user store to fetch base user data
        const UserStore = findByProps("getUser", "getCurrentUser");

        // Interceptor for CURRENT_USER_UPDATE and CONNECTION_OPEN
        unpatches.push(
            before("_dispatch", DispatchModule, (args: any[]) => {
                const event = args[0];
                if (event?.type === "CURRENT_USER_UPDATE" || event?.type === "CONNECTION_OPEN") {
                    // Fetch the base user for the spoofed ID (or fallback to current user if not found)
                    const baseUser = UserStore.getUser(SPOOFED_USER_DATA.id) || UserStore.getCurrentUser();
                    if (baseUser) {
                        // Merge spoofed data
                        event.user = Object.assign({}, baseUser, SPOOFED_USER_DATA);
                    }
                }
            })
        );

        // Initial dispatch to apply the spoof immediately
        DispatchModule.dispatch({ type: "CURRENT_USER_UPDATE" });

        // Optional: Patch user store getters for persistence (e.g., getCurrentUser)
        const UserStoreGetters = findByCodeLazy("getCurrentUser");
        if (UserStoreGetters) {
            unpatches.push(
                after("getCurrentUser", UserStoreGetters, (args: any[], res: any) => {
                    if (res && res.id === SPOOFED_USER_DATA.id) {
                        return Object.assign({}, res, SPOOFED_USER_DATA);
                    }
                    return res;
                })
            );
        }

    } catch (err) {
        console.error("[UserSpoofer] Error starting plugin:", err);
    }
};

const stop = () => {
    for (const unpatch of unpatches) {
        unpatch();
    }
    unpatches.length = 0;

    // Re-dispatch to reset (optional, but clears spoof)
    const DispatchModule = findByPropsHelper("_dispatch");
    if (DispatchModule) {
        DispatchModule.dispatch({ type: "CURRENT_USER_UPDATE" });
    }
};

export { start, stop };
