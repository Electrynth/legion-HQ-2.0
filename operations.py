#!/usr/bin/python

import os, json

def refresh_and_sort_cards():
    with open('cards.json') as infile:
        data = json.loads(infile)

    data['unitCardsById'] = sorted(data['unitCardsById'], key=lambda k: data['cards'][k]['cardName'])
    data['upgradeCardsById'] = sorted(data['upgradeCardsById'], key=lambda k: data['cards'][k]['cardName'])
    data['commandCardsById'] = sorted(data['commandCardsById'], key=lambda k: data['cards'][k]['cardName'])
    data['battleCardsById'] = sorted(data['battleCardsById'], key=lambda k: data['cards'][k]['cardName'])

    for card in data['cards']:
        if 'imageLocation' not in card:
            if card['cardType'] == 'unit':
                card['imageLocation'] = '/images/unitCards/'+card['cardName']+'.jpeg'
                card['imageLocation'] = card['imageLocation'].replace(' ', '%20')
                card['iconLocation'] = '/images/unitIcons/'+card['cardName']+'.jpeg'
                card['iconLocation'] = card['iconLocation'].replace(' ', '%20')
            elif line['cardType'] == 'upgrade':
                card['imageLocation'] = '/images/upgradeCards/'+card['cardName']+'.jpeg'
                card['imageLocation'] = card['imageLocation'].replace(' ', '%20')
                card['iconLocation'] = '/images/upgradeIcons/'+card['cardName']+'.jpeg'
                card['iconLocation'] = card['iconLocation'].replace(' ', '%20')
            elif line['cardType'] == 'command':
                card['imageLocation'] = '/images/commandCards/'+card['cardName']+'.jpeg'
                card['imageLocation'] = card['imageLocation'].replace(' ', '%20')
                card['iconLocation'] = '/images/commandIcons/'+card['cardName']+'.jpeg'
                card['iconLocation'] = card['iconLocation'].replace(' ', '%20')
            elif line['cardType'] == 'battle':
                card['imageLocation'] = '/images/battleCards/'+card['cardName']+'.jpeg'
                card['imageLocation'] = card['imageLocation'].replace(' ', '%20')
    with open('cards.json', 'w') as outfile:
        json.dump(data, outfile)


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
