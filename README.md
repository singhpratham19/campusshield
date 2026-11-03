# CampusShield

Full Stack Development mini project.

Name: Pratham Singh  
PRN: 1032211384

A MERN web app for reporting cyber incidents on campus. Students report incidents and upload evidence. Admins investigate them, and every evidence file has a SHA-256 hash that can be checked for tampering.

## Features

- Student registration and login with JWT and hashed passwords
- Student and admin roles
- Incident reporting with an optional evidence file
- Case status and investigation notes
- SHA-256 evidence integrity check
- Audit log of user actions
- Admin dashboard

## Tech stack

MongoDB, Express, React and Node.js

## Run

Start MongoDB in one terminal (create the data folder first if it does not exist):

```bash
mkdir -p ~/mongodb-data
mongod --dbpath ~/mongodb-data
```

In a second terminal, install the packages, create the admin account, build the React app and start the server:

```bash
npm install
npm run seed
npm run build
npm start
```

Then open http://localhost:4100

Photos from Unsplash under the Unsplash License: FlyD (padlock), Brooke Cagle (students), John (laptop team) and Shahadat Rahman (code).

Admin login: `admin@123` with password `admin1234`. `npm run seed` sets this demo password on every account, so change it before any real use. To choose a different password, run the seed with `ADMIN_PASSWORD`:

```bash
ADMIN_PASSWORD='your-new-password' npm run seed
```

Login tokens are signed with `JWT_SECRET` if it is set. Otherwise the server creates a random secret in `server/.jwt-secret` on first start. Keep that file private.
