// Site configuration. Loaded before main.js on every page.
// The request form posts JSON to FORM.url and reports success ONLY when the server answers 2xx.
// FORM.url is the address of the form worker (server/telegram-form, a Cloudflare Worker that sends each request to
// the Telegram group). Until it is deployed the url stays empty, and the form honestly says that sending from the site
// is not connected yet and shows the phone and Telegram instead.
// Never put a Telegram bot token here: everything in this file is public.
window.FM_CONFIG = {
  FORM: {
    url: '', // e.g. 'https://fairmetal-form.<account>.workers.dev/'
    key: '',
    keyHeader: 'X-API-Key',
    timeoutMs: 12000,
  },
  SITE_URL: 'https://fairmetal.uz/',
};
