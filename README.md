# matrix-appservice-webhooks

[![TravisCI badge](https://travis-ci.org/turt2live/matrix-appservice-webhooks.svg?branch=master)](https://travis-ci.org/turt2live/matrix-appservice-webhooks)
[![API Documentation](https://img.shields.io/badge/api%20documentation-Postman-blue.svg)](https://documenter.getpostman.com/view/1707443/matrix-webhooks/6fYShpU)

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/803b1c8e7f6fad521390)

Slack-compatible webhooks for Matrix. Talk about it on Matrix: [#webhooks:t2bot.io](https://matrix.to/#/#webhooks:t2bot.io)

# Usage

Invite the webhook bridge to your room (`@_webhook:t2bot.io`) and send the message `!webhook`. The bridge bot will then send you a link to send messages to in a private message. You must be able to configure the room in order to set up webhooks.

# JSON Body (for posting messages)

```
{
  "text": "Hello world!",
  "format": "plain",
  "displayName": "My Cool Webhook",
  "avatarUrl": "http://i.imgur.com/IDOBtEJ.png"
}
```

Format can be `plain` or `html`. Emoji will be converted automatically(`:heart:` becomes ❤); set the `emoji` property to `false` to disable this conversion.
To send a notice or emote, add `"msgtype" : "notice"` or `"msgtype" : "emote"` in your request.


# Installation

**Before you begin:** A matrix homeserver and Node 9 or higher are required.

1. Clone this repository and install the dependencies
   ```
   git clone http://github.com/turt2live/matrix-appservice-webhooks
   cd matrix-appservice-webhooks
   npm install
   ```

2. Copy `config/sample.yaml` to `config/config.yaml` and fill in the appropriate fields
3. Generate the registration file
   ```
   node index.js -r -u "http://localhost:9000" -c config/config.yaml
   ```
   *Note:* The default URL to run the appservice is `http://localhost:9000`. If you have other appservices, or other requirements, pick an appropriate hostname and port.

4. Copy/symlink the registration file to your Synapse directory
   ```
   cd ~/.synapse
   ln -s ../matrix-appservice-webhooks/appservice-registration-webhooks.yaml appservice-registration-webhooks.yaml
   ```

5. Add the registration file to your `homeserver.yaml`
   ```
   ...
   app_service_config_files: ["appservice-registration-webhooks.yaml"]
   ...
   ```

6. Restart Synapse (`synctl restart`, for example)

# Running

Using the port specified during the install (`9000` by default), use `node index.js -p 9000 -c config/config.yaml -f appservice-registration-webhooks.yaml` from the repository directory.

The bridge should start working shortly afterwards.

### Docker

A Docker image of the bridge is available to host the bridge yourself. The image can be built yourself with `docker build -t matrix-appservice-webhooks .` or you can use the image on docker.io:
```
docker run -p 9000:9000 -v /path/to/webhooks/dir:/data turt2live/matrix-appservice-webhooks
```

The `/path/to/webhooks/dir` should have an `appservice-webhooks-registration.yaml` file, `config.yaml`, and `database.json`. Additional bridge-related data will be stored here.
