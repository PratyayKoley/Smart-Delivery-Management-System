# Smart Delivery Management System

The Smart Delivery Management System is a modern web application that provides a comprehensive delivery management solution. It focuses on efficient partner management and smart order assignment to streamline the delivery process.

## Key Features

1. **Partner Management**

   * Partner registration and profile management
   * Ability to manage partner areas and work shifts
   * Monitoring of partner performance metrics
2. **Order Processing**

   * Orders dashboard with status tracking
   * Detailed view of order history and assignment details
   * Performance analytics for orders and assignments
3. **Automated Assignment System**

   * Smart algorithm for assigning orders to available partners
   * Tracking of assignment success and failure reasons
   * Detailed metrics on assignment performance

## Technology Stack

* **Frontend** : React, TypeScript, Tailwind CSS
* **Backend** : Node.js, Express, MongoDB
* **Charting** : Chart.js
* **UI Components** : Shadcn/UI

## Getting Started

**Frontend**

1. Clone the repository:
    ``` 
    git clone "https://github.com/PratyayKoley/smart-delivery-management.git"
    ```
2. Install dependencies:  
    ```
    cd Frontend && npm install
    ```
3. Start the development server:  
    ```
    npm run dev
    ```
4. Open the application in your browser:  
    ```
    http://localhost:5173
    ```

**Backend**

1. Install dependencies:
    ```
    cd Backend && npm install
    ```
2. Start the development server: 
    ```
    npm start
    ```
3. Open the server in your browser: 
    ```
    http://localhost:5000
    ```

**Environment Variables Setup**

1. Backend`.env` File:

    Create a `.env` file in the Backend directory and add the following variables:

    ```
    PORT=your_port_number

    MONGO_URI=your_mongo_atlas_connection_uri

    JWT_SECRET=your_secret_string
    ```

2. Frontend `.env` File:
    
    Create a `.env` file in the Frontend directory and add the following variables:

    ```
    VITE_BACKEND_LINK=your_backend_link
    ```

## Project Structure

1. Backend:

   * backend: This folder contains the server-side code, including the Node.js application and any associated modules.
   * controllers: This directory holds the controller logic that handles incoming requests and interacts with the models.
   * models: This directory contains the data models, typically representing the database schema and TypeScript types of all models.
   * routes: This folder houses the application's routing logic, mapping URL endpoints to the corresponding controllers.
   * database.ts: This file contains the database configuration and connection setup.
   * index.ts: The main entry point of the backend application.
2. Frontend:

   * Frontend: This folder contains the client-side React application.
   * components: This directory holds the reusable React components that make up the user interface.
   * hooks: This folder contains custom React hooks used throughout the application.
   * lib: This directory hold utility functions or shared libraries.
   * types: This folder contains TypeScript type definitions used across the application.
   * AppTsx: The main entry point of the React application.
   * index.tsx: This file is responsible for rendering the React application.
3. Components:

   * helpers: This folder contains the modals and the supportive components used throughout the application.
   * middleware: This folder contains the ProtectedComponent responsible for JWT authentication of user.
   * pages: This directory contains all the pages that exist in the application.
   * ThemeModes: This directory is provided by shadcn and Tailwind.css to handle the dark and light modes of the application.
   * ui: This folder is given by Shadcn and it contains all the UI components used in the application.
4. Configuration Files:

   * .gitignore: This file specifies which files and directories should be excluded from Git version control.
   * package.json: This file defines the project's dependencies, scripts, and other metadata.
   * tsconfig.json: This is the TypeScript configuration file, defining the compiler options and project structure.
   * tailwind.config.js: This file configures the Tailwind CSS framework.

## Deployment

The application is deployed on Vercel and can be accessed at the following URL:

[Smart Delivery Management System](https://smart-delivery-management-system.vercel.app/)