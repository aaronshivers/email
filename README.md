# email

## Install Instructions

1. Get API token from [postmarkapp.com](https://postmarkapp.com)

2. Create file for environment variables in root directory
```
touch .env
```

3. Add environment variables to .env
  * PORT=8080
  * HOST=0.0.0.0
  * POSTMARK_TOKEN=yourtokenhere

4. Build application
```
sudo docker build -t email .
```

5. Run image
```
sudo docker run -p 49160:8080 email
```

6. Test server
```
curl -i localhost:49160
```

7. Post to /
```
curl -d '{"email":"myemail@someserver.com", "message":"this is a test"}' -H "Content-Type: application/json" -X POST http://localhost:49160/
```

## Usage Instructions

### Users Routes
1. POST /users
2. GET /users
3. PUT /users:id
4. DELETE /users:id

### Test Application

1. Exit the dockerized application, if running.

2. In the command line, from the root project directory

  + To run the tests once

  ```
  npm run test
  ```

  + To run the tests once, then again on each file change

  ```
  npm run test-watch
  ```

  + Start the application in Development Mode without tests
  ```
  npm start
  ```
