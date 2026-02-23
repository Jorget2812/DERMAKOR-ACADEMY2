import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async (params) => {
    // In some cases, locale might be missing or passed as a property of the object
    let locale = params.locale;

    // If locale is missing from params, try requestLocale
    if (!locale) {
        locale = await params.requestLocale;
    }

    const supportedLocales = ['fr', 'it', 'de'];
    const resolvedLocale = (locale && supportedLocales.includes(locale)) ? locale : 'fr';

    return {
        locale: resolvedLocale,
        messages: (await import(`../messages/${resolvedLocale}.json`)).default
    };
});
