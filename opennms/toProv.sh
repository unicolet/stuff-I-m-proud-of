#!/bin/bash
# Migrate existing opennms db to provisiond
#
# umberto.nicoletti at gmail.com
#

# this is the provisioning group to which the nodes will be added to
PROVGROUP="stampanti"

# don't migrate these services. This is mostly useful when importing
# routers, switches and the like and don't care about ssh, telnet, http, ecc
BLACKLIST_SERVICES="'HTTP','FTP','SMTP','NSClient','StrafePing','NSClientpp','HP Insight Manager','Windows-Task-Scheduler','NRPE-NoSSL','NRPE','Telnet','SSH','HTTP-8080','HTTP-8000','Dell-OpenManage'"

# always add these services: for instance in the new opennms instance you have enabled 
# WMI monitoring and want to automatically add new services to the imported nodes
ADD_SERVICES=""

# a valid sql where condition. Filter is only valid to the node table (aliased n) 
NODE_FILTER="and n.nodelabel like 'NP%'"
#NODE_FILTER="and n.nodesysoid='.1.3.6.1.4.1.311.1.1.3.1.2'"
#NODE_FILTER="and n.nodeid=471"

# the host where the postgres db is running. The script will prompt for the password
# if the user runinng the script is not 'trusted'
DB_HOST=127.0.0.1

###############################
# do not modify below this line

export PROVGROUP

function sql() {
	echo $1 | psql -A -t -h ${DB_HOST} -U opennms opennms;
}

listnodes="select n.nodeid,n.nodelabel from node n where 1=1 ${NODE_FILTER};"
listinterfaces="select n.nodeid,i.id,i.ipaddr,i.issnmpprimary from ipinterface i,node n where n.nodeid=i.nodeid and i.ipaddr<>'0.0.0.0' ${NODE_FILTER};"
listservices="select n.nodeid,s.servicename,i.ipaddr from service s, ifservices iss, ipinterface i, node n where s.serviceid=iss.serviceid and iss.ipinterfaceid=i.id and i.nodeid=n.nodeid and s.servicename not in (${BLACKLIST_SERVICES}) ${NODE_FILTER};"
listcategories="select n.nodeid, c.categoryname from category_node cn, categories c, node n where n.nodeid=cn.nodeid and c.categoryid=cn.categoryid ${NODE_FILTER};"
assetscolumnslist="select array_to_string(array(SELECT CASE WHEN attname='comment' THEN 'replace(a.'||attname||',''\\\\r\\\\n'',''~'')' ELSE 'a.'||attname END FROM pg_class c join pg_attribute a on c.oid = a.attrelid WHERE c.relname = 'assets' AND a.attnum >= 0 and attname not like '%id' order by attnum asc),',');"

nodes=`sql "$listnodes"`

for node in $nodes ; do
	echo $node | awk -F"|" '{printf("/opt/opennms/bin/provision.pl node add %s %s %s\n", ENVIRON["PROVGROUP"], $1, $2);}';
done

interfaces=`sql "$listinterfaces"`
for interface in $interfaces ;  do
	echo $interface | awk -F"|" '{printf("/opt/opennms/bin/provision.pl interface add %s %s %s\n", ENVIRON["PROVGROUP"], $1, $3);}';
	echo $interface | awk -F"|" '{printf("/opt/opennms/bin/provision.pl interface set %s %s %s snmp-primary %s\n", ENVIRON["PROVGROUP"], $1, $3, $4);}';
	if [[ "$interface" =~ "|P\$" ]]; then
		for svc in ${ADD_SERVICES}; do
			export svc
			echo $interface | awk -F"|" '{printf("/opt/opennms/bin/provision.pl service add %s %s %s %s\n", ENVIRON["PROVGROUP"], $1, $3, ENVIRON["svc"])}'
		done
		unset svc
	fi
done

services=`sql "$listservices"`
for s in $services ; do
	echo $s | awk -F"|" '{printf("/opt/opennms/bin/provision.pl service add %s %s %s %s\n", ENVIRON["PROVGROUP"], $1, $3, $2)}'
done


categories=`sql "$listcategories"`
for c in $categories ; do
	echo $c | awk -F"|" '{printf("/opt/opennms/bin/provision.pl category add %s %s %s\n", ENVIRON["PROVGROUP"], $1, $2)}'
done

assetscolumns=`sql "$assetscolumnslist"`
i=2
IFS=$','
for c in ${assetscolumns} ; do
	if [[ "$c" =~ "a\." ]]; then
		tmp=`echo $c | sed "s/.*a\.\([a-zA-Z]*\).*/\1/"`
		eval "export COL${i}='$tmp'"
		((i++))	
	fi
done
unset IFS
listassets="select n.nodeid, ${assetscolumns} from assets a, node n where n.nodeid=a.nodeid ${NODE_FILTER};"
assets=`sql "$listassets"`
echo ${assets} > assets.txt
IFS=$'\n'
for a in $assets ; do
	echo $a | awk -F"|" '{for(i=2;i<=NF;i++) { if($i!="" && $i!=" ") { printf("/opt/opennms/bin/provision.pl asset add %s %s %s \"%s\"\n", ENVIRON["PROVGROUP"], $1, ENVIRON["COL"i], $i); } } }'
done
unset IFS

