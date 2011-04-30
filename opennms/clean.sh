#!/bin/bash

grep -v "userlastmodified" $1 > $1.tmp
grep -v "lastmodifieddate" $1.tmp > $1.tmp2

cat $1.tmp2 | sed "s/displaycategory/displayCategory/" > $1.tmp
cat $1.tmp | sed "s/pollercategory/pollerCategory/" > $1.tmp2

cat $1.tmp2 | sed "s/maintcontract/maintContractNumber/" > $1.tmp
cat $1.tmp | sed "s/maintcontractexpires/maintContractExpiration/" > $1.tmp2

cat $1.tmp2 | sed "s/dateinstalled/dateInstalled/" > $1.tmp
cat $1.tmp | sed "s/modelnumber/modelNumber/" > $1.tmp2

cat $1.tmp2 | sed "s/serialnumber/serialNumber/" > $1.tmp
cat $1.tmp | sed "s/operatingsystem/operatingSystem/" > $1.tmp2

mv $1.tmp2 $1
rm -f $1.tmp $1.tmp2
