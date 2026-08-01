// @ts-nocheck
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/icon.png",
      badge: "/icon.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
        url: data.url,
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", (event) => {
  // biome-ignore lint/suspicious/noConsole: Notifications
  console.log("Notification click received.");
  event.notification.close();

  // Get the URL from the notification data, or use default
  const url = event.notification.data?.url || process.env.NEXT_PUBLIC_SITE_URL;

  event.waitUntil(clients.openWindow(url));
});
