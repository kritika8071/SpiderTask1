#CryptoVault documentation

##Caeser cipher implementation 
    - In caeser cipher, we shift all the characters in a word by a specific shift      number. Characters and numbers remain unchanged. Also there can be only 25 possible keys, as any key greater than it will hv an equivalent shift number between 1 and 25. For example, 27 is equivalent to shift by one. Shift by 26 means no shift at all. It is trivially breakable because we can just test out all the possibilities or use frequency analysis.
    Frequency analysis works because some letters occur more often than the others like A, T, E, on the other hand words like X, Z, etc are very less common.

##Hash Guard
    - We need encryption so that our data cannot be read and stays private, on the other hand hashing is need to ensure that our data has not been altered by attackers. A very little change makes the hash look completely different.

    