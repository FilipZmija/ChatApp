# Sequelize-TypeScript-Init

This code sample shows how to create JWT authentication and authorization with Sequelize v.7.0 TypeScript and socket.io

## Overview

This project consists of:

1. Node.ts server
2. Sequelize v.7 ORM
3. SQLite db
4. Socket.io

This project is extention of basic TS init project. With this project you are able to create user, login and authenticate with JWT token as well as user is authenticated for socket.io connection. So any time a socket connection is established a user is authenticated with JWT token and is granted access to the app.
