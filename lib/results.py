#!/usr/bin/env python3.7

import json
import sqlite3
import itertools

choices = ["Amy Pond", "Bill Pots", "Clara Oswald", "Cptn Jack Harkness", "Donna Noble", "Graham OBrien", "Martha Jones", "Mickey Smith", "Nardole", "River Song", "Rory Pond", "Rose Tyler", "Ryan Sinclair", "Yasmin Khan"]

conn = sqlite3.connect('../etc/dw_comp_rankings.db')
curs = conn.cursor()
curs.execute(f'SELECT jsn FROM dw2018;')
results = [json.loads(i[0]) for i in curs.fetchall()]

for vote in results:
    for choice in vote:
        vote[choice] = int(vote[choice])

def instant_runoff(choices, results, needed=0.5):
    winners = []
    while len(winners) < 14:
        eliminated = list(winners)
        d = position(choices, results, eliminated)
        while d[0][1] < int(len(results) * needed) + 1:
            eliminated.append([i for i in d if i[0] not in eliminated][-1][0])
            d = position(choices, results, eliminated)
        winners.append(d[0][0])
    return winners

def combination_duel(choices, results):
    combs = itertools.combinations(choices, 2)
    winners = {'ties':[]}
    for choice in choices:
        winners[choice] = 0
    for pair in combs:
        d = {pair[0]: 0, pair[1]: 0}
        for vote in results:
            if vote[pair[0]] < vote[pair[1]]:
                d[pair[0]] += 1
            elif vote[pair[1]] < vote[pair[0]]:
                d[pair[1]] += 1
        if d[pair[0]] > d[pair[1]]:
            winners[pair[0]] += 1
        elif d[pair[1]] > d[pair[0]]:
            winners[pair[1]] += 1
        else:
            winners['ties'].append(d)
    k = winners['ties']
    del winners['ties']
    return [i[0] for i in sorted(winners.items(), key=lambda k: k[1], reverse = True)] + [('ties', k)]

def low_score(choices, results):
    winners = {}
    for choice in choices:
        winners[choice] = 0
    for vote in results:
        for choice in choices:
            winners[choice] += vote[choice]
    return [i[0] for i in sorted(winners.items(), key=lambda k: k[1])]

def position(choices, results, eliminated=[], place=1):
    winners = {}
    for choice in choices:
        winners[choice] = 0
    for vote in results:
        vote = [i for i in sorted(vote.items(), key=lambda k: k[1]) if i[0] not in eliminated]
        winners[vote[place - 1][0]] += 1
    return sorted(winners.items(), key=lambda k: k[1], reverse=True)

def the_dumb_thing_the_other_poll_did(choices, results):
    eliminated = []
    while len(eliminated) < 14:
        d = position(choices, results, eliminated, 0)
        eliminated.append(d[0][0])
    eliminated.reverse()
    return eliminated

def individual_places(choice, results):
    places = [0] * 15
    for vote in results:
        places[vote[choice]] += 1
    return places[1:]

with open('../var/dw2018_results.json', 'w',encoding="utf-8") as outfile:
    json.dump({'vote total': len(results),
    'instant runoff': {p: r for (p, r) in ((i, instant_runoff(choices, results, i)) for i in (0.5,0.67,0.75,0.9,0.99))},
    'combination duel': combination_duel(choices, results),
    'lowest aggregate': low_score(choices, results),
    'simple': [i[0] for i in position(choices, results)],
    'least hated': the_dumb_thing_the_other_poll_did(choices, results),
    'individual': {c: r for (c, r) in ((i, individual_places(i, results)) for i in choices)}
    }, outfile,indent=4,sort_keys=True,ensure_ascii=False)