
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import time
import sys
import tweepy # IMPORT
from urllib2 import Request, urlopen, URLError


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

if __name__ == "__main__":
    def check_bullrun():
        if (pricing["first"] + 20 < pricing["second"]):
            #api.update_status(line)
            print("Post something")
        print("Difference: $" + str(pricing["second"]-pricing["first"]))

    def get_coinbase():
        request = Request('https://api.coinbase.com/v2/prices/buy')
        response = urlopen(request)
        sub = json.loads(response.read())
        return float(sub["data"]["amount"])

    while True:
        pricing["first"] = get_coinbase();
        time.sleep(20)#Tweet every 60 minutes
        pricing["second"] = get_coinbase();
        check_bullrun()
