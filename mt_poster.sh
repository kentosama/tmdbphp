#!/bin/bash
# MediaTomb Thumbnail display script by Lucas van Staden (lvs@dedmeet.com)
# Updates fro this script can be found on www.dedmeet.com
# Used by MediaTomb to build a thumbnail for display to the client
# depends on ffmpegthumbnailer

# EDIT THE LINE BELOW AND PLACE YOUR POSTER PATH
POSTERPATH="/mnt/HD/HD_a2/videos/films/.posters"

# YOU SHOULD NOT NEED TO EDIT BELOW THIS LINE, BUT YOU CAN IF YOU WANT TO IMPROVE THINGS :)
FILE=$(basename "$1");
FILE=${FILE%.*}
echo 'FILE:' $FILE;
cp "$POSTERPATH/$FILE.jpg" $2

