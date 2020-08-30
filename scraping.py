''' 
    ============================= 
    == GUSTAVO FARIA (11/2019) == 
    ============================= 
'''

from datetime import datetime
from tinydb import TinyDB, Query
import urllib.request
import time
import os
import shutil


class Scraping:
    def __init__(self, path='./data/'):
        self.__date = datetime.now().strftime('%Y%m%d%H%M%S')
        
        self.__path = path
        if self.__path[len(self.__path) - 1] != '/': self.__path += '/'

        self.__db_path = self.__path + 'db/'
        self.__log_path = self.__path + 'log/'
        self.__backup_path = self.__path + 'backup/'
        self.__img_path = self.__path + 'img/'

        try: os.makedirs(self.__path)
        except: pass
        try: os.makedirs(self.__db_path)
        except: pass
        try: os.makedirs(self.__log_path)
        except: pass
        try: os.makedirs(self.__backup_path)
        except: pass
        try: os.makedirs(self.__img_path)
        except: pass

    def __get_matches_id(self, country, championship, year, driver):
        url = 'https://www.flashscore.com/football/' + country + '/' + championship + '-' + year + '/results/'
        driver.get(url)
        
        while True:
            try:
                time.sleep(5)
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(5)
                driver.find_element_by_css_selector('a.event__more.event__more--static').click()
            except:
                break

        matches_id = driver.find_elements_by_css_selector('div.event__match.event__match--static.event__match--oneLine')
        matches_id = [div.get_attribute('id') for div in matches_id]  
        matches_id = list(map(lambda match_id: match_id.replace('g_1_', ''), matches_id))

        return matches_id


    def  __handle_get_matches_id(self, country, championship, year, driver):
        matches_id = self.__get_matches_id(country, championship, str(year), driver)
        if matches_id == []:
            aux_year = str(year) + '-' + str(int(year) + 1)
            matches_id = self.__get_matches_id(country, championship, str(aux_year),  driver)
        if matches_id == []:
            print('❌\033[91m  ERROR: ' + country.upper() + ' ' + championship.upper() + ' ' + str(year) + ' NOT FOUND\033[0m\n')
            return []
        self.__save_collected_ids(country, championship, year, matches_id)
        return matches_id
    

    def __create_match_data(self, date, teams, result, images, statistics_title=[], statistics_home='', statistics_away=''):
        data = {}
        data['date'] = date
        data['teams'] = {}
        data['teams']['home'] = {}
        data['teams']['away'] = {}
        data['teams']['home']['name'] = teams[0]
        data['teams']['away']['name'] = teams[1]
        data['teams']['home']['score'] = result[0]
        data['teams']['away']['score'] = result[1]
        data['teams']['home']['image'] = images[0]
        data['teams']['away']['image'] = images[1]
        data['statistics'] = {}
        for index, title in enumerate(statistics_title):
            data['statistics'][title] = {}
            data['statistics'][title]['home'] = statistics_home[index]
            data['statistics'][title]['away'] = statistics_away[index]

        return data


    def __save_match(self, match_id, driver, db):
        url = 'https://www.flashscore.com/match/' + match_id + '/#match-statistics;0'
        driver.get(url)

        time.sleep(2)

        date = driver.find_element_by_css_selector('#utime').text

        teams = driver.find_elements_by_css_selector('a.participant-imglink')
        teams = [a.text for a in teams]
        teams = list(filter(lambda team: team != '', teams))

        result = driver.find_elements_by_css_selector('span.scoreboard')
        result = [span.text for span in result]
        result = list(filter(lambda score: score != '', result))

        images = driver.find_elements_by_css_selector('a.participant-imglink img')
        images = [span.get_attribute('src') for span in images]
        images = list(filter(lambda score: score != '', images))

        statistics_title = driver.find_elements_by_css_selector('div.statText--titleValue')
        statistics_title = [div.text for div in statistics_title]
        statistics_title = list(filter(lambda statistic: statistic != '', statistics_title))
        statistics_title = list(map(lambda title: title.replace(' ', '_'), statistics_title))
        statistics_title = list(map(lambda title: title.lower(), statistics_title))

        statistics_home = driver.find_elements_by_css_selector('div.statText--homeValue')
        statistics_home = [div.text for div in statistics_home]
        statistics_home = list(filter(lambda statistic: statistic != '', statistics_home))

        statistics_away = driver.find_elements_by_css_selector('div.statText--awayValue')
        statistics_away = [div.text for div in statistics_away]
        statistics_away = list(filter(lambda statistic: statistic != '', statistics_away))

        data = self.__create_match_data(date, teams, result, images, statistics_title, statistics_home, statistics_away)
        db.insert(data)


    def __create_backup(self, file_name):
        try:
            backup_name = file_name.replace('.json', ('-' + self.__date + '.json'))
            shutil.move(self.__db_path + file_name, self.__backup_path + backup_name)
        except: pass


    def __save_collected_ids(self, country, championship, year, matches_id):
        file = 'ids-' + self.__date + '.txt'
        with open(self.__log_path + file, 'a+', encoding='utf-8') as outfile:
            outfile.write(datetime.now().strftime('%Y/%m/%d %H:%M:%S') + ' ' + country + ' ' + championship + ' ' + str(year) + '\n')
            outfile.write(str(matches_id) + '\n\n')
        print('✔️\033[92m MATCHES ID COLLECTED: ' + str(len(matches_id)) + '\033[0m')


    def __save_log_erros(self, country, championship, year, match_id):
        file = 'error-' + self.__date + '.txt'
        with open(self.__log_path + file, 'a+', encoding='utf-8') as outfile:
            outfile.write(datetime.now().strftime('%Y/%m/%d %H:%M:%S') + ' ' + country + ' ' + championship + ' ' + str(year) + ' - ' + match_id + '\n')
        print('❌\033[91m  ERROR WHILE COLLECT MATCH: ' + str(match_id) + '\033[0m')


    def __open_db(self, country, championship, year):
        file_name = country + '-' + championship + '-' + str(year) + '.json'
        self.__create_backup(file_name)
        return TinyDB(self.__db_path + file_name)


    def __save_all_teams_image(self, country, championship, last_year, first_year=0):
        if first_year == 0: first_year = last_year
        Match = Query()
        path = self.__img_path + country + '-' + championship + '/'
        try: os.makedirs(path)
        except: pass

        all_teams_image = []
        for year in range(int(first_year), int(last_year) + 1):
            try: 
                file = country + '-' + championship + '-' + str(year) + '.json'
                open(self.__db_path + file, 'r')
                db = TinyDB(self.__db_path + file)
            except: 
                print('❌ \033[91m ERROR: FILE NOT FOUND FOR ' + str(year) + ' DATA\033[0m')
                continue
                
            for match in db.search(Match):
                url_image = match['teams']['home']['image']
                name = match['teams']['home']['name']
                all_teams_image.append({'url_image': url_image, 'name': name})

        if all_teams_image == []: 
            return print('❌ \033[91m ERROR: TEAMS IMAGES WASN\'T BEEN DOWNLOADED\033[0m\n')
        aux_all_teams_image = [] 
        for i in range(len(all_teams_image)): 
            if all_teams_image[i] not in all_teams_image[i + 1:]: 
                aux_all_teams_image.append(all_teams_image[i])
        all_teams_image = aux_all_teams_image

        print('🚀\033[96m STARTING IMAGES DOWNLOAD\033[0m')
        count = 0
        for team in all_teams_image:
            percentage = '\033[96m' + str(round((count/len(all_teams_image))*100, 2)) + '% \033[0m'
            print('  \033[K', percentage, end='\r')
            try:
                urllib.request.urlretrieve(team['url_image'], path + team['name'] + ".png")
                print('💾\033[93m ' + team['name'].upper() + ' IMAGE HAS BEEN DOWNLOADED\033[0m')
            except:
                print('❌\033[91m  ERROR: ' + team['name'].upper() + ' IMAGE WASN\'T BEEN DOWNLOADED\033[0m')
            count += 1


    def collect(self, driver, country, championship, last_year, first_year=0):
        if first_year == 0: first_year = last_year
        country = country.lower()
        championship = championship.lower()

        for year in range(int(first_year), int(last_year) + 1):
            start = datetime.now()
            print('⚽️\033[93m ' + country.upper() + ' ' + championship.upper() + ' ' + str(year) + ' (' + start.strftime('%m/%d/%Y %H:%M:%S') + ')\033[0m')
            
            matches_id = self.__handle_get_matches_id(country, championship, year, driver)
            if matches_id == []: continue

            db = self.__open_db(country, championship, year)

            count = 1
            for match_id in matches_id:
                percentage = '\033[96m' + str(round((count/len(matches_id))*100, 2)) + '% \033[0m'
                print('  \033[K', percentage, end='\r')

                try: self.__save_match(str(match_id), driver, db)
                except: self.__save_log_erros(country, championship, year, match_id)
                
                count += 1

            self.__save_all_teams_image(country, championship, year)

            runtime = str(datetime.now() - start)
            print('✔️\033[92m ' + country.upper() + ' ' + championship.upper() + ' ' + str(year) + ' FINISHED IN: ' + runtime + '\033[0m\n')
