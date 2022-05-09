import requests
import json
import logging
import os
from dotenv import load_dotenv
from urllib.parse import urlencode
import webbrowser

load_dotenv()
CLIENT_ID = os.environ.get("GITHUB_CLIENT_ID")
CLIENT_SECRET = os.environ.get("GITHUB_CLIENT_SECRET")

params = {
    "client_id": CLIENT_ID,
    "scope": "user"
}

endpoint = "https://github.com/login/oauth/authorize"
endpoint = endpoint + '?' + urlencode(params)
webbrowser.open(endpoint)

code = input()

params = {
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "code": code,
}
endpoint = "https://github.com/login/oauth/access_token"
response = requests.post(endpoint, params=params, headers = {"Accept": "application/json"}).json()
access_token = response['access_token']

session = requests.session()
session.headers = {"Authorization": f"token {access_token}"}

f = open("../repository/packages.json")
dictF = json.load(f)

for i in dictF:
  url = dictF[i]["gitUrl"].split("/")
  if len(url) > 4 and url[2] == "github.com":
    logging.error(f"{url[3]}/{url[4]}")
    req = session.get(f"https://api.github.com/repos/{url[3]}/{url[4]}/releases")
    dictReq = json.loads(req.text)
    if "message" not in dictReq:
      for j in dictReq:
        print(j["tag_name"])
        for k in j["assets"]:
          k["name"]
