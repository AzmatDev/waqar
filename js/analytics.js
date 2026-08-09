// ============================================================
// SUIVI DU TUNNEL DE COMMANDE — PostHog, chargé uniquement après
// consentement (bandeau cookies ci-dessous). Sert à répondre à :
// "les clients vont-ils jusqu'au panier ? remplissent-ils sans valider ?"
// À quel endroit précis ils abandonnent.
//
// Clé publique PostHog à coller ci-dessous une fois le compte créé sur
// posthog.com (choisir la région EU pour l'hébergement des données).
// ============================================================

const POSTHOG_KEY = 'phc_r2rdNskZocdZdJq6chFsTcQ6tzt6wmzwUFJTasU5w3Kd';
const POSTHOG_HOST = 'https://eu.i.posthog.com'; // région EU (hébergement des données en Europe)

const ANALYTICS_CONSENT_KEY = 'waqar_analytics_consent'; // 'accepted' | 'declined'

let posthogReady = false;

function analyticsInitPosthog() {
    if (posthogReady || !POSTHOG_KEY || POSTHOG_KEY === 'PASTE_TA_CLE_ICI') return;
    /* eslint-disable */
    !function (t, e) { var o, n, p, r; e.__SV || (window.posthog = e, e._i = [], e.init = function (i, s, a) { function g(t, e) { var o = e.split("."); 2 == o.length && (t = t[o[0]], e = o[1]); t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } } (p = t.createElement("script")).type = "text/javascript", p.crossOrigin = "anonymous", p.async = !0, p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js", (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r); var u = e; for (void 0 !== a ? u = e[a] = [] : a = "posthog", u.people = u.people || [], u.toString = function (t) { var e = "posthog"; return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e }, u.people.toString = function () { return u.toString(1) + ".people (stub)" }, o = "init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "), n = 0; n < o.length; n++) g(u, o[n]); e._i.push([i, s, a]) }, e.__SV = 1) }(document, window.posthog || []);
    /* eslint-enable */
    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only'
    });
    posthogReady = true;
}

// Envoie un événement du tunnel de commande. Ne fait rien si l'utilisateur
// n'a pas donné son consentement (ou l'a refusé) — jamais de tracking silencieux.
function trackEvent(name, props) {
    if (localStorage.getItem(ANALYTICS_CONSENT_KEY) !== 'accepted') return;
    analyticsInitPosthog();
    if (posthogReady && window.posthog) {
        window.posthog.capture(name, props || {});
    }
}

// ---------- Bandeau de consentement ----------
function analyticsInjectBanner() {
    const consent = localStorage.getItem(ANALYTICS_CONSENT_KEY);
    if (consent === 'accepted') {
        analyticsInitPosthog();
        return;
    }
    if (consent === 'declined') return;
    if (document.getElementById('cookie-banner')) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div id="cookie-banner" class="cookie-banner">
            <p class="cookie-banner-text">Nous utilisons un outil de mesure d'audience (PostHog) pour comprendre comment les visiteurs utilisent le site et améliorer le tunnel de commande. Aucune donnée n'est partagée avec des tiers publicitaires.</p>
            <div class="cookie-banner-actions">
                <button type="button" class="cookie-banner-decline" onclick="analyticsSetConsent(false)">Refuser</button>
                <button type="button" class="cookie-banner-accept" onclick="analyticsSetConsent(true)">Accepter</button>
            </div>
        </div>
    `;
    document.body.appendChild(wrapper);
}

function analyticsSetConsent(accepted) {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, accepted ? 'accepted' : 'declined');
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.remove();
    if (accepted) {
        analyticsInitPosthog();
        trackEvent('$pageview');
    }
}

analyticsInjectBanner();
if (localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted') {
    trackEvent('$pageview');
}
