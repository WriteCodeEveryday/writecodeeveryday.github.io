
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import tweepy, time, sys, websocket

# removed command line arguments bc theres none

#enter the corresponding information from your Twitter application:
CONSUMER_KEY = '1234abcd...'#keep the quotes, replace this with your consumer key
CONSUMER_SECRET = '1234abcd...'#keep the quotes, replace this with your consumer secret key
ACCESS_KEY = '1234abcd...'#keep the quotes, replace this with your access token
ACCESS_SECRET = '1234abcd...'#keep the quotes, replace this with your access token secret
auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
auth.set_access_token(ACCESS_KEY, ACCESS_SECRET)
api = tweepy.API(auth)

pricing = {}

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### closed ###")

def bitfinex_on_open(ws):
    sub = json.dumps({"event": "subscribe", "channel": "trades", "pair": "BTCUSD"})
    ws.send(sub)
    print("Intitalizing Bitfinex Socket")

def bitfinex_on_message(ws, message):
    sub = json.loads(message)
    if isinstance(sub, dict) and sub["event"]:
        return;

    if sub[1] != "hb" and len(sub) > 2:
        pricing[time.time()]  = sub[3]

    print(pricing)

bitfinex = websocket.WebSocketApp("wss://api2.bitfinex.com:3000/ws",
    on_message = bitfinex_on_message,
    on_error = on_error,
    on_close = on_close)

bitfinex.on_open = bitfinex_on_open
bitfinex_thread = Thread(target = bitfinex.run_forever)

def check_bullrun:
    # api.update_status(line)
    # print(pricing)


while True:
    time.sleep(60*60)#Tweet every 15 minutes
    # check_bullrun()
