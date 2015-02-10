#!/usr/bin/env python
# -*- coding: utf-8 -*-

#
# Company: WONDROUS
# Created by: John Zimmerman
#
# UTILITIES/_URL_REGEX_PATTERN.PY
#

"""
	This file is dedicated to determining the URL regex for Wondrous.
	This is based off Twitter's URL regex.
"""

PATTERN = u"((?:(http|https|Http|Https|rtsp|Rtsp):\\/\\/(?:(?:[a-zA-Z0-9\\$\\-\\_\\.\\+\\!\\*\\'\\(\\)" + \
	"\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,64}(?:\\:(?:[a-zA-Z0-9\\$\\-\\_" + \
	"\\.\\+\\!\\*\\'\\(\\)\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,25})?\\@)?)?" + \
	"((?:(?:[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}\\.)+" + \
	"(?:" + \
	"(?:ABOGADO|ACADEMY|ACCOUNTANTS|ACTIVE|ACTOR|AERO|AGENCY|AIRFORCE|ALLFINANZ|ALSACE|ANDROID|ARCHI|ARMY|ARPA|ASIA|ASSOCIATES|ATTORNEY|AUCTION|AUDIO|AUTOS|AXA|a[cdefgilmnoqrstuwxz])" + \
	"|(?:BAND|BAR|BARGAINS|BAYERN|BEER|BERLIN|BEST|BID|BIKE|BIO|BIZ|BLACK|BLACKFRIDAY|BLOOMBERG|BLUE|BMW|BNPPARIBAS|BOO|BOUTIQUE|BRUSSELS|BUDAPEST|BUILD|BUILDERS|BUSINESS|BUZZ|BZH|b[abdefghijmnorstvwyz])" + \
	"|(?:CAB|CAL|CAMERA|CAMP|CANCERRESEARCH|CAPETOWN|CAPITAL|CARAVAN|CARDS|CARE|CAREER|CAREERS|CASA|CASH|CAT|CATERING|CENTER|CEO|CERN|CHANNEL|CHEAP|CHRISTMAS|CHROME|CHURCH|CITIC|CITY|CLAIMS|CLEANING|CLICK|CLINIC|CLOTHING|CLUB|CODES|COFFEE|COLLEGE|COLOGNE|COM|COMMUNITY|COMPANY|COMPUTER|CONDOS|CONSTRUCTION|CONSULTING|CONTRACTORS|COOKING|COOL|COOP|COUNTRY|CREDIT|CREDITCARD|CRS|CRUISES|CUISINELLA|CYMRU|c[acdfghiklmnoruvxyz])" + \
	"|(?:DAD|DANCE|DATING|DAY|DEALS|DEGREE|DELIVERY|DEMOCRAT|DENTAL|DENTIST|DESI|DIAMONDS|DIET|DIGITAL|DIRECT|DIRECTORY|DISCOUNT|DNP|DOMAINS|DURBAN|DVAG|d[ejkmoz])" + \
	"|(?:EAT|EDU|EDUCATION|EMAIL|EMERCK|ENERGY|ENGINEER|ENGINEERING|ENTERPRISES|EQUIPMENT|ESQ|ESTATE|EUS|EVENTS|EXCHANGE|EXPERT|EXPOSED|e[cegrstu])" + \
	"|(?:FAIL|FARM|FEEDBACK|FINANCE|FINANCIAL|FISH|FISHING|FITNESS|FLIGHTS|FLORIST|FLSMIDTH|FLY|FOO|FORSALE|FOUNDATION|FRL|FROGANS|FUND|FURNITURE|FUTBOL|f[ijkmor])" + \
	"|(?:GAL|GALLERY|GBIZ|GENT|GIFT|GIFTS|GIVES|GLASS|GLE|GLOBAL|GLOBO|GMAIL|GMO|GMX|GOOGLE|GOP|GOV|GRAPHICS|GRATIS|GREEN|GRIPE|GUIDE|GUITARS|GURU|g[abdefghilmnpqrstuwy])" + \
	"|(?:HAMBURG|HAUS|HEALTHCARE|HELP|HERE|HIPHOP|HIV|HOLDINGS|HOLIDAY|HOMES|HORSE|HOST|HOSTING|HOUSE|HOW|h[kmnrtu])" + \
	"|(?:IBM|IMMO|IMMOBILIEN|INDUSTRIES|INFO|ING|INK|INSTITUTE|INSURE|INT|INTERNATIONAL|INVESTMENTS|i[delmnoqrst])" + \
	"|(?:JETZT|JOBS|JOBURG|JUEGOS|j[emop])" + \
	"|(?:KAUFEN|KIM|KITCHEN|KIWI|KOELN|KRD|KRED|k[eghimnrwyz])" + \
	"|(?:LACAIXA|LAND|LAWYER|LEASE|LGBT|LIFE|LIGHTING|LIMITED|LIMO|LINK|LOANS|LONDON|LOTTO|LTDA|LUXE|LUXURY|l[abcikrstuvy])" + \
	"|(?:MAISON|MANAGEMENT|MANGO|MARKET|MARKETING|MEDIA|MEET|MELBOURNE|MEME|MENU|MIAMI|MIL|MINI|MOBI|MODA|MOE|MONASH|MORTGAGE|MOSCOW|MOTORCYCLES|MOV|MUSEUM|m[acdghklmnopqrstuvwxyz])" + \
	"|(?:NAGOYA|NAME|NAVY|NET|NETWORK|NEUSTAR|NEW|NEXUS|NGO|NHK|NINJA|NRA|NRW|NYC|n[acefgilopruz])" + \
	"|(?:OKINAWA|ONG|ONL|OOO|ORG|ORGANIC|OTSUKA|OVH|om)" + \
	"|(?:PARIS|PARTNERS|PARTS|PHARMACY|PHOTO|PHOTOGRAPHY|PHOTOS|PHYSIO|PICS|PICTURES|PINK|PIZZA|PLACE|PLUMBING|POHL|POKER|POST|PRAXI|PRESS|PRO|PROD|PRODUCTIONS|PROF|PROPERTIES|PROPERTY|PUB|p[aefghklmnrstwy])" + \
	"|(?:QPON|QUEBEC|qa)" + \
	"|(?:REALTOR|RECIPES|RED|REHAB|REISE|REISEN|REIT|REN|RENTALS|REPAIR|REPORT|REPUBLICAN|REST|RESTAURANT|REVIEWS|RICH|RIO|RIP|ROCKS|RODEO|RSVP|RUHR|RYUKYU|REALTOR|RECIPES|RED|REHAB|REISE|REISEN|REIT|REN|RENTALS|REPAIR|REPORT|REPUBLICAN|REST|RESTAURANT|REVIEWS|RICH|RIO|RIP|ROCKS|RODEO|RSVP|RUHR|RYUKYU|REALTOR|RECIPES|RED|REHAB|REISE|REISEN|REIT|REN|RENTALS|REPAIR|REPORT|REPUBLICAN|REST|RESTAURANT|REVIEWS|RICH|RIO|RIP|ROCKS|RODEO|RSVP|RUHR|RYUKYU|REALTOR|RECIPES|RED|REHAB|REISE|REISEN|REIT|REN|RENTALS|REPAIR|REPORT|REPUBLICAN|REST|RESTAURANT|REVIEWS|RICH|RIO|RIP|ROCKS|RODEO|RSVP|RUHR|RYUKYU|REALTOR|RECIPES|RED|REHAB|REISE|REISEN|REIT|REN|RENTALS|REPAIR|REPORT|REPUBLICAN|REST|RESTAURANT|REVIEWS|RICH|RIO|RIP|ROCKS|RODEO|RSVP|RUHR|RYUKYU|r[eouw])" + \
	"|(?:SAARLAND|SARL|SCA|SCB|SCHMIDT|SCHULE|SCIENCE|SCOT|SERVICES|SEXY|SHIKSHA|SHOES|SINGLES|SOCIAL|SOFTWARE|SOHU|SOLAR|SOLUTIONS|SOY|SPACE|SPIEGEL|SUPPLIES|SUPPLY|SUPPORT|SURF|SURGERY|SUZUKI|SYDNEY|SYSTEMS|s[abcdeghijklmnortuvyz])" + \
	"|(?:TAIPEI|TATAR|TATTOO|TAX|TECHNOLOGY|TEL|TIENDA|TIPS|TIROL|TODAY|TOKYO|TOOLS|TOP|TOWN|TOYS|TRADE|TRAINING|TRAVEL|TUI|t[cdfghjklmnoprtvwz])" + \
	"|(?:UNIVERSITY|UNO|UOL|u[agkmsyz])" + \
	"|(?:VACATIONS|VEGAS|VENTURES|VERSICHERUNG|VET|VIAJES|VILLAS|VISION|VLAANDEREN|VODKA|VOTE|VOTING|VOTO|VOYAGE|v[aceginu])" + \
	"|(?:WALES|WANG|WATCH|WEBCAM|WEBSITE|WED|WEDDING|WHOSWHO|WIEN|WIKI|WILLIAMHILL|WME|WORK|WORKS|WORLD|WTC|WTF|w[fs])" + \
	"|(?:XXX|XYZ)" + \
	"|(?:YACHTS|YANDEX|YOGA|YOKOHAMA|YOUTUBE|y[etu])" + \
	"|(?:ZONE|ZIP|z[amw])))" + \
	"|(?:(?:25[0-5]|2[0-4]" + \
	"[0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\\.(?:25[0-5]|2[0-4][0-9]" + \
	"|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(?:25[0-5]|2[0-4][0-9]|[0-1]" + \
	"[0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}" + \
	"|[1-9][0-9]|[0-9])))" + \
	"(?:\\:\\d{1,5})?)" + \
	"(\\/(?:(?:[a-zA-Z0-9\\;\\/\\?\\:\\@\\&\\=\\#\\~" + \
	"\\-\\.\\+\\!\\*\\'\\(\\)\\,\\_])|(?:\\%[a-fA-F0-9]{2}))*)?" + \
	"(?:\\b|$)"