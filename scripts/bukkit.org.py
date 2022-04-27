import re
import time
import logging
from bs4 import BeautifulSoup
import undetected_chromedriver as uc

driver = uc.Chrome()

print("{")
for i in range(1, 1345):
  logging.error("Page: " + str(i))
  try:
    driver.get('https://dev.bukkit.org/bukkit-plugins?filter-sort=5&page=' + str(i))
    if i % 30 == 1:
      time.sleep(6.5)

    soup = BeautifulSoup(driver.page_source, 'html.parser')

    items = soup.select(".project-list-item .details")
    itemsObject = []
    for i in items:
      link = i.select("div.name-wrapper.overflow-tip > a")[0].get("href")
      releases = link + "/files"
      title = i.select("div.name-wrapper.overflow-tip > a")[0].getText()
      downloads = int(i.select("div.info.stats > p.e-download-count")[0].getText().translate(str.maketrans("", "", ",")))
      description = i.select("div.description > p")[0].getText()
      itemsObject.append([
        link,
        releases,
        title,
        '-'.join(list(map(lambda x:x.lower(), re.findall(r'[a-zA-Z]+', title)))),
        downloads,
        description
      ])

    for i, x in enumerate(itemsObject):
      driver.get("https://dev.bukkit.org" + x[0])
      soup = BeautifulSoup(driver.page_source, 'html.parser')
      try:
        container = soup.select("div#site-main")[0]
        gitUrl = ""
        try:
          gitUrl = soup.select("ul.e-menu > li > a.external-link")[-1].get("href")
        except:
          gitUrl = ""
        projectLicense = ""
        try:
          projectLicense = container.select("ul.cf-details.project-details > li > div.info-data > a.modal-link > span.tip")[-1].get("title")
        except:
          projectLicense = container.select("ul.cf-details.project-details > li > div.info-data > a.modal-link")[-1].getText().strip()
        itemsObject[i].append([""])
        itemsObject[i].append(gitUrl)
        itemsObject[i].append(projectLicense)
      except:
        itemsObject[i].append([""])
        itemsObject[i].append("")
        itemsObject[i].append("")

    for i in itemsObject:
      print("  \"" + i[3] + "\":  {")
      print("    \"name\": \"" + i[2] + "\",")
      print("    \"license\": \""+ i[8] + "\",")
      print("    \"gitUrl\": \"" + i[7] + "\",")
      print("    \"supportedApis\": [\"bukkit\", \"spigot\", \"paper\", \"glowkit\"],")
      print("    \"gameVersions\": " + str(i[6]) + ",")
      print("    \"description\": \"" + i[5] + "\"")
      print("""    \"releasesPage\": [{
          \"type\": \"bukkit\",
          \"url\": \"https://dev.bukkit.org""" + i[1] + """\",
        }]""")
      print("""    \"forum\": {
          \"bukkit.org\": {
            \"pageUrl\": \"https://dev.bukkit.org""" + i[0] + """\",
            \"downloads\": """ + str(i[4]) + """\",
          }
          \"spigotmc.org\": {
            \"pageUrl\" : \"\",
            \"downloads\": 0,
          },
          \"papermc.io\": {
            \"pageUrl\": \"\",
          },
        },""")
      print("  },")
  except:
    i-=1

print("}")