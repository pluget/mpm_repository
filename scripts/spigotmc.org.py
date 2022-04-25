import re
import time
import logging
from bs4 import BeautifulSoup
import undetected_chromedriver as uc

driver = uc.Chrome()

print("{")
for i in range(1, 3254):
  logging.error("Page: " + str(i))
  driver.get('https://spigotmc.org/resources/categories/spigot.4/?order=download_count&page=' + str(i))
  time.sleep(6.5)
  soup = BeautifulSoup(driver.page_source, 'html.parser')

  items = soup.select("form ol.resourceList li.resourceListItem")
  itemsObject = []
  for i in items:
    link = i.select("h3.title > a")[0].get("href")
    releases = link + "history/"
    title = i.select("h3.title > a")[0].getText()
    downloads = int(i.select(".resourceDownloads dd")[0].getText().translate(str.maketrans("", "", ",")))
    itemsObject.append([
      link,
      releases,
      title,
      '-'.join(list(map(lambda x:x.lower(), re.findall(r'[a-zA-Z]+', title)))),
      downloads
    ])

  for i, x in enumerate(itemsObject):
    driver.get("https://spigotmc.org/" + x[0])
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    try:
      container = soup.select(".mainContent")[0]
      mcVersions = list(map(lambda x:x.text, container.select(".customResourceFieldmc_versions ul.plainList > li")))
      gitUrl = ""
      try:
        gitUrl = soup.select(".customResourceFieldsource_code dd > a")[0].get("href")
      except:
        gitUrl = ""
      description = container.select(".tagLine")[0].getText()
      itemsObject[i].append(mcVersions)
      itemsObject[i].append(gitUrl)
      itemsObject[i].append(description)
    except:
      itemsObject[i].append([""])
      itemsObject[i].append("")
      itemsObject[i].append("")

  for i in itemsObject:
    print("  \"" + i[3] + "\":  {")
    print("    \"name\": \"" + i[2] + "\",")
    print("    \"license\": \"\",")
    print("    \"gitUrl\": \"" + i[6] + "\",")
    print("    \"supportedApis\": [\"spigot\", \"paper\", \"glowkit\"],")
    print("    \"mcVersions\": " + str(i[5]) + ",")
    print("    \"description\": \"" + i[7] + "\"")
    print("""    \"releasesPage\": {
        \"type\": \"spigot\",
        \"url\": \"https://www.spigotmc.org/""" + i[1] + """\",
      },""")
    print("""    \"forum\": {
        \"bukkit.org\": {
          \"pageUrl\" : \"\",
          \"downloads\": 0,
        }
        \"spigotmc.org\": {
          \"pageUrl\": \"https://www.spigotmc.org/""" + i[0] + """\",
          \"downloads\": """ + str(i[4]) + """\",
        },
        \"papermc.io\": {
          \"pageUrl\": \"\",
        },
      },""")
    print("  },")

print("}")