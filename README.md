# Chat app

This repository is part of chatting app project containing frontend and backend implementation. Here you can find fully implemeneted backend application that is ready to be run with corresponding frontend with it. 
You can try the app here:

You have a choice of trying test user or creating your own account and logging in. Once logged in user sees main screen, on the left side there is list of exisitng conversations that can be choosen, on the right there is a list of active and unactive users that can be searched via textfield that is placed on top of it. Once conversation or user is choosen a conversation view is displayed with previous messages, info about conversation and possibility of sending a message.

## 1. Features
- User authentication: Users can create an account and log in safely.
- Real-time messaging: App allows real-time messaging
- Message history: Previous messages are stored in DB and can be displayed via UI
- Backend hosts all active users and exchanges information between them with usage of sockets
- Backend shares some data via API

## 2. Tech stack
- Node.js with TypeScript
- socket.io for real-time communication with frontend client
- express.js for API implementation
- Sequelize ORM to communicate with DB
Backend application was created with usage of Node.js iwth TypeScript. Server is split into two instances. One is repsponsible for communication over sockets that allows real-time data exchange between client-server and second one that takes care of API requestes. Application data is stored in DB that makes sure everything is stored safely and server has easy access to it. Backend communicated with DB via Sequelize ORM that allows using dedicated interface and creates types for TypeScript use.

## 3. How does it work
### Sockets
Messaging on the backend side was implemented with usage of socket.io library that was used to create socket class which later on creates server that esatbilishes communication with frontend over sockets and is able to communicate in real-time. When user logs in authentication is passed through socket middleware that checks if user is eliable for access. Events such as messaging, user acitvity change or creating new rooms are socket based and server is emitting them anytime it is needed. 
### API
Some of data is ready to be passed via API, such as older messages, conversations or users. This happend whenever client sends a request. In this case, similar as in sockets, authentication data is passed though middleware that checks if user is eliable for access.
### DB
For storing data this project uses DB. Localy using SQLite, in production server I decided to switch to MySQL. To communicate with DB from the server I decided to use Sequelize ORM which allows to write clean, SQL free code. Created tables store data such as User's data, converations, messages etc. DB diagram can be seen below.
![image](https://github.com/FilipZmija/ChatApp-backend/assets/94125339/635d85e3-c189-4a2a-b047-23c7e7a33588)

### 4. How to run
Clone repo
```
   git clone https://github.com/FilipZmija/ChatApp-backend.git
```
Install dependencies
```
cd ChatApp-backend
npm install
```
Start development server
```
npm run dev //runs index.js files and listens for changes in .ts files, when that happens it reloads the server
```
