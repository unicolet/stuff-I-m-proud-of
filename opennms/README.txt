These scripts can be used to successfully migrate an existing
opennms database to a new provisioning configuration.

They require minimum *nix skills, but they are not by any means foolproof.
Send comments, suggestions and patches to my email address (below)
or the opennms discuss ML.

Usage
-----

Adjust the toProv.sh script to your needs.
Then run it and redirect the output to a file:

./toProv.sh > filename

Have a look at the file and then (if you have assets information)
run it through the clean.sh script:

./clean.sh filename

The result is a script that can be run against the new opennms instance
to load the nodes in a provisioning configuration:

bash filename

When the script has finished you can synchronize the new group
from the web console.
If syncing does not work, look in the provision.log file for errors
(if you don't see errors raise the logging level to DEBUG).
In my case the errors were mostly due to incorrect capitalization
of asset information (the clean.sh script tries to fix that,
but it could be that I left out something).

Know issues
-----------

Newline in asset comments will be replaced by ~ 


2011/umberto.nicoletti_at_gmail.com/
