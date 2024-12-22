export const calendars = [
    {
        name: "Work",
        url: "https://calendar.example/work.ics",
        color: "#C077DB",
    },
    {
        name: "Family",
        url: "https://name:password@calendar.example/family.ics",
        color: "#F7CE46",
    },
    // add as many calendars as you like, the url should return a raw ics file.
    // You can use basic auth by adding it to the url like this: https://name:password@url
];

export const weather = {
    latitude: 49.12345,
    longitude: 8.12345,
};

export const wallpaper = {
    // only icloud shared albums are supported for now,
    // you can get the url by sharing the album and copying the link
    icloudalbums: ["https://www.icloud.com/sharedalbum/#ALBUM_ID"],
};

export const brightness = {
    // the path to the backlight device, you can use a wildcard to match an unknown name
    // the example should work for raspis with the official touchscreen. If your setup
    // doesn't support dimming, just set this value to an empty string
    device: "/sys/class/backlight/*",
    maxbrightness: 200,
    minbrightness: 20,

    // the time in hours when to dim the screen
    dimafter: 18,
    dimbefore: 4,
};
