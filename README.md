# Collabio
## Project Overview
This project is a task management application called Collabio, designed to help teams organize, track, and manage their Projects effectively. The application is built using Angular 16 and leverages Firebase as its backend and database.

## Authors
- Ziad Lahrouni [Official Website](https://ziadlahrouni.com)
- Sabrina Tamda  [GitHub](https://github.com/tamdasab)
- Mohamed Kerraz [GitHub](https://github.com/mohamedkerraz)

## Features
- **User Authentication** :
  - Secure login and registration with Firebase Authentication
  - Dark mode support
  - Profile management
- **Project Management** :
  - Create and configure new projects
  - Intuitive project editing interface
  - Secure deletion with confirmation
  - Project dashboard overview
  - Real-time search functionality
- **User Story Management** :
  - Create, edit, delete user stories
  - Assign user stories to team members
  - Progress tracking
  - Status workflow management
  - Story points estimation
- **Access Control** :
  - Role-based permissions
  - Project member management
  - Secure access to project resources
- **Real-time Updates** :
  - Live data synchronization using Firebase
  - Real-time collaboration features

## Technologies Used
- **Frontend**
  - [Angular 16](https://v16.angular.io/guide/setup-local)
  - [TypeScript](https://www.typescriptlang.org/)
  - [TailwindCSS](https://tailwindcss.com/) for styling
- **Backend**
  - Firebase
    - Firestore
    - Firebase Authentication
    - Firebase Hosting

## Test Account
For testing purposes, you can use the following account:
```
Email: preview@collab.io
Password: preview@collab.io
```
Note: This is a demo account with limited permissions.

## Future Updates
Potential features for future updates:
- **Enhanced Project Analytics**
  - Burndown charts
  - Velocity tracking
  - Sprint performance metrics
- **Advanced User Management**
  - Team creation and management
  - Custom roles and permissions
  - User activity tracking
- **Additional Integrations**
  - GitHub integration
  - Slack notifications
  - Email notifications
- **Improved UI/UX**
  - Customizable dashboards
  - Drag-and-drop interfaces
  - Advanced filtering options
- **Extended Functionality**
  - Time tracking
  - File attachments
  - Comments and discussions
  - Sprint planning tools

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
- Enable the following services: Firestore, Authentication, and Hosting
- Download the Firebase config file and place it in `src/app/environement/env.ts`
Example configuration:
```typescript
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

Open your browser and navigate to http://localhost:4200/

## Contributing
We welcome contributions! Please feel free to submit a Pull Request.
