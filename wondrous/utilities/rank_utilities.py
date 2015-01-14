#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# RANK_UTILITIES.PY
#

import operator

class RankUtilities(object):

    @staticmethod
    def rank_score(up_votes, down_votes):

        """

            ***
                NOT IN USE, BUT KEPT SO IF WE WANT TO ALGORITHMICALLY
                RANK ITEMS, WE CAN.
            ***

            PURPOSE: The algorithm to rank items
        
            USE: Call like: RankUtilities.rank_score(<int>, <int>)
        
            PARAMS: 2 params, int up_votes and int down_votes
        
            RETURNS: A integer that is the "score" of a particular item
        """

        return 1

    @staticmethod
    def rank_items(item_list):

        """

            ***
                NOT IN USE, BUT KEPT SO IF WE WANT TO ALGORITHMICALLY
                RANK ITEMS, WE CAN.
            ***

            PURPOSE: Rank a list of items, given their some
            set of data on which to rank
        
            USE: Call like: RankUtilities.rank_items(<list>)
        
            PARAMS: 1 param, list of dictionaries, item_list
        
            RETURNS: A list of the original item_list,
            with each value's dictionary containing a
            new key 'rank_score', whose value is used
            to sort the list.
        """

        ranked_items = []

        for item in item_list:
            item['rank_score'] = RankUtilities.rank_score()
            ranked_items.append([item['rank_score'], item])

        ranked_items.sort(key=operator.itemgetter(0), reverse=True)
        return [item[1] for item in ranked_items]
