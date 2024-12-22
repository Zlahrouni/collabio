# Collabio

## Project Overview

This project is a task management application called Collabio, designed to help teams organize, track, and manage their Projects effectively. The application is built using Angular 16 and leverages Firebase as its backend and database.

## Authors
- Ziad Lahrouni [Official Website](https://ziadlahrouni.com)
- Sabrina Tamda  [GitHub](https://github.com/tamdasab)
- Mohamed Kerraz [GitHub](https://github.com/mohamedkerraz)

## Features

- **User Authentification** :
  - Secure login and registration with Firebase Authentication
- **Project Management** :
  - Create and configure new projects
  - Intuitive project editing interface
  - Secure deletion with confirmation
  - Project dashboard overview
- **User story Management** :
  - Create, edit, delete user story
  - Assign user story to team members
  - Progress tracking
- **Real-time update** :
  - Live data synchronization using Firebase
  - Offline support with data persistence

## Technologies Used

- **Frontend**
  - [Angular 16](https://v16.angular.io/guide/setup-local)
  - [TypeScript](https://www.typescriptlang.org/)

- **Backend**
  - Firebase
    - Firestore
    - Firebase Authentification

## Installation
  ### Prerequisites
  - Node.js and npm installed
  - Angular CLI (v16) installed globally
  - Firebase CLI installed globally
  - Git for version control

  ### Steps

1. Clone repository
```
https://github.com/Zlahrouni/collabio.git
```
2. Navigate to the project directory:

```
cd collabio
```
3. Install dependencies:
```
npm install
```
4. Set up Firebase:

- Create a Firebase project at Firebase Console
- Enable the following services : Firestore, Authentication, and Hosting
- Download the Firebase config file and place it in `src/app/environement/env.ts`

exemple configuration:
```
export const environment = {
  production: false,
  firebase: {
    apiKey: 'your-api-key',
    authDomain: 'your-app.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-app.appspot.com',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id'
  }
};
```

5. Initialize Firebase:
```
firebase login
firebase init
```

6. Serve the application:

```
npm start
```
Open your browser and navigate to http://localhost:4200/.
