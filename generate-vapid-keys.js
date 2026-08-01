import webpush from "web-push";

const vapidKeys = webpush.generateVAPIDKeys();

// biome-ignore lint/suspicious/noConsole: Notifications
console.log("Paste the following keys in your .env file:");
// biome-ignore lint/suspicious/noConsole: Notifications
console.log("-------------------");
// biome-ignore lint/suspicious/noConsole: Notifications
console.log("VAPID_PUBLIC_KEY=", vapidKeys.publicKey);
// biome-ignore lint/suspicious/noConsole: Notifications
console.log("VAPID_PRIVATE_KEY=", vapidKeys.privateKey);
