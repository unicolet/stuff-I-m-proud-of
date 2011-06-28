#!/bin/bash
#
# This script will generate sql create and insert scripts from a .MDB
# database.
# The sql scripts can then be used to migrate tables and data to a database
# like postgres or oracle.
#
# Requires: mdbtools and perl
#
# (c) Umberto Nicoletti umberto.nicoletti at gmail.com
#

TARGETMDB=$1
# set TARGETDB to oracle for create table with oracle syntax
TARGETDB=postgres

if [ ! -e "$TARGETMDB" ]; then
	echo "$TARGETMDB does not exist or is not readable."
	echo "Usage: $0 path_to_mdb/file.mdb"
	exit 1
fi


TABLES=`mdb-tables -1 ${TARGETMDB} `
for t in $TABLES ; do
	mdb-schema -T ${t} ${TARGETMDB} ${TARGETDB} > ${t}.tmp1
	mdb-export -I ${TARGETMDB} ${t} > ${t}.tmp
	perl -pi -e "s/\)$/\);/" ${t}.tmp
	perl -pi -e "s/\"/\'/g" ${t}.tmp
	cat ${t}.tmp1 ${t}.tmp > ${t}.sql
	rm -f  ${t}.tmp  ${t}.tmp1
done

