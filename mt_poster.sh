#!/bin/bash

POSTERPATH="/mnt/HD/HD_a2/videos/films/.posters"

FILE=$(basename "$1");
FILE=${FILE%.*}
echo 'FILE:' $FILE;
cp "$POSTERPATH/$FILE.jpg" $2

