from typing import Final

from nanoid import non_secure_generate

from .bout import Bout

bouts: dict[str, Bout] = {}

# This is a list of words that should not be used when generating a Bout ID. This is
# mostly pulled from the page below, with some additions. I did not know some of these
# words (mostly the obscure slurs) and I am almost certain that there will be more words
# that will need to be added to the list. We will just have to add them as they are
# discovered. See: https://www.noswearing.com/fourletterwords.php
BAD_WORDS: Final[set[str]] = {
    string.upper()
    for string in [
        'ANUS',
        'ARSE',
        'ARZE',
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
        'DYKE',
        'FAGG',
        'FUCK',
        'FUCC',
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
        'TITZ',
        'TWAT',
        'TWIT',
        'WANG',
        'WANK',
    ]
}


def generate_bout_id() -> str:
    while True:
        bout_id: str = non_secure_generate('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4)
        if bout_id not in BAD_WORDS and bout_id not in bouts.keys():
            return bout_id


bouts[generate_bout_id()] = Bout('WFTDA 2025')
