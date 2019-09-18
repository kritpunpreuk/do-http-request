# do-http-request
Node-bigstream plugin

# example  
Post content to Discord Channal via Discord webhook
```
data_out": {
  "type": "http-request",
  "param": {
  "url": "${data.webhook}",
  "method": "POST",
  "encoding": "json",
  "headers": {
    "content-type": "application/json"
  },
  "body": "{ \"username\": \"${data.name}\", \"content\": \"${data.msg}\"}"
  }
}
```
