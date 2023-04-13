#! /usr/bin/env python3

import os
import pandas as pd
import json
import re

path = os.getcwd()

dataset_file = open(f'{path}/data/PT-UM-ADB-DIO-MAB-006.CSV','r')

# Load dataset
df = pd.read_csv(dataset_file, delimiter=';',quoting=1)

# Info about number of entries, columns and values in each
print(df.info())

# Drop all empty columns
for col in df.columns:
    if df[col].nunique() == 0:
        df.drop(col,axis=1,inplace=True)



# Save and Drop first line for being descriptive information
ds_info = df.iloc[0]
print(ds_info)
df.drop(index=0,axis=0,inplace=True)

# Drop columns because they have redundant information (available from other columns or from ds_info)
df.drop(['DescriptionLevel','UnitTitleType','CompleteUnitId','LangMaterial','AllowExtentsInference','AllowTextualContentInference','RepositoryCode','CountryCode','Repository','ApplySelectionTable','Highlighted'],axis=1,inplace=True)



pd.set_option('display.max_columns', None)
# Check changes
print(df.info())
print(df.nunique())
print(df.head())

# Get info from UnitTitle (name of the person)
df['UnitTitle'] = df['UnitTitle'].str.replace(r'.*de genere de\s+((\w+\b\s*)+)',r'\1', regex=True)


out = open(f'{path}/data/dataset.json','w')

# Create list of dict entries
list = []
columns = df.columns
for v in df.values:
    entry = {}
    for i,value in enumerate(v):
        entry[columns[i]] = value
    list.append(entry)


# Write to new file
json.dump(list,out,indent=4)

