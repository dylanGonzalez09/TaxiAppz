# RESTful API Node Server Boilerplate

## Quick Start

```bash
  git clone --depth 1 https://github.com/hagopj13/node-express-boilerplate.git
cd node-express-boilerplate
npx rimraf ./.git
```

Install the dependencies:

```bash
yarn install
```

Set the environment variables:

```bash
cp .env.example .env

# open .env and modify the environment variables (if needed)
```

## Commands

Rename the .env.example to .env


Install the Nodemodules

```bash
npm install
```

run development Enviroment

```bash
npm run dev
```

run Production Enviroment

```bash
npm start
```

Currently Swagger run only in Development Enviroment So Use

```bash
npm run dev
```

This For Swagger Document Link

```bash
http://localhost:4001/v1/docs/
```

## Environment Variables

The environment variables can be found and modified in the `.env` file. They come with these default values:

```bash
# Port number
PORT=4001

# URL of the Mongo DB
MONGODB_URL=mongodb://127.0.0.1:27017/node-boilerplate

# JWT
# JWT secret key
JWT_SECRET=thisisasamplesecret
# Number of minutes after which an access token expires
JWT_ACCESS_EXPIRATION_MINUTES=30
# Number of days after which a refresh token expires
JWT_REFRESH_EXPIRATION_DAYS=30

# SMTP configuration options for the email service
# For testing, you can use a fake SMTP service like Ethereal: https://ethereal.email/create
SMTP_HOST=email-server
SMTP_PORT=587
SMTP_USERNAME=email-server-username
SMTP_PASSWORD=email-server-password
EMAIL_FROM=support@yourapp.com
```


