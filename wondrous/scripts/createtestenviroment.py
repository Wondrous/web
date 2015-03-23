import csv
import random

scale = 10000
# USERS ID, NAME, IS_PRIVATE
with open('users.csv','wb') as csvfile:
    writer = csv.writer(csvfile, delimiter='|', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    for i in range(scale):
        writer.writerow(['%d'%(i)]+['%d'%(i)]+['t' if i%30==0 else 'f'])

# FEEDS ID, NAME, IS_PRIVATE
with open('feeds.csv','wb') as csvfile:
    writer = csv.writer(csvfile, delimiter='|', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    for i in range(scale):
        writer.writerow(['%d'%(i)]+['%d'%(i)])

# FeedPostLink ID, NAME, IS_PRIVATE
with open('feed_post_links.csv','wb') as csvfile:
    writer = csv.writer(csvfile, delimiter='|', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    for i in range(100*scale):
        writer.writerow(['%d'%(i)]+['%d'%(random.randint(0,10*scale-1))]+['%d'%(random.randint(0,scale-1))])

# POST, ID, USER_ID
with open('posts.csv','wb') as csvfile:
    writer = csv.writer(csvfile, delimiter='|', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    for i in range(10*scale):
        writer.writerow(['%d'%(i)]+['%d'%(random.randint(0,scale-1))])

# FOLLOW VOTE ID, USER_ID, USER_ID, STATUS
last = 0
with open('follow_votes.csv','wb') as csvfile:
    writer = csv.writer(csvfile, delimiter='|', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    for i in range(50*scale):
        writer.writerow(['%d'%(i)]+['%d'%(random.randint(0,scale-1))]+['%d'%(random.randint(0,scale-1))]+['6'])
        last = i
# LIKE VOTE ID, USER_ID, USER_ID, STATUS
with open('like_votes.csv','wb') as csvfile:
    writer = csv.writer(csvfile, delimiter='|', quotechar='|', quoting=csv.QUOTE_MINIMAL)
    for i in range(last+1,100*scale+last):
        writer.writerow(['%d'%(i)]+['%d'%(random.randint(0,scale*10-1))]+['%d'%(random.randint(0,scale*10-1))]+['1'])
