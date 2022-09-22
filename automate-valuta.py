import requests
import json
import random
import re
from multiprocessing.dummy import Pool as ThreadPool


url = "https://valuta-hub.me"

# get all majors
def getMajors():
    res = requests.get(url+"/api/v1/admin/majors")
    return json.loads(res.text)

# get random major
def getRandomMajor():
    majors = getMajors()
    index = random.randint(0,len(majors)-1)
    return majors[index]["years"][random.randint(1,len(majors[index]["years"])-1)]

# create account
def createAccount(name, username, email, password, majors):
    create_account_url = "https://valuta-hub.me/api/v1/entry/register"
    Data = {
        "name": name,
        "username": username,
        "email": email,
        "password": password,
        "majors": majors,
        "register": "Sign up"
    }

    res = requests.post("https://valuta-hub.me/api/v1/entry/register", data=Data)
    if "Dont have an account?" in res.text:
        print("Username Taken!")
        return

    payload = {
        "username": username,
        "password": password,
        "login": "Login"
    }

    session = requests.session()

    res = session.post("https://valuta-hub.me/api/v1/entry/login", data=payload)
    print(username+" logged in!")
    texts = json.loads(requests.get("https://zenquotes.io/api/quotes").text)
    newPost = {
        "content": texts[0]["q"],
        "image": "(binary)",
        "file": "(binary)"
    }
    session.post("https://valuta-hub.me/api/v1/posts/add", data=newPost)
    print(username+" just posted!")
    roomstext = session.get("https://valuta-hub.me/rooms").text.split("\n")
    
    rooms = []
    for line in roomstext:
        result = re.search('room-data="(.*)"', line)
        if result != None:
            rooms.append(result.group(1).split('"')[0])

    randomRoom = rooms[random.randint(0,(len(rooms)-1))]
    
    for i in range(random.randint(1,3)):
        message = texts[random.randint(1,len(texts)-1)]
        msg_payload = {
            "content": message["q"],
            "to": randomRoom
        }
        res = session.post("https://valuta-hub.me/api/v1/messages/send/", data=msg_payload)
        print(res.text)


def genAccount():
    generator = "https://randomuser.me/api/"
    res = json.loads(requests.get(generator).text)
    name = res["results"][0]["name"]["first"] + " " + res["results"][0]["name"]["last"]
    username = res["results"][0]["name"]["first"]+"."+res["results"][0]["name"]["last"]
    email = username+"@gmail.com"
    password = username

    print("###############")
    print({"username":username, "password":password})
    createAccount(name, username, email, password, getRandomMajor()["_id"])



for i in range(25):
    genAccount()