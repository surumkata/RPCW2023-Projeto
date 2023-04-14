#! /usr/bin/env python3

import os
import pandas as pd
import json
import re
import traceback

path = os.getcwd()


dataset_file = open(f'{path}/data/PT-UM-ADB-DIO-MAB-006.CSV','r')

# Load dataset
df = pd.read_csv(dataset_file, delimiter=';',quoting=1)

# Info about number of entries, columns and values in each
# print(df.info())

# Drop all empty columns
for col in df.columns:
    if df[col].nunique() == 0:
        df.drop(col,axis=1,inplace=True)
    else:
        df[col].fillna(value='null',inplace=True)



# Save and Drop first line for being descriptive information
ds_info = df.iloc[0]
# print(ds_info)
df.drop(index=0,axis=0,inplace=True)

# Drop columns because they have redundant information (available from other columns or from ds_info)
df.drop(['DescriptionLevel','UnitTitleType','CompleteUnitId','LangMaterial','AllowExtentsInference','AllowTextualContentInference','RepositoryCode','CountryCode','Repository','ApplySelectionTable','Highlighted'],axis=1,inplace=True)



pd.set_option('display.max_columns', None)
# Check changes
# print(df.info())
# print(df.nunique())
# print(df.head())

# Get info from UnitTitle (name of the person(s))
df['UnitTitle'] = df['UnitTitle'].str.replace(r'.*de genere de\s+((\w+\b\s*)+)',r'\1', regex=True)
df['UnitTitle'] = df['UnitTitle'].map(lambda x: x.split(' e '),na_action='ignore')

# Get info from ScopeContent
filiations = []
birthplace = []
current_concelho = []
current_district = []

re_scopecontent= r'(.+:(.+)\..+)?residente em\s*(.+),.*concelho de (.+?)( e distrito\s*(\(.+?\))?\s*(.+?))?\.(.+)?'
people_id_dic = {}
for i in df.index:
    e = df.iloc[i-1]
    try:
        id = e['ID']
        people = e['UnitTitle']
        scopecontent = e['ScopeContent']
        scopecontent = re.sub(re_scopecontent,r'\2|\3|\4|\7',scopecontent)
        fields = scopecontent.split('|')
        fil = [x.strip() for x in fields[0].split(' e ')]
        birth = fields[1]
        cur_concelho = fields[2]
        cur_district = fields[3]
        for p in people:
            if not p in people_id_dic:
                people_id_dic[p] = {}
            people_id_dic[p][id] = fil
        filiations.append(fil)
        birthplace.append(birth)
        current_concelho.append(cur_concelho)
        current_district.append(cur_district)
    except Exception as error:
        print(e)
        print(traceback.format_exc())
        exit(1)

df['filiations'] = filiations
df['birthplace'] = birthplace
df['current_concelho'] = current_concelho
df['current_district'] = current_district
df.drop('ScopeContent',axis=1,inplace=True)

# Make new field to directly link relations if possible
# relations_id = []

# for i in df.index:
#     e = df.iloc[i-1]
#     try:
#         id = e['ID']
#         print(id)
#         people = e['UnitTitle']
#         fil = e['filiations']
#         rel = set()
#         # for each person of the doc
#         for p in people:
#             found = False
#             # for each afiliation
#             for f in fil:
#                 if f in people_id_dic:
#                     # check if the afiliated afiliates to the person
#                     for key,filiation in people_id_dic[f].items():
#                         if p in filiations:
#                             rel.add(key)
#                             print('----------------found------------------')
#                             found = True
#                             break
#                     if found:
#                         break
                            
#         relations_id.append(rel)
#     except Exception:
#         print(e)
#         print(traceback.format_exc())
#         exit(1)

# df['relations_id'] = relations_id



out = open(f'{path}/data/dataset.json','w')

df.to_json(out,orient= 'records',indent=4)

