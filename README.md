
# Sports Scholarship Management Platform

## Quick Start Guide

### Pre-requisites
1. Install [Node.js](https://nodejs.org/en/download/). The installation of Node.js includes npm (Node Package Manager).
2. Install [MySQL](https://dev.mysql.com/downloads/installer/).

### Download the zip file
1. Download the zip file.
2. You will find two main folders: `frederHaber/client` for frontend and `frederHaber/server` for backend.

### Setup MySQL Database
1. Import the SQL dump file to create the database and tables.
    - Open MySQL shell or any MySQL client and execute the SQL dump file. This will create the database, tables and populate them with required data.
    - The SQL dump file is located at `frederHaber/frederHaber.sql`.

### Backend Setup (`frederHaber/server`)
1. Navigate to `frederHaber/server` directory.
2. Run `npm install` to install the backend dependencies.
3. Create a `.env` file based on the `env_example.txt` file provided. Replace the placeholders with actual values
4. Run `npm run dev` to start the server.

### Frontend Setup (`frederHaber/client`)
1. Navigate to `frederHaber/client` directory.
2. Run `npm install` to install the frontend dependencies.
3. Run `npm start` to start the frontend server.

### AWS S3
1. Create an AWS S3 bucket and note down the bucket name.
2. Update the `.env` file in the `frederHaber/server` directory with your AWS S3 bucket name, access key ID, and secret access key.

### SendGrid
1. Create a SendGrid account and generate an API key.
2. Update the `.env` file in the `frederHaber/server` directory with your SendGrid API key.

### Running the Application
1. Backend: Navigate to `frederHaber/server` and run `npm run dev`.
2. Frontend: Navigate to `frederHaber/client` and run `npm start`.



That's it! The application should now be up and running.

