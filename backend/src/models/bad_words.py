"""
This is a list of words that should not be used when generating a Bout ID. This is
mostly pulled from the page below, with some additions. I did not know some of these
words (mostly the obscure slurs) and I am almost certain that there will be more words
that will need to be added to the list. We will just have to add them as they are
discovered.

See: https://www.noswearing.com/fourletterwords.php
"""

from typing import Final

# spell-checker: disable
BAD_WORDS: Final[set[str]] = {
    string.upper()
    for string in [
        'ANUS',
        'ARSE',
        'ARZE',
        'ASSS',
        'BOOB',
        'CHUB',
        'CLIT',
        'COCK',
        'COON',
        'CUMM',
        'CUNT',
        'DAGO',
        'DAMN',
        'DICK',
        'DIKE',
        'DONG',
        'DYKE',
        'FAGG',
        'FART',
        'FUCK',
        'FUCC',
        'FUKK',
        'GOOK',
        'GOON',
        'HEEB',
        'HELL',
        'HOMO',
        'JIZZ',
        'KIKE',
        'KUNT',
        'KYKE',
        'MICK',
        'MUFF',
        'NAZI',
        'PAKI',
        'PISS',
        'POON',
        'PUTO',
        'PUTA',
        'SEXX',
        'SEXY',
        'SHIT',
        'SHIZ',
        'SLUT',
        'SMEG',
        'SPIC',
        'TARD',
        'TITS',
        'TITY',
        'TITZ',
        'TWAT',
        'TWIT',
        'WANG',
        'WANK',
    ]
}
# spell-checker: enable
"""
A set of inappropriate, four-letter words in upper-case that should not be used when
generating a Bout ID.
"""
