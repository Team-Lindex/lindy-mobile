# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## API Documentation

This project includes Swagger documentation for the API endpoints. To view the API documentation:

```bash
npm run docs
```

This will start a local server at http://localhost:3030 where you can view and interact with the API documentation.

## Speech-to-Text Functionality

The app includes speech-to-text functionality that works across platforms:

- **iOS/Android**: Uses `@react-native-voice/voice` for native speech recognition
- **Web**: Uses the Web Speech API for browser-based speech recognition

### Web Browser Support

The Web Speech API is supported in most modern browsers:

- Chrome (desktop & Android)
- Edge
- Safari (desktop & iOS)
- Firefox (with limitations)

Notes:
- Users will need to grant microphone permissions when first using the feature
- Some browsers may require HTTPS for microphone access
- Speech recognition quality varies by browser and language

### Patching for Web Support

To enable speech recognition on web platforms, this project includes a patching system for the `@react-native-voice/voice` package. The patch is automatically applied when running the web version:

```bash
npm run web
```

If you need to apply the patch manually (for example, after reinstalling node modules), you can run:

```bash
npm run apply-patches
```

The patch creates a web-specific implementation that uses the browser's Web Speech API instead of the native implementation.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
