#!/usr/local/bin/python3.7

import cgi
import cgitb
import sqlite3

from http import cookies

cgitb.enable(display=0, logdir='../etc')

form = cgi.FieldStorage()

dct = {}
for i in ('uuid', 'ranks'):
    dct[i] = form[i].value
conn = sqlite3.connect('../etc/dw_comp_rankings.db')
curs = conn.cursor()
curs.execute('INSERT INTO suzy VALUES (?, ?);', (dct['uuid'], dct['ranks']))
conn.commit()
conn.close()
print('Content-Type: text/html\n')
print('commit successful')