#! /usr/bin/env python3

import os
import pandas as pd
import json
import re
import traceback
import time

path = os.getcwd()



def get_info_scopecontent(fields):
    '''Get info from groups of scopecontent field'''
    fil = []
    if fields[1]:
        fil = [x.strip() for x in fields[1].split(' e ')]
    birth = 'null'
    if fields[2]:
        birth = fields[2]
    cur_concelho = 'null'
    if fields[3]:
        cur_concelho = fields[3]
    cur_district = 'null'  
    if fields[4]:
        cur_district = fields[6]
    other = fields[7]
    return [fil, birth, cur_concelho,cur_district,other]
    











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
df.reset_index(drop=True, inplace=True)

# Drop columns because they have redundant information (available from other columns or from ds_info)
df.drop(['DescriptionLevel','UnitTitleType','CompleteUnitId','LangMaterial','AllowExtentsInference','AllowTextualContentInference','RepositoryCode','CountryCode','Repository','ApplySelectionTable','Highlighted'],axis=1,inplace=True)



pd.set_option('display.max_columns', None)
# Check changes
print(df.info())
print(df.nunique())
print(df.head())

# Get info from UnitTitle (name of the person(s))
df['UnitTitle'] = df['UnitTitle'].str.replace(r'.*de genere de\s+((\w+\b\s*)+)',r'\1', regex=True)
df['UnitTitle'] = df['UnitTitle'].map(lambda x: x.split(' e '),na_action='ignore')

# Change id from numeric to string
df['ID'] = df['ID'].astype(str)

# Make new field to directly link relations if possible
relations_id = []
count = 0
for i in df.index:
    e = df.iloc[i]
    try:
        id = e['ID']
        people = e['UnitTitle']
        rel = []              
        relations = e['RelatedMaterial']
        if relations != 'null':
            groups = re.findall(r',([^,]+)\.\s*Proc\.(\d+)',relations)
            if groups:
                j = 0
                while j < len(groups):
                    rel_id = int(groups[j][1])
                    person = df.iloc[rel_id]
                    rel.append({'type':groups[j][0],'id':person['ID'],'name':person['UnitTitle'][0]})
                    j += 1
                count+=1
        relations_id.append(rel)
    except Exception:
        print(e)
        print(traceback.format_exc())
        exit(1)



# Get info from ScopeContent
affiliations = []
birthplace = []
current_concelho = []
current_district = []

re_scopecontent= r'(.+:(.+)\..+)?residente em\s*(.+),.*concelho de (.+?)( e distrito\s*(\(.+?\))?\s*(.+?))?\.(.+)?'

for i in df.index:
    e = df.iloc[i]
    try:
        id = e['ID']
        people = e['UnitTitle']
        note = e['Note']
        scopecontent = e['ScopeContent']
        fields = re.search(re_scopecontent,scopecontent).groups()
        fil,birth,cur_concelho,cur_district,other = get_info_scopecontent(fields)
        # Other may have aditional relation information
        if other:
            rel = re.findall(r',([^,]+)\.\s*Proc\.(\d+)',other)
            if rel:
                j = 0
                while j < len(rel):
                    rel_id = int(rel[j][1])
                    person = df.iloc[rel_id]
                    relations_id[i].append({rel_id:rel[j][0],'id':person['ID']})
                    j += 1
                count+=1
        if note != 'null':
            rel = re.findall(r',([^,]+)\.\s*Proc\.(\d+)',note)
            if rel:
                j = 0
                while j < len(rel):
                    rel_id = int(rel[j][1])
                    person = df.iloc[rel_id]
                    relations_id[i].append({rel_id:rel[j][0],'id':person['ID']})
                    j += 1
                count+=1
        
        affiliations.append(fil)
        birthplace.append(birth)
        current_concelho.append(cur_concelho)
        current_district.append(cur_district)
    except Exception as error:
        print(rel)
        print(e)
        print(traceback.format_exc())
        exit(1)

df['affiliations'] = affiliations
df['birthplace'] = birthplace
df['current_concelho'] = current_concelho
df['current_district'] = current_district
df.drop('ScopeContent',axis=1,inplace=True)

print('count',count)


df['relations_id'] = relations_id

df.rename({'ID':'_id'},axis=1,inplace=True)

out = open(f'{path}/data/dataset.json','w')

df.to_json(out,orient= 'records',indent=4)

