import re
import time
from bs4 import BeautifulSoup
import undetected_chromedriver as uc

driver = uc.Chrome()

page = driver.get('https://spigotmc.org/resources/categories/spigot.4/?order=download_count&page=1')
time.sleep(6)
soup = BeautifulSoup(driver.page_source, 'html.parser')

items = soup.select("form ol.resourceList li.resourceListItem")
itemsObject = []
for i in items:
    itemsObject.append([i.select("h3.title > a")[0].get("href"), i.select("h3.title > a")[0].getText(), list(map(lambda x:x.lower(), re.findall(r'[a-zA-Z]+', i.select("h3.title > a")[0].getText())))])
    print(itemsObject)

for i, x in enumerate(itemsObject):
    page = driver.get("https://spigotmc.org/" + x[0])
    # items = soup.select("")

time.sleep(6)

