import os
import time
import json
import praw
from firebase import firebase
from creds import *

TEST_MODE = True
START_SEQUENCE = " start"
BUY_SEQUENCE = " buy"
SELL_SEQUENCE = " sell"
HELP_SEQUENCE = " help"
BALANCE_SEQUENCE = " balance"
HIGHSCORE_SEQUENCE = " scores"


firebase = firebase.FirebaseApplication('https://tradebot.firebaseio.com/', None)
user_agent = ("BitPaperTrader v0.1")
r = praw.Reddit(user_agent=user_agent)
r.login(REDDIT_USERNAME, REDDIT_PASS)

def post(comment, string):
	if TEST_MODE:
		print(string)
	else:
		comment.reply(string)

def attempt_start(comment):
	result = firebase.get('/accounts/'+comment.author.name, None)
	if result == None:
		user = {"USD":100000, "BTC": 0, "History": ["Account Started " + str(time.time())]}
		firebase.post('/accounts/'+comment.author.name, user)
		post(comment, "Account created")
	else:
		post(comment, "You appear to already have an existing account")

def attempt_buy(comment):
		# Valid Formats: buy $100.00, buy $100, buy 1BTC, buy 0.1BTC
		print("Buy")

def attempt_sell(comment):
		print("Sell")

def attempt_help(comment):
	help_text = ""
	post(comment, help_text)

def attempt_balance(comment):
		print("Balance")

def attempt_scores(comment):
		print("Scores")


def process_input(comment):
	if REDDIT_USERNAME in comment.author.name:
		return

	if ("/u/"+REDDIT_USERNAME) in comment.body:
		if ("/u/"+ REDDIT_USERNAME + START_SEQUENCE) in comment.body:
			attempt_start(comment)
		elif ("/u/"+ REDDIT_USERNAME + BUY_SEQUENCE) in comment.body:
			attempt_buy(comment)
		elif ("/u/"+ REDDIT_USERNAME + SELL_SEQUENCE) in comment.body:
			attempt_sell(comment)
		elif ("/u/"+ REDDIT_USERNAME + HELP_SEQUENCE) in comment.body:
			attempt_help(comment)
		elif ("/u/"+ REDDIT_USERNAME + HIGHSCORE_SEQUENCE) in comment.body:
			attempt_balance(comment)

while True:
	subreddit = r.get_subreddit('bitcoin')
	flat_comments = praw.helpers.flatten_tree(subreddit.get_comments())
	for comment in flat_comments:
		result = firebase.get('/posts/'+comment.id, None)
		if result == None:
			process_input(comment)
			firebase.post('/posts/'+comment.id, "Parsed")
	time.sleep(60)