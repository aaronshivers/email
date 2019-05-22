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
