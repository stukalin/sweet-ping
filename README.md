# sweet-ping

> Boys, Boys, it's a sweet ping...

The tiny handy tool to check the availability of your website. Could be useful to measure how much time it takes to restart the server or whatever.

It sends HTTP requests and expects to get the `200` as a response. If that's not the case, the app tries to calculate the outage time.

## Installation and usage

```
npm i -g sweet-ping
```

and then

```
sping http://facebook.com
```

To stop the process press `Ctrl+C`

## What it can do

If there is an error HTTP status the app sums up the time until it receives the `200` again.

If the request takes longer than average the app will write a warning.

More features are coming