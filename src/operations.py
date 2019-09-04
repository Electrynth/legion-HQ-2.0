#!/usr/bin/python

import os, json, csv
from string import ascii_lowercase, ascii_uppercase

def print_card_map():
    with open('data.json') as infile:
        data = json.load(infile)
    all_card_keys = data['allCards'].keys()
    with open('data.csv', 'w') as outfile:
        lines = []
        writer = csv.writer(outfile)
        lines.append(['id', 'name', 'type', 'info'])
        lines.append(['0', '', '', ''])
        for card_id in all_card_keys:
            card = data['allCards'][card_id]
            if 'rank' in card:
                row = [card_id, card['cardName'], card['cardType'], card['rank']]
            elif card['cardType'] == 'upgrade':
                row = [card_id, card['cardName'], card['cardType'], card['cardSubtype']]
            else:
                row = [card_id, card['cardName'], card['cardType'], card['cardSubtype']]
            lines.append(row)
        writer.writerows(lines)


def add_card(card_data):
    with open('newData.json') as infile:
        data = json.load(infile)
    all_card_keys = data['allCards'].keys()
    letters = list(ascii_lowercase)
    letters = [i+b for i in letters for b in letters]
    for id in letters:
        if id not in all_card_keys:
            card_data['id'] = id
            break
    for card_id in all_card_keys:
        if '_id' in data['allCards'][card_id]:
            del data['allCards'][card_id]['_id']
    if card_data['cardType'] == 'unit':
        card_data['imageLocation'] = '/images/unitCards/'+card_data['cardName'].replace(' ', '%20')+'.jpeg'
        card_data['iconLocation'] = '/images/unitIcons/'+card_data['cardName'].replace(' ', '%20')+'.jpeg'
    elif card_data['cardType'] == 'command':
        card_data['imageLocation'] = '/images/commandCards/'+card_data['cardName'].replace(' ', '%20')+'.jpeg'
        card_data['iconLocation'] = '/images/commandIcons/'+card_data['cardName'].replace(' ', '%20')+'.jpeg'
    elif card_data['cardType'] == 'upgrade':
        card_data['imageLocation'] = '/images/upgradeCards/'+card_data['cardName'].replace(' ', '%20')+'.jpeg'
        card_data['iconLocation'] = '/images/upgradeIcons/'+card_data['cardName'].replace(' ', '%20')+'.jpeg'
    elif card_data['cardType'] == 'battle':
        card_data['imageLocation'] = '/images/battleCards/'+card_data['cardName'].replace(' ', '%20')+'.jpeg'
    data['allCards'][card_data['id']] = card_data
    with open('newData.json', 'w') as outfile:
        json.dump(data, outfile, indent=2)

def sort_keywords():
    with open('cards.json') as infile:
        data = json.loads(infile)
    data['keywords'] = sorted(data['keywords'], key=lambda k: k)
    with open('cards.json', 'w') as outfile:
        json.dump(data, outfile)

def db_to_json():
    data = {}
    data['lines'] = []
    data['cards'] = {}
    data['unitCardsById'] = []
    data['upgradeCardsById'] = []
    data['commandCardsById'] = []
    data['battleCardsById'] = []
    with open('oldCards.json') as infile:
        for line in infile:
            data['lines'].append(json.loads(line))
    for line in data['lines']:
        line['id'] = line['code']
        del line['code']
        if line['cardType'] == 'unit':
            data['unitCardsById'].append(line['id'])
            line['imageLocation'] = '/images/unitCards/'+line['cardName']+'.jpeg'
            line['imageLocation'] = line['imageLocation'].replace(' ', '%20')
            line['iconLocation'] = '/images/unitIcons/'+line['cardName']+'.jpeg'
            line['iconLocation'] = line['iconLocation'].replace(' ', '%20')
        elif line['cardType'] == 'upgrade':
            data['upgradeCardsById'].append(line['id'])
            line['imageLocation'] = '/images/upgradeCards/'+line['cardName']+'.jpeg'
            line['imageLocation'] = line['imageLocation'].replace(' ', '%20')
            line['iconLocation'] = '/images/upgradeIcons/'+line['cardName']+'.jpeg'
            line['iconLocation'] = line['iconLocation'].replace(' ', '%20')
        elif line['cardType'] == 'command':
            data['commandCardsById'].append(line['id'])
            line['imageLocation'] = '/images/commandCards/'+line['cardName']+'.jpeg'
            line['imageLocation'] = line['imageLocation'].replace(' ', '%20')
            line['iconLocation'] = '/images/commandIcons/'+line['cardName']+'.jpeg'
            line['iconLocation'] = line['iconLocation'].replace(' ', '%20')
        elif line['cardType'] == 'battle':
            data['battleCardsById'].append(line['id'])
            line['imageLocation'] = '/images/battleCards/'+line['cardName']+'.jpeg'
            line['imageLocation'] = line['imageLocation'].replace(' ', '%20')
        data['cards'][line['id']] = line

    data['unitCardsById'] = sorted(data['unitCardsById'], key=lambda k: data['cards'][k]['cardName'])
    data['upgradeCardsById'] = sorted(data['upgradeCardsById'], key=lambda k: data['cards'][k]['cardName'])
    data['commandCardsById'] = sorted(data['commandCardsById'], key=lambda k: data['cards'][k]['cardName'])
    data['battleCardsById'] = sorted(data['battleCardsById'], key=lambda k: data['cards'][k]['cardName'])

    with open('newCards.json', 'w') as outfile:
        json.dump(data, outfile)

print_card_map()

# unit_card = {}
# unit_card['cost'] = 170
# unit_card['isUnique'] = False
# unit_card['faction'] = 'separatists'
# unit_card['cardName'] = 'AAT Trade Federation Battle Tank'
# unit_card['displayName'] = 'AAT Battle Tank'
# unit_card['cardType'] = 'unit'
# unit_card['cardSubtype'] = 'repulsor vehicle'
# unit_card['rank'] = 'heavy'
# unit_card['additionalTags'] = []
# unit_card['upgradeBar'] = ['pilot', 'comms']
# unit_card['links'] = []
# unit_card['keywords'] = ['AI', 'Armor', 'Barrage', 'Hover', 'Weak Point', 'Fixed', 'Critical', 'High Velocity', 'Impact']
# unit_card['products'] = []
# add_card(unit_card)

# upgrade_card = {}
# upgrade_card['cost'] = 4
# upgrade_card['isUnique'] = False
# upgrade_card['faction'] = ''
# upgrade_card['cardName'] = 'Offensive Push'
# upgrade_card['displayName'] = ''
# upgrade_card['cardType'] = 'upgrade'
# upgrade_card['cardSubtype'] = 'training'
# upgrade_card['keywords'] = ['Tactical']
# upgrade_card['products'] = []
# upgrade_card['requirements'] = []
# add_card(upgrade_card)

#
command_card = {}
command_card['faction'] = 'rebels'
command_card['cardName'] = 'I\'m Full of Surprises'
command_card['displayName'] = ''
command_card['cardType'] = 'command'
command_card['cardSubtype'] = '2'
command_card['commander'] = 'Luke Skywalker'
command_card['keywords'] = []
command_card['products'] = []
add_card(command_card)
