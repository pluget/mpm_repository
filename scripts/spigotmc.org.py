import time
from bs4 import BeautifulSoup
import undetected_chromedriver as uc

driver = uc.Chrome()

page = driver.get('https://www.spigotmc.org/resources/categories/spigot.4/?order=download_count&page=1')
time.sleep(6)
soup = BeautifulSoup(driver.page_source, 'html.parser')

items = soup.select("form ol.resourceList li.resourceListItem")
itemsObject = []
for i in items:
    itemsObject.append([i.select("h3.title > a")[0].get("href"), i.select("h3.title > a")[0].getText()])

for i in itemsObject:
    print(i[1])
