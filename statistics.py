''' 
    ============================= 
    == GUSTAVO FARIA (11/2019) == 
    ============================= 

    ============================== STATISTICS ===============================
    "ball_possession",  "goal_attempts", "shots_on_goal", "shots_off_goal", 
    "blocked_shots",    "free_kicks",    "corner_kicks",  "offsides", 
    "total_passes",     "fouls",         "yellow_cards",  "goalkeeper_saves", 
    "completed_passes", "tackles",       "attacks",       "dangerous_attacks" 
    =========================================================================
'''

from tinydb import TinyDB, Query
import urllib.request
import os

class Statistics:
    def __init__(self, path='./data/'):
        self.__path = path
        if self.__path[len(self.__path) - 1] != '/': self.__path += '/'

        self.__db_path = self.__path + 'db/'
        self.__img_path = self.__path + 'img/'

        try: os.makedirs(self.__path)
        except: pass
        try: os.makedirs(self.__db_path)
        except: pass
        try: os.makedirs(self.__img_path)
        except: pass

    def __get_home_win(self, match):
        home_score = match['teams']['home']['score']
        away_score = match['teams']['away']['score']
        if home_score > away_score: return match


    def __get_home_lose(self, match):
        home_score = match['teams']['home']['score']
        away_score = match['teams']['away']['score']
        if home_score < away_score: return match


    def __get_home_draw(self, match):
        home_score = match['teams']['home']['score']
        away_score = match['teams']['away']['score']
        if home_score == away_score: return match


    def __get_url_team_image(self, country, championship, team, last_year=2019, first_year=0):
        if first_year == 0: first_year = last_year
        Match = Query()
        for year in range(int(first_year), int(last_year) + 1):
            try: 
                open(self.__db_path + country + '-' + championship + '-' + str(year) + '.json', 'r')
                db = TinyDB(self.__db_path + country + '-' + championship + '-' + str(year) + '.json')
                team_matches = db.search(Match.teams.home.name == team)
            except: 
                print('❌ \033[91m ERROR: FILE NOT FOUND FOR ' + str(year) + ' DATA\033[0m')
                continue

            if len(team_matches) != 0:
                url_image = team_matches[0]['teams']['home']['image']
                name = team_matches[0]['teams']['home']['name']

                path = self.__img_path + country + '-' + championship + '/'
                try: os.mkdir(path)
                except: pass
                urllib.request.urlretrieve(url_image, path + name + ".jpg")

                return url_image


    def get_win_matches(self, country, championship, team, last_year, first_year=0):
        if first_year == 0: first_year = last_year
        Match = Query()
        win_matches = []
        for year in range(int(first_year), int(last_year) + 1):
            try: 
                open(self.__db_path + country + '-' + championship + '-' + str(year) + '.json', 'r')
                db = TinyDB(self.__db_path + country + '-' + championship + '-' + str(year) + '.json')
                home_wins = list(filter(lambda win: win != None, map(self.__get_home_win, db.search(Match.teams.home.name == team))))
                home_loses = list(filter(lambda lose: lose != None, map(self.__get_home_lose, db.search(Match.teams.away.name == team))))
                win_matches += home_wins + home_loses
            except: 
                print('❌ \033[91m ERROR: FILE NOT FOUND FOR ' + str(year) + ' DATA\033[0m')
                continue

        return win_matches


    def get_lose_matches(self, country, championship, team, last_year, first_year=0):
        if first_year == 0: first_year = last_year
        Match = Query()
        lose_matches = []
        for year in range(int(first_year), int(last_year) + 1):
            try: 
                open(self.__db_path + country + '-' + championship + '-' + str(year) + '.json', 'r')
                db = TinyDB(self.__db_path + country + '-' + championship + '-' + str(year) + '.json')
                home_loses = list(filter(lambda win: win != None, map(self.__get_home_lose, db.search(Match.teams.home.name == team))))
                home_wins = list(filter(lambda lose: lose != None, map(self.__get_home_win, db.search(Match.teams.away.name == team))))
                lose_matches += home_loses + home_wins
            except: 
                print('❌ \033[91m ERROR: FILE NOT FOUND FOR ' + str(year) + ' DATA\033[0m')
                continue

        return lose_matches


    def get_draw_matches(self, country, championship, team, last_year, first_year=0):
        if first_year == 0: first_year = last_year
        Match = Query()
        draw_matches = []
        for year in range(int(first_year), int(last_year) + 1):
            try: 
                open(self.__db_path + country + '-' + championship + '-' + str(year) + '.json', 'r')
                db = TinyDB(self.__db_path + country + '-' + championship + '-' + str(year) + '.json')
                home_draw = list(filter(lambda draw: draw != None, map(self.__get_home_draw, db.search(Match.teams.home.name == team))))
                away_draw = list(filter(lambda draw: draw != None, map(self.__get_home_draw, db.search(Match.teams.away.name == team))))
                draw_matches += home_draw + away_draw
            except: 
                print('❌ \033[91m ERROR: FILE NOT FOUND FOR ' + str(year) + ' DATA\033[0m')
                continue
            
        return draw_matches

    def get_statistic_by_team(self, country, championship, team, statistic, last_year, first_year=0):
        if first_year == 0: first_year = last_year
        Match = Query()
        results = []
        for year in range(int(first_year), int(last_year) + 1):
            try: 
                open(self.__db_path + country + '-' + championship + '-' + str(year) + '.json', 'r')
                db = TinyDB(self.__db_path + country + '-' + championship + '-' + str(year) + '.json')
                team_home_matches = db.search(Match.teams.home.name == team)
                team_away_matches = db.search(Match.teams.away.name == team)
            except: 
                print('❌ \033[91m ERROR: FILE NOT FOUND FOR ' + str(year) + ' DATA\033[0m')
                continue
            
            for match in team_home_matches:
                try: results.append(match['statistics'][statistic]['home'])
                except: continue
            for match in team_away_matches:
                try: results.append(match['statistics'][statistic]['away'])
                except: continue
        
        return list(map(lambda match_id: match_id.replace('%', ''), results))


    def get_teams(self, country, championship, last_year, first_year=0):
        if first_year == 0: first_year = last_year
        Match = Query()
        teams = []
        for year in range(int(first_year), int(last_year) + 1):
            try: 
                open(self.__db_path + country + '-' + championship + '-' + str(year) + '.json', 'r')
                db = TinyDB(self.__db_path + country + '-' + championship + '-' + str(year) + '.json')
                matches = db.search(Match)
            except: 
                print('❌ \033[91m ERROR: FILE NOT FOUND FOR ' + str(year) + ' DATA\033[0m')
                continue

            for match in matches:
                teams.append(match['teams']['home']['name'])
            
        return sorted(set(teams))
