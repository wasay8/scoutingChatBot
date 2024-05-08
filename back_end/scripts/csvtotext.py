 # -*- coding: utf-8 -*-
import pandas as pd
import os

dir_path = r"../csv_data"
file_list = os.listdir(dir_path)

header = "This is a document that documents all the players who have the potential to become college football players.\n"
report = "2023 Arch Manning is a QB from Isidore Newman HS. Manning is 7'6 and 215 lbs. He is quick on his feet and moves with ease. This young man has great flexibility and uses his hips to change direction to explode to the ball. He is able to read the play well and stop the running game. Manning is able to use his strength to shred the blockers. This young man is very physical and understands what it takes to get the job done. When not on the field He is working to better his game, and is able to use his skills on the football field. Manning also understands that grades are important and maintains a 3.91 GPA. He is looking to prosper in a college that offers a great engineering program. Coaches I see this young man as someone who will able to compliment any program and will fit in well in any environment he is put into. Manning has been able to overcome many obstacles some more than others but he never let the doubt or what if's stand in his way. He was able to throw all the challenges up and tackled them up with pure dedication and shear determination.\n"
content = ""

for path in file_list:
    df = pd.read_csv(os.path.join(dir_path,path))
    players = df.dropna()
    for idx, player in players.iterrows():
        name = player['Name']
        year = player['Year']
        high_school = player['School']
        state = player['StateProvince']
        postion = player['Position']
        rank = player['Ranking']
        height = str(player['Height'])
        height_0 = height[0]
        height_1 = height[1]
        weight = player['Weight']
        star = player['Stars']
        country = player['Country']
        temple = f"{name} is a {country}'s football player from {high_school}, {state} in {year}. {name} positon is {postion} and {name} is {height_0}'{height_1} and {weight} lbs. This young man rank {rank} and media value him as {star} stars.\n"
        content+=temple
        if idx>120:
            break
content = header+report+content
with open(r"../generated_data/High_school_player_information.txt",'w') as f:
	f.write(content)
