# @cypher-swift/lib

A simple JS library for encrypting and decrypting binary data into Taylor Swift lyrics,
using a pre-determined cipher key.

## Overview

This readme can be treated as a specification document for Cypher Swift. The library code
has annotations to the relevant parts of the spec below for guidance. However let's be
real, I only wrote this for my own sanity while building the project.

Knock yourselves out however, it's a _real_ page turner.

## Terminology

| term                | definition                                                                 |
| ------------------- | -------------------------------------------------------------------------- |
| lyric index         | The index of a lyric in the master lyric file                              |
| bespoke lyric index | The index of a lyric relating to the cipher key, not the master lyric file |

## Magic bytes

| name                            | data type | value  | description                                           |
| ------------------------------- | --------- | ------ | ----------------------------------------------------- |
| cipher key _(version 1)_        | `uint8`   | `0x13` | Indicates a package structure is a cipher key type    |
| encrypted payload _(version 1)_ | `uint8`   | `0x69` | Indicates a package structure is an encrypted payload |

## Data structures

### Cypher key structure

| name           | data type  | offset | description                                                       |
| -------------- | ---------- | ------ | ----------------------------------------------------------------- |
| padding length | `uint8`    | `0x00` | The amount of padding bits used at the end of the final bit array |
| magic number   | `uint8`    | `0x01` | The magic number, used to validate the ciphered data              |
| binary data    | `uint10[]` | `0x02` | The array of bespoke lyric indices                                |

### Package structure

| name           | data type | offset | description                                                       |
| -------------- | --------- | ------ | ----------------------------------------------------------------- |
| padding length | `uint8`   | `0x00` | The amount of padding bits used at the end of the final bit array |
| magic number   | `uint8`   | `0x01` | The magic number, used to validate the ciphered data              |
| binary data    | `uint8[]` | `0x02` | The array of binary data to be encrypted                          |

### Encrypted structure

| name              | data type  | offset | description               |
| ----------------- | ---------- | ------ | ------------------------- |
| lyric index array | `uint10[]` | `0x00` | An array of lyric index's |

## Functions

### (1) Generate & encode a cipher key

1. Parse the master list of Taylor Swift lyrics provided in this project into an array
1. Clone the array of lyrics
   1. Shuffle the cloned array to generate new indices for each lyric
1. Create a new bit array, which will be a [cypher key structure](#cypher-key-structure)
   1. Write an empty padding length byte (we'll determine the padding length later)
   1. Write the cipher key magic byte to the magic byte offset
   1. Write all of the bespoke lyric indices to the bit array 
1. Calculate padding length of [cypher key structure](#cypher-key-structure) data structure
   1. `8 - (((2 * 8) + (lyricCount * 10)) % 8)` where `lyricCount` should be 1024
   1. Write this length as a byte to the padding length offset
   1. Write the amount of required random padding bits to the bit array
1. Convert the bit array to a `Uint8Array`
1. Encode the `Uint8Array` to a url-websafe base64 string

### (2) Decode a cipher key

1. Accept a url-websafe base64 encoded string
1. Decode the string into a `Uint8Array`
	1. Read the padding byte
	1. Read and validate the magic byte
1. Convert the `Uint8Array` to a bit array
1. Read though the bespoke lyric indices
   1. Use padding byte to know when to exit reading
1. Parse the master list of Taylor Swift lyrics provided in this project into an array
1. Read though bespoke lyric indices, use the master lyric list to get lyric values
1. Return a `string[]` of lyrics to index

### (3) Encrypt a payload

1. Decode the inputted cipher key
1. Accept an `Uint8Array` of binary data to be encrypted
1. Create a bit array, which will be a [package structure](#package-structure)
   1. Write an empty padding length byte (we'll determine the padding length later)
   1. Write the encrypted payload magic byte to the magic byte offset
   1. Write the inputted bytes from `3.1`
1. Calculate padding length of [package structure](#package-structure)
   1. `10 - (((2 * 8) + (length * 8)) % 10)` where `length` is the length of the array from `3.1`
   1. Write this length as a byte to the padding length offset
   1. Write this amount of required random padding bits to the bit array
1. Create an empty `string[]` to store the lyrics
1. Reset the offset position of the bit array to `0`
   1. Read though the bit array again, one `uint10` at a time
   1. Using the decoded cipher key, map the `uint10` value to a lyric
   1. Add random line breaks every 5-7 lines (artificial verses)
1. Return the lyrics as a string with formatting

### (4) Decrypt a payload

1. Decode the inputted cipher key
   1. Create inverse lookup map
1. Accept a `string` containing the encrypted payload as Taylor Swift lyrics
   1. Cleanup the string (trim whitespace, remove empty lines)
   1. Use the inverse lookup map to get the bespoke lyric indices
1. Create a bit array
   1. Write all lyric index's to it as `uint10`
1. Reset the offset position of the bit array to `0`
   1. Read the padding byte
   1. Read and validate the magic byte
1. Create a `Uint8Array` to store the extracted binary data
1. Seek to the start of the padding bits and set them all to `0`
1. Seek to the start of the [package structure](#package-structure) binary data
   1. Read though the data, using the padding byte to know to when to stop
1. Decode the byte data into a utf-8 string
1. Return the decrypted string
