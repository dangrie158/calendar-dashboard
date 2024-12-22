# Calendar Dashboard

- Display your next events synced with any calendar service.
- Display the current and future weather
- Add a slideshow of your favorite photos automatically synced with iCloud Shared Albums

## Getting Started

1. Copy the `config.example.ts` file to `config.ts` and fill in the necessary values.
2. Deploy the app to a server. For a simple deployment on a RaspberryPi with the current 64 bit version of RaspberryOS, you can use the `pi-deplyment/install.sh` script:

```sh
./pi-deployment/install.sh pi@hostname.local
```

### Prerequisites

To run this app, you will need to have [Deno](https://docs.deno.com/runtime/)
installed.

## Development

### Install the dependencies

To install the dependencies for the frontend and backend, run the following
command:

```sh
deno install
```

### Run the dev server with vite

The app uses a Vite dev server to run in development mode. To start the dev
server, run the following command:

```sh
deno run dev
```

### Build the app

To build the app for production, run the following command:

```sh
deno run build
```

### Run the backend server

The backend server uses Deno and the Oak framework to serve the built React app.
To start the backend server, run the following command:

```sh
deno run server:debug
```
